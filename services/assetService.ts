// services/assetService.ts
import { assetManifest } from '../core/assetManifest';
import { FactionId } from '../types';

const BACKGROUND_BASE_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/backgrounds';
const PORTRAIT_BASE_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits';

type AssetKey = keyof typeof assetManifest.backgrounds;

// Peta yang diperluas untuk mencocokkan lokasi spesifik dengan kategori gambar.
// Tambahkan nama lokasi yang sering muncul dari AI di sini.
const locationToAssetKey: { [key: string]: AssetKey } = {
    // Jalan & Luar Ruangan
    'Jalan Jenderal Sudirman': 'jalanRaya',
    'Jalan Tol Terbengkalai': 'jalanRaya',
    'Halte Bus TransJakarta': 'jalanRaya',
    'Jalan Layang Runtuh': 'relMrt',
    'Jembatan Penyeberangan Orang (JPO)': 'relMrt',
    'Sekitar Bundaran HI': 'monumen',
    'Api Unggun Bundaran HI': 'monumen',
    'Reruntuhan Monas': 'monumen',
    'Taman Kota Rusak': 'tamanKota',
    'Alun-alun Terbengkalai': 'stadion',
    'Stadion Utama Gelora Bung Karno': 'stadion',

    // Bangunan & Interior
    'Lobi Gedung Perkantoran': 'kantorMalam',
    'Meja Resepsionis Lobi': 'kantorMalam',
    'Ruang Kantor Lantai 2': 'kantorMalam',
    'Koridor Lantai 3': 'kantorMalam',
    'Gedung Pencakar Langit': 'kantorMalam',
    'Pusat Perbelanjaan Hancur': 'mall',
    'Plaza Runtuh': 'mall',
    'Supermarket Terjarah': 'mall',
    'Pantry Lantai 3': 'warmindo',
    'Warung Kopi Darurat': 'warmindo',
    'Kamar Apartemen': 'kamar',
    'Kamar Tidur Terbengkalai': 'kamar',
    'Ruang Keamanan': 'lab',
    'Laboratorium Medis': 'lab',
    'Klinik Darurat': 'lab',
    
    // Area Spesifik & Pemukiman
    'Gang Gelap': 'gangSampah',
    'Lorong Belakang Penuh Sampah': 'gangSampah',
    'Area Kumuh': 'gangSampah',
    'Stasiun MRT Bawah Tanah': 'stasiunMrt',
    'Rel MRT Layang': 'relMrt',
    'Tangga Darurat': 'stasiunMrt',
    'Kamp Pengungsian': 'tendaSurvivor',
    'Pemukiman Sisa Kemanusiaan': 'tendaSurvivor',
    'Tenda Medis': 'tendaSurvivor',
    'Pasar Gelap': 'pasarSaudagar',
    'Bazar Puing': 'pasarSaudagar',
    'Markas Republik Merdeka': 'hqRepublik',
    'Kubah Teknokrat': 'dome',
    'Atap Gedung': 'relMrt',
};

// Peta kata kunci yang lebih komprehensif untuk pencocokan yang lebih luas.
const keywordToAssetKey: { [keyword: string]: AssetKey } = {
    // Jalan & Transportasi
    'jalan': 'jalanRaya',
    'raya': 'jalanRaya',
    'halte': 'jalanRaya',
    'aspal': 'jalanRaya',
    'jembatan': 'relMrt',
    'layang': 'relMrt',
    'rel': 'relMrt',
    'mrt': 'stasiunMrt',
    'stasiun': 'stasiunMrt',
    'kereta': 'stasiunMrt',
    
    // Bangunan
    'kantor': 'kantorMalam',
    'lobi': 'kantorMalam',
    'gedung': 'kantorMalam',
    'ruang': 'kantorMalam', // Umum, tapi seringnya kantor
    'menara': 'kantorMalam',
    'plaza': 'mall',
    'mall': 'mall',
    'supermarket': 'mall',
    'toko': 'mall',
    'apartemen': 'kamar',
    'kamar': 'kamar',
    'laboratorium': 'lab',
    'lab': 'lab',
    'klinik': 'lab',
    'server': 'lab',
    
    // Area Pemukiman & Sosial
    'pasar': 'pasarSaudagar',
    'saudagar': 'pasarSaudagar',
    'bazar': 'pasarSaudagar',
    'warung': 'warmindo',
    'kafe': 'warmindo',
    'gang': 'gangSampah',
    'lorong': 'gangSampah',
    'kumuh': 'gangSampah',
    'kamp': 'tendaSurvivor',
    'tenda': 'tendaSurvivor',
    'pemukiman': 'tendaSurvivor',
    'markas': 'hqRepublik',
    'republik': 'hqRepublik',
    'kubah': 'dome',
    'dome': 'dome',
    
    // Area Terbuka
    'monumen': 'monumen',
    'bundaran': 'monumen',
    'stadion': 'stadion',
    'arena': 'stadion',
    'taman': 'tamanKota',
    'atap': 'relMrt', // Pemandangan dari atap seringkali mirip pemandangan dari rel layang
};

const getRandomImage = (imageArray: string[]): string | null => {
    if (!imageArray || imageArray.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * imageArray.length);
    return imageArray[randomIndex];
};

export const getImageUrlForLocation = (location: string): string | null => {
    let key: AssetKey | undefined = locationToAssetKey[location];

    if (!key) {
        const lowerLocation = location.toLowerCase();
        const sortedKeywords = Object.keys(keywordToAssetKey).sort((a, b) => b.length - a.length);
        
        for (const keyword of sortedKeywords) {
            if (lowerLocation.includes(keyword)) {
                key = keywordToAssetKey[keyword];
                break;
            }
        }
    }
    
    if (key) {
        const images = assetManifest.backgrounds[key];
        const imageName = getRandomImage(images);
        if (imageName) {
            return `${BACKGROUND_BASE_URL}/${imageName}`;
        }
    }
    
    console.warn(`No image asset key found for location: ${location}`);
    return null; 
};

export const getNpcImageUrl = (): string | null => {
    const images = assetManifest.npcPortraits.generic;
    const imageName = getRandomImage(images);
    if (imageName) {
        return `${PORTRAIT_BASE_URL}/${imageName}`;
    }
    console.warn(`Could not find a generic NPC image.`);
    return null;
};

export const getFactionImageUrl = (factionId: FactionId): string | null => {
    const keyMap: Record<FactionId, keyof typeof assetManifest.factionPortraits> = {
        'geng_bangsat': 'geng_bangsat',
        'pemburu_agraria': 'pemburu_agraria',
        'republik_merdeka': 'republik_merdeka',
        'saudagar_jalanan': 'saudagar_jalanan',
        'sekte_pustaka': 'sekte_pustaka',
        // Tambahkan faksi lain jika ada di masa depan
        'sisa_kemanusiaan': 'republik_merdeka', // Placeholder
        'gerombolan_besi': 'geng_bangsat', // Placeholder
        'teknokrat': 'sekte_pustaka', // Placeholder
    };

    const factionKey = keyMap[factionId];
    if (factionKey && assetManifest.factionPortraits[factionKey]) {
        const images = assetManifest.factionPortraits[factionKey];
        const imageName = getRandomImage(images);
        if (imageName) {
            return `${PORTRAIT_BASE_URL}/${imageName}`;
        }
    }
    
    // Fallback to generic NPC if faction not found
    console.warn(`Could not find image for faction: ${factionId}. Falling back to generic NPC.`);
    return getNpcImageUrl();
};