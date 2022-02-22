import React, { useContext, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { ThemeContext } from '../../constants/ThemeContext';
import { Client } from '../../../../packages/global';
import { RootStackParamList } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ssoUrl } from '@area/services';

type Props = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;

function SpotifyTriggerSSO({ SSOData }: { SSOData: ssoUrl }) {
    // console.log('SSOData', SSOData);
    const [$request, response, promptAsync] = useAuthRequest(
        {
            clientId: SSOData.client_id,
            redirectUri: SSOData.redirect_uri,
            scopes: SSOData.scopes,
        },
        {
            authorizationEndpoint: SSOData.base_url,
        },
    );

    const [code, setCode] = useState('');

    const triggerSSO = async () => {
        try {
            console.log('trigger');
            await promptAsync();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    useEffect(() => {
        console.log('got response');
        if (response && response.type === 'success') {
            console.log('valid reponse');
            setCode(response.params.code);
        }
    }, [response]);

    useEffect(() => {
        if (code) {
            console.log('got code');
            (async () => {
                const token = await Client.sso.spotifyAuthCodeSso(code, SSOData.redirect_uri);
                console.log(token);
                Alert.alert(`Welcome`);
            })();
        }
    }, [code]);

    if (!SSOData.url) {
        return null;
    }

    return (
        <View>
            <TouchableOpacity onPress={triggerSSO}>
                <Text>Login with Spotify</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { theme } = useContext(ThemeContext);

    async function makeRequest() {
        try {
            const res = await Client.authentication.login({ email: email, password: password });
            console.log(res);
            navigation.navigate('HomePage');
        } catch (e) {
            Alert.alert('Wrong email or wrong password');
            console.log(e);
        }
    }

    const [SSOData, setSSOData] = useState<ssoUrl>({
        response_type: '',
        scope: '',
        url: '',
        client_id: '',
        redirect_uri: 'com.spotify.music://',
        base_url: '',
    });

    // create redirect uri
    const redirectURI = makeRedirectUri({
        native: 'myapp://redirect',
    });

    Client.sso.spotifyConsentSso(redirectURI).then((data: ssoUrl) => {
        setSSOData(data);
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.primary }]}>
            <SpotifyTriggerSSO SSOData={SSOData} />
            <View style={[styles.inputView, { backgroundColor: theme.secondary }]}>
                <TextInput
                    style={[styles.TextInput, { color: theme.text }]}
                    placeholder="email"
                    placeholderTextColor={theme.textPlaceholder}
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(email) => setEmail(email)}
                />
            </View>

            <View style={[styles.inputView, { backgroundColor: theme.secondary }]}>
                <TextInput
                    style={[styles.TextInput, { color: theme.text }]}
                    placeholder="password"
                    placeholderTextColor={theme.textPlaceholder}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={(password) => setPassword(password)}
                />
            </View>

            <TouchableOpacity>
                <Text style={[styles.forgot_button, { color: theme.text }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: theme.accent }]}
                onPress={() => makeRequest()}>
                <Text style={{ color: theme.text }}>LOGIN</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    image: {
        marginBottom: 40,
    },

    inputView: {
        borderRadius: 30,
        width: '70%',
        height: 45,
        marginBottom: 20,
        alignItems: 'center',
    },

    TextInput: {
        height: 50,
        flex: 1,
        padding: 10,
    },

    forgot_button: {
        height: 30,
        marginBottom: 30,
    },

    loginBtn: {
        width: '80%',
        borderRadius: 25,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
});
