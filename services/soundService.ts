// services/soundService.ts
import { soundManifest } from '../core/soundManifest';

type SfxKey = keyof typeof soundManifest.sfx;
type BgmKey = keyof typeof soundManifest.bgm;

const BGM_VOLUME_KEY = 'nusa-fracta-bgm-volume';
const SFX_VOLUME_KEY = 'nusa-fracta-sfx-volume';

class SoundService {
    private bgmPlayer: HTMLAudioElement | null = null;
    private sfxPool: HTMLAudioElement[] = [];
    private sfxPoolIndex = 0;
    private isInitialized = false;
    private currentBgm: BgmKey | null = null;
    private isFading = false;
    private bgmVolume = 0.4;
    private sfxVolume = 0.7;

    constructor() {
        // Inisialisasi ditunda hingga pemanggilan initialize()
    }
    
    // Dipanggil sekali saat aplikasi dimuat
    initialize() {
        if (this.isInitialized || typeof window === 'undefined') return;
        
        // Muat volume dari localStorage
        const storedBgmVolume = localStorage.getItem(BGM_VOLUME_KEY);
        const storedSfxVolume = localStorage.getItem(SFX_VOLUME_KEY);
        if (storedBgmVolume) this.bgmVolume = parseFloat(storedBgmVolume);
        if (storedSfxVolume) this.sfxVolume = parseFloat(storedSfxVolume);

        this.bgmPlayer = document.getElementById('bgm-player') as HTMLAudioElement;
        if (!this.bgmPlayer) {
            console.error('Elemen pemutar BGM tidak ditemukan!');
            return;
        }
        this.bgmPlayer.volume = this.bgmVolume;
        
        for (let i = 0; i < 10; i++) {
            const audio = new Audio();
            audio.volume = this.sfxVolume;
            this.sfxPool.push(audio);
        }
        
        this.isInitialized = true;
    }

    setBgmVolume(level: number) {
        this.bgmVolume = level;
        if (this.bgmPlayer) {
            this.bgmPlayer.volume = this.bgmVolume;
        }
        localStorage.setItem(BGM_VOLUME_KEY, level.toString());
    }

    setSfxVolume(level: number) {
        this.sfxVolume = level;
        this.sfxPool.forEach(audio => audio.volume = this.sfxVolume);
        localStorage.setItem(SFX_VOLUME_KEY, level.toString());
    }
    
    getBgmVolume = () => this.bgmVolume;
    getSfxVolume = () => this.sfxVolume;

    playSfx(key: SfxKey) {
        if (!this.isInitialized) return;
        try {
            const audio = this.sfxPool[this.sfxPoolIndex];
            audio.src = soundManifest.sfx[key];
            audio.play().catch(e => {});
            this.sfxPoolIndex = (this.sfxPoolIndex + 1) % this.sfxPool.length;
        } catch (e) {
            console.error(`Error memutar kunci SFX "${key}":`, e);
        }
    }

    playBgm(key: BgmKey) {
        if (!this.isInitialized || !this.bgmPlayer || this.currentBgm === key || this.isFading) return;
        
        this.currentBgm = key;
        const player = this.bgmPlayer;
        const targetVolume = this.bgmVolume;

        const performFadeIn = () => {
            let newVolume = 0;
            player.volume = 0;
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
        };

        if (player.src && !player.paused) {
            this.isFading = true;
            let currentVolume = player.volume;
            const fadeOutInterval = setInterval(() => {
                currentVolume = Math.max(0, currentVolume - 0.05);
                player.volume = currentVolume;
                if (currentVolume === 0) {
                    clearInterval(fadeOutInterval);
                    player.pause();
                    player.src = soundManifest.bgm[key];
                    const playPromise = player.play();
                    if (playPromise !== undefined) {
                        playPromise.then(_ => performFadeIn()).catch(error => this.isFading = false);
                    }
                }
            }, 100);
        } else {
            player.src = soundManifest.bgm[key];
            const playPromise = player.play();
             if (playPromise !== undefined) {
                playPromise.then(_ => {
                     player.volume = targetVolume;
                }).catch(error => {
                    // Autoplay gagal, akan dicoba lagi saat interaksi pengguna
                });
            }
        }
    }
}

const soundService = new SoundService();
export default soundService;