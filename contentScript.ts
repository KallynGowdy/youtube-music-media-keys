interface MediaSession {
    metadata: MediaMetadata;
    playbackState: 'none' | 'paused' | 'playing';
    setActionHandler(
        name: 'play' | 'pause' | 'previoustrack' | 'nexttrack',
        handler: Function
    ): void;
}

declare class MediaMetadata {
    constructor(options?: MediaMetadataOptions);
    title: string;
    artist: string;
    album: string;
    artwork: MediaImage[];
}

interface MediaMetadataOptions {
    title: string;
    artist: string;
    album: string;
    artwork: MediaImage[];
}

interface MediaImage {
    src: string;
    sizes: '96x96';
    type: 'image/png' | 'image/jpeg';
}

let mediaSession = (<any>navigator).mediaSession as MediaSession;

init().catch((err) => {
    console.error('[MediaKeys] Error during init:', err);
});

async function init() {
    await waitForLoad();
    console.log('[MediaKeys] Loaded!');

    mediaSession.metadata = new MediaMetadata();

    setInterval(() => {
        const info = getPlayerInfo();
        if (info.state === 'playing') {
            mediaSession.playbackState = 'playing';
        } else if (info.state === 'paused') {
            mediaSession.playbackState = 'paused';
        } else {
            mediaSession.playbackState = 'none';
        }

        if (info.title && info.artist && info.album && info.artwork) {
            if (
                mediaSession.metadata?.title !== info.title ||
                mediaSession.metadata?.album !== info.album ||
                mediaSession.metadata?.artist !== info.artist
            ) {
                mediaSession.metadata.title = info.title;
                mediaSession.metadata.album = info.album;
                mediaSession.metadata.artist = info.artist;
                mediaSession.metadata.artwork = [
                    { src: info.artwork, sizes: '96x96', type: 'image/jpeg' },
                ];

                mediaSession.setActionHandler('play', () => {
                    console.log('[MediaKeys] Play!');
                    const playPauseButton = document.querySelector(
                        'ytmusic-player-bar #play-pause-button'
                    ) as HTMLElement;
                    playPauseButton?.click();
                });

                mediaSession.setActionHandler('pause', () => {
                    console.log('[MediaKeys] Pause!');
                    const playPauseButton = document.querySelector(
                        'ytmusic-player-bar #play-pause-button'
                    ) as HTMLElement;
                    playPauseButton?.click();
                });

                mediaSession.setActionHandler('previoustrack', () => {
                    console.log('[MediaKeys] Previous Track!');
                    const previousButton = document.querySelector(
                        'ytmusic-player-bar .previous-button'
                    ) as HTMLElement;
                    previousButton?.click();
                });
                mediaSession.setActionHandler('nexttrack', () => {
                    console.log('[MediaKeys] Next Track!');
                    const nextButton = document.querySelector(
                        'ytmusic-player-bar .next-button'
                    ) as HTMLElement;
                    nextButton?.click();
                });
            }
        }
    }, 100);
}

interface PlayerInfo {
    state: PlayerState;
    title?: string;
    artist?: string;
    album?: string;
    artwork?: string;
}

type PlayerState = 'playing' | 'paused' | 'stopped';

function waitForLoad(): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const app: any = document.querySelector('ytmusic-app');
            if (!app) {
                waitForLoad().then(() => resolve());
            } else {
                resolve();
            }
        }, 10);
    });
}

function getPlayerInfo(): PlayerInfo {
    const playerBar: any = document.querySelector('ytmusic-player-bar');
    let state: PlayerState = 'stopped';
    if (!playerBar) {
        return {
            state,
        };
    }
    const playButton: any = playerBar.querySelector('#play-pause-button');

    const playButtonTitle = playButton.getAttribute('title');
    if (/play/gi.test(playButtonTitle)) {
        state = 'paused';
    } else if (/pause/gi.test(playButtonTitle)) {
        state = 'playing';
    }

    const middleBar = playerBar.querySelector('div.middle-controls');
    const contentInfoWrapper = middleBar?.querySelector(
        'div.content-info-wrapper'
    );

    const imageElement = middleBar?.querySelector('img.image');
    const artwork = imageElement?.getAttribute('src');

    const titleElement = contentInfoWrapper?.querySelector(
        'yt-formatted-string.title'
    );
    const title = titleElement?.getAttribute('title');

    const bylineWrapper = contentInfoWrapper?.querySelector(
        'span.byline-wrapper'
    );
    const bylineElement = bylineWrapper?.querySelector(
        'yt-formatted-string.byline.complex-string'
    );
    const [artistElement, albumElement] =
        bylineElement?.querySelectorAll('a.yt-formatted-string') || [];

    const artist = artistElement?.textContent;
    const album = albumElement?.textContent;

    return {
        state,
        title,
        artist,
        album,
        artwork: artwork,
    };
}
