// services/soundService.ts

// A simple audio manager for the game.

// Store audio elements to avoid recreating them.
const audioCache: { [key: string]: HTMLAudioElement } = {};
// Store which sounds are currently playing to manage them.
const currentlyPlaying: { [key: string]: HTMLAudioElement } = {};

let audioContext: AudioContext | null = null;
let isAudioInitialized = false;

// A manifest of sound files. In a real project, this might come from a config file.
// Assuming a folder structure like public/sfx/...
// These paths are placeholders and would need actual sound files.
const soundManifest: { [key: string]: string } = {
    bgm: '/sfx/bgm_ambient.mp3',
    choice_confirm: '/sfx/choice_confirm.wav',
    ui_click: '/sfx/ui_click.wav',
    typewriter_loop: '/sfx/typewriter_loop.wav',
    level_up: '/sfx/level_up.wav',
    item_get: '/sfx/item_get.wav',
    player_hit: '/sfx/player_hit.wav',
    enemy_hit: '/sfx/enemy_hit.wav',
};

/**
 * This function must be called after a user interaction (e.g., a button click)
 * to comply with modern browser autoplay policies. It creates the AudioContext.
 */
export const initializeAudio = (): void => {
    if (isAudioInitialized) {
        return;
    }
    try {
        // Create AudioContext
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        // A simple "unlock" trick for iOS Safari
        const source = audioContext.createBufferSource();
        source.buffer = audioContext.createBuffer(1, 1, 22050);
        source.connect(audioContext.destination);
        source.start(0);
        isAudioInitialized = true;
        console.log("Audio context initialized.");
    } catch (e) {
        console.error("Could not initialize audio context:", e);
    }
};

/**
 * Gets a cached or new HTMLAudioElement for a given sound.
 * @param sound - The key of the sound from the soundManifest.
 * @param loop - Whether the audio should loop.
 * @returns An HTMLAudioElement or null if the sound is not found.
 */
const getAudioElement = (sound: string, loop: boolean = false): HTMLAudioElement | null => {
    const src = soundManifest[sound];
    if (!src) {
        console.warn(`Sound "${sound}" not found in manifest.`);
        return null;
    }

    if (audioCache[sound]) {
        // Update loop status if it has changed
        audioCache[sound].loop = loop;
        return audioCache[sound];
    }
    
    const audio = new Audio(src);
    audio.loop = loop;
    audioCache[sound] = audio;
    return audio;
};

/**
 * Plays a sound.
 * @param sound - The key of the sound to play.
 * @param loop - Whether the sound should loop. Defaults to false.
 */
export const playSound = (sound: string, loop: boolean = false): void => {
    if (!isAudioInitialized) {
        // It's common to try and play a sound before user interaction.
        // We'll warn but not throw an error.
        console.warn("Audio not initialized. Call initializeAudio() on a user gesture.");
        return;
    }

    const audio = getAudioElement(sound, loop);
    if (audio) {
        // For looping sounds (like BGM), don't restart if already playing.
        if (loop && currentlyPlaying[sound] && !audio.paused) {
            return;
        }

        // For one-shot sounds, restart from the beginning.
        audio.currentTime = 0;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                currentlyPlaying[sound] = audio;
                // Clean up from 'currentlyPlaying' when the sound finishes
                if (!loop) {
                    audio.onended = () => {
                        delete currentlyPlaying[sound];
                    };
                }
            }).catch(error => {
                // Auto-play was prevented. This can happen if the context is lost.
                console.error(`Could not play sound "${sound}":`, error);
            });
        }
    }
};

/**
 * Stops a sound from playing.
 * @param sound - The key of the sound to stop.
 */
export const stopSound = (sound: string): void => {
    const audio = currentlyPlaying[sound] || audioCache[sound];
    if (audio) {
        audio.pause();
        audio.currentTime = 0; // Rewind to the start
        if(currentlyPlaying[sound]) {
            delete currentlyPlaying[sound];
        }
    }
};
