// services/soundService.ts
import { soundManifest } from '../core/soundManifest';

type SfxKey = keyof typeof soundManifest.sfx;
type BgmKey = keyof typeof soundManifest.bgm;

class SoundService {
    private bgmPlayer: HTMLAudioElement | null = null;
    private sfxPool: HTMLAudioElement[] = [];
    private sfxPoolIndex = 0;
    private isInitialized = false;
    private currentBgm: BgmKey | null = null;
    private isFading = false;

    constructor() {
        if (typeof window !== 'undefined') {
            // Inisialisasi ditunda hingga interaksi pengguna pertama
        }
    }
    
    // Dipanggil pada interaksi pengguna pertama (misalnya, mengklik 'Mulai Game')
    initialize() {
        if (this.isInitialized || typeof window === 'undefined') return;
        
        this.bgmPlayer = document.getElementById('bgm-player') as HTMLAudioElement;
        if (!this.bgmPlayer) {
            console.error('Elemen pemutar BGM tidak ditemukan!');
            return;
        }
        
        // Buat pool elemen audio untuk SFX
        for (let i = 0; i < 10; i++) {
            const audio = new Audio();
            audio.volume = 0.7; // Atur volume SFX global
            this.sfxPool.push(audio);
        }
        
        this.isInitialized = true;
    }

    playSfx(key: SfxKey) {
        if (!this.isInitialized) return;
        try {
            const audio = this.sfxPool[this.sfxPoolIndex];
            audio.src = soundManifest.sfx[key];
            audio.play().catch(e => {}); // Abaikan interupsi promise
            this.sfxPoolIndex = (this.sfxPoolIndex + 1) % this.sfxPool.length;
        } catch (e) {
            console.error(`Error memutar kunci SFX "${key}":`, e);
        }
    }

    playBgm(key: BgmKey) {
        if (!this.isInitialized || !this.bgmPlayer || this.currentBgm === key || this.isFading) return;
        
        this.currentBgm = key;
        const player = this.bgmPlayer;
        const targetVolume = 0.4;

        if (player.src && !player.paused) {
            this.isFading = true;
            let currentVolume = player.volume;
            const fadeOutInterval = setInterval(() => {
                currentVolume -= 0.05;
                if (currentVolume > 0) {
                    player.volume = currentVolume;
                } else {
                    clearInterval(fadeOutInterval);
                    player.pause();
                    player.src = soundManifest.bgm[key];
                    player.load();
                    const promise = player.play();
                    if(promise !== undefined) {
                        promise.then(_ => {
                            let newVolume = 0;
                            const fadeInInterval = setInterval(() => {
                                newVolume += 0.05;
                                if (newVolume < targetVolume) {
                                    player.volume = newVolume;
                                } else {
                                    player.volume = targetVolume;
                                    clearInterval(fadeInInterval);
                                    this.isFading = false;
                                }
                            }, 100);
                        }).catch(error => {
                             this.isFading = false;
                        });
                    }
                }
            }, 100);
        } else {
            player.src = soundManifest.bgm[key];
            player.volume = targetVolume;
            player.play().catch(e => console.warn(`Pemutaran BGM gagal, interaksi pengguna mungkin diperlukan.`));
        }
    }
}

// Ekspor instance singleton
const soundService = new SoundService();
export default soundService;
