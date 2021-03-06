import { ServiceUserData, SSOController } from '../../../../tools/types';
import { Request, Response } from 'express';
import configuration from '../../../../../configuration';
import { GoogleTools } from '../../../../tools/SSO/google.tools';
import { generateToken } from '../../../../tools/auth.tools';
import { createUser, findUserByService, linkService, updateToken } from '../../../../tools/SSO/sso.tool';
import { User } from '../../../../../../../packages/services';

export default class GoogleController extends SSOController {
    static clientId: string = configuration.googleClientId;
    static clientSecret: string = configuration.googleClientSecret;
    static redirectURL: string = configuration.frontendHost;
    static callbackURL: string = configuration.googleRedirectUri;
    static scope: string = configuration.googleScopes;

    static async getCode(req: Request, res: Response): Promise<void> {
        // redirect to google for authentication
        // callback url sends to /api/auth/google/callback

        const { callbackURL } = req.query;

        const params = {
            client_id: GoogleController.clientId,
            redirect_uri: callbackURL || GoogleController.callbackURL,
            scope: GoogleController.scope,
            response_type: 'code',
            // access_type: 'offline',
            // prompt: 'consent',
        };
        // @ts-ignore
        const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params)}`;
        res.json({ url, ...params, base_url: 'https://accounts.google.com/o/oauth2/v2/auth' });
    }

    static async getToken(req: Request, res: Response): Promise<void> {
        // get token, create user and return token
        try {
            const { code, callbackURL } = req.query;
            const { user: sessionUser } = req.session;
            if (!code || typeof code !== 'string') {
                throw new Error('No code provided');
            }
            const SSOToken = await GoogleTools.getToken(code, (callbackURL as string) || GoogleController.callbackURL);
            const user: ServiceUserData = await GoogleTools.getUserInfos(SSOToken.access_token);
            let userData: User & any = await findUserByService('google', user.id);

            if (userData) {
                await updateToken(userData, user, SSOToken);
            } else if (sessionUser) {
                await linkService(sessionUser, user, SSOToken);
                userData = sessionUser;
            } else {
                userData = await createUser(user.displayName, user.email, '', 'SSO');
                await linkService(userData, user, SSOToken);
            }

            delete userData.password;
            delete userData.iat;
            delete userData.exp;
            const token = generateToken(userData);
            res.status(200).json({ token });
        } catch (e) {
            if ((e as any).code === '23505') {
                res.status(409).json({
                    message: 'Account already assigned to another user',
                });
            } else {
                res.status(500).send(e);
            }
        }
    }
}
