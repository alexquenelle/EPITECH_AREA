import { Request, Response } from 'express';
import { Providers } from '../../../tools/types';
import { SpotifyPlaylistService, PlaylistService } from './playlist.service';

const servicesList: {
    [provider: string]: PlaylistService;
} = {
    [Providers.SPOTIFY]: SpotifyPlaylistService,
};

export default class PlaylistsController {
    static async getAll(req: Request, res: Response) {
        if (!req.session.local.service) {
            return res.status(400).json({
                error: 'No service selected',
            });
        }
        const { service } = req.session.local.service;
        const serviceInstance: PlaylistService = servicesList[service];
        if (!serviceInstance) {
            return res.status(400).json({
                error: 'Service not found',
            });
        }
        // @ts-ignore todo: fix this
        const fn = serviceInstance.getPlaylists;
        const playlists = await fn(req.session.local.service.accessToken);
        return res.json(playlists);
    }

    static async getOne(req: Request, res: Response) {
        if (!req.session.local.service) {
            return res.status(400).json({
                error: 'No service selected',
            });
        }
        const { service } = req.session.local.service;
        const serviceInstance: PlaylistService = servicesList[service];
        if (!serviceInstance) {
            return res.status(400).json({
                error: 'Service not found',
            });
        }
        // @ts-ignore todo: fix this
        const fn = serviceInstance.getPlaylist;
        const playlist = await fn(req.session.local.service.accessToken, req.params.id);
        return res.json(playlist);
    }

    static async getTracks(req: Request, res: Response) {
        if (!req.session.local.service) {
            return res.status(400).json({
                error: 'No service selected',
            });
        }
        const { service } = req.session.local.service;
        const serviceInstance: PlaylistService = servicesList[service];
        if (!serviceInstance) {
            return res.status(400).json({
                error: 'Service not found',
            });
        }
        // @ts-ignore todo: fix this
        const fn = serviceInstance.getPlaylistTracks;
        const tracks = await fn(req.session.local.service.accessToken, req.params.id);
        return res.json(tracks);
    }

    static async create(req: Request, res: Response) {
        if (!req.session.local.service) {
            return res.status(400).json({
                error: 'No service selected',
            });
        }
        const { service } = req.session.local.service;
        const serviceInstance: PlaylistService = servicesList[service];
        if (!serviceInstance) {
            return res.status(400).json({
                error: 'Service not found',
            });
        }
        // @ts-ignore todo: fix this
        const fn = serviceInstance.createPlaylist;
        const playlist = await fn(req.session.local.service.accessToken, req.body.name);
        return res.json(playlist);
    }

    static async update(req: Request, res: Response) {
        if (!req.session.local.service) {
            return res.status(400).json({
                error: 'No service selected',
            });
        }
        const { service } = req.session.local.service;
        const serviceInstance: PlaylistService = servicesList[service];
        if (!serviceInstance) {
            return res.status(400).json({
                error: 'Service not found',
            });
        }
        // @ts-ignore todo: fix this
        const fn = serviceInstance.updatePlaylist;
        const playlist = await fn(req.session.local.service.accessToken, req.params.id, req.body.name);
        return res.json(playlist);
    }

    static async delete(req: Request, res: Response) {
        if (!req.session.local.service) {
            return res.status(400).json({
                error: 'No service selected',
            });
        }
        const { service } = req.session.local.service;
        const serviceInstance: PlaylistService = servicesList[service];
        if (!serviceInstance) {
            return res.status(400).json({
                error: 'Service not found',
            });
        }
        // @ts-ignore todo: fix this
        const fn = serviceInstance.deletePlaylist;
        const playlist = await fn(req.session.local.service.accessToken, req.params.id);
        return res.json(playlist);
    }
}