// @ts-nocheck
import { Track } from './playerManager.tools';
import 'puppeteer-stream';
import { EventEmitter } from 'events';
import path from 'path';
import { getStream, launch, Stream } from 'puppeteer-stream';
import axios from 'axios';
import { AudioPlayer } from './AudioPlayer';
import { Browser, Page } from 'puppeteer';

const domFile = `file://${path.join(__dirname, 'playerDOM', 'spotify.html')}`;

declare global {
    // eslint-disable-next-line no-unused-vars
    interface Window {
        player: any;
        ELEVATE: ($eventName: string, $data: any) => boolean;
    }
}

export default class SpotifyAudioPlayer extends AudioPlayer {
    // Todo:
    //  - is play on this device ?

    private deviceId: string | undefined;
    private eventManager: EventEmitter = new EventEmitter();
    private page: Page | undefined;
    private browser: Browser | undefined;

    constructor(token: string) {
        super(token);
        this.token = token;
        console.log('SpotifyAudioPlayer', token);

        // todo: bind events from eventManager to super

        this.init();
    }

    private async init() {
        await this.initPuppeteer(domFile);
        await this.initSpotify();
        await this.elevateEvents();
        await this.connectDevice();
    }

    // Todo: pass this in a AudioPlayer
    private async initPuppeteer(domPath: string) {
        console.log('[initPuppeteer] Starting browser');
        const browser = await launch({
            defaultViewport: {
                width: 1280,
                height: 720,
            },
        });
        console.log('[initPuppeteer] Starting page');
        const page = await browser.newPage();
        console.log('[initPuppeteer] Loading page');
        await page.goto(domPath);

        this.browser = browser;
        this.page = page;
        console.log('[initPuppeteer] Done');
    }

    private async initSpotify() {
        console.log('[initSpotify] Starting Spotify Player');
        console.log(this.token);
        await this.page?.evaluate((token) => console.log(token), this.token);
        await this.page.evaluate(
            (token: string) =>
                // @ts-ignore
                // eslint-disable-next-line no-undef
                (window.player = new Spotify.Player(
                    {
                        name: 'Spotify Audio Player',
                        getOAuthToken: (cb: ($arg: any) => void) => {
                            cb(token);
                        },
                    },
                    token,
                )),
            this.token,
        );

        console.log('[initSpotify] Connecting Spotify Player');
        await this.page.evaluate(() => {
            window.player.connect(); // Todo Error here
        });
        console.log('[initSpotify] Done');
    }

    private async elevateEvents() {
        // const self = this;
        const { eventManager } = this;

        console.log('[elevateEvents] Exposing elevate function');
        await this.page.exposeFunction('ELEVATE', (event: string, data: any) => {
            eventManager.emit(event, data);
        });

        console.log('[elevateEvents] Setting up events');
        await this.page.evaluate(() => {
            const events = [
                'ready',
                'not_ready',
                'player_state_changed',
                'initialization_error',
                'authentication_error',
                'account_error',
                'playback_error',
            ];
            if (window.ELEVATE) {
                events.forEach((event) => {
                    console.log(event);
                    window.player.addListener(event, window.ELEVATE.bind(null, event));
                    window.player.addListener(event, console.log);
                });
            }
        });
        console.log('[elevateEvents] Done');
    }

    private async connectDevice() {
        console.log('[connectDevice] Getting deviceID');
        const deviceId = new Promise((resolve) => {
            this.eventManager.once('ready', ({ device_id }) => {
                resolve(device_id);
            });
            ['not_ready', 'initialization_error', 'authentication_error', 'account_error', 'playback_error'].forEach(
                (event) => {
                    this.eventManager.on(event, (error) => {
                        console.log('Error: ', error);
                        throw new Error(error);
                    });
                },
            );
        });
        await new Promise((r) => setTimeout(r, 1000));
        console.log('[connectDevice] Connecting device');
        await this.page.evaluate(() => {
            window.player.connect();
        });
        console.time('[connectDevice] Waiting for deviceID');
        await deviceId;
        console.timeEnd('[connectDevice] Waiting for deviceID');
        this.deviceId = deviceId.toString();
        console.log('[connectDevice] DeviceID:', this.deviceId);
    }

    public override getStream(): Promise<Stream> {
        if (!this.page) {
            throw new Error('Page not initialized');
        }

        return getStream(this.page, {
            audio: true,
            video: false,
            frameSize: 20,
            mimeType: 'audio/webm',
        });
    }

    override async playTrack(track: Track) {
        if (this.state === 'unknown') {
            console.log('[playTrack] Waiting for ready event');
            await new Promise((resolve) => {
                this.eventManager.once('ready', resolve);
                [
                    'not_ready',
                    'initialization_error',
                    'authentication_error',
                    'account_error',
                    'playback_error',
                ].forEach((event) => {
                    this.eventManager.on(event, (error) => {
                        console.log('[playTrack] Error: ', error);
                        throw new Error(error);
                    });
                });
            });
        }
        if (track.provider !== 'spotify') {
            throw new Error('Track provider is not spotify');
        }
        if (!this.deviceId) {
            throw new Error('Device id not set');
        }
        console.log('[playTrack] Playing track');
        // Todo: this will reset the player device
        const url = `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`;
        const data = {
            uris: [track.id],
        };
        await axios.put(url, data);
    }

    override async resumeTrack() {
        if (!this.page) {
            throw new Error('No page');
        }
        return this.page.evaluate(() => {
            return window.player.resume();
        });
    }

    override async pauseTrack() {
        if (!this.page) {
            throw new Error('No page');
        }
        return this.page.evaluate(() => {
            return window.player.pause();
        });
    }

    override async stopTrack() {
        if (!this.page) {
            throw new Error('No page');
        }
        return this.page.evaluate(() => {
            return window.player.disconnect();
        });
    }

    override async seekTrack(time: number) {
        if (!this.page) {
            throw new Error('No page');
        }
        return this.page.evaluate((pos: any) => {
            return window.player.seek(pos);
        }, time);
    }
}
