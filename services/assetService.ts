// services/assetService.ts
import { assetManifest } from '../core/assetManifest';
import { FactionId, EnemyId } from '../types';

const BACKGROUND_BASE_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/backgrounds';
const PORTRAIT_BASE_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits';

type AssetKey = keyof typeof assetManifest.backgrounds;

// Peta yang diperluas untuk mencocokkan lokasi spesifik dengan kategori gambar.
const locationToAssetKey: { [key: string]: AssetKey } = {
    // Exact matches updated to new keys
    'Jalan Jenderal Sudirman': 'jalanRayaJembatan',
    'Jalan Tol Terbengkalai': 'jalanRayaJembatan',
    'Halte Bus TransJakarta': 'jalanRayaJembatan',
    'Jalan Layang Runtuh': 'jalanRayaJembatan',
    'Jembatan Penyeberangan Orang (JPO)': 'jalanRayaJembatan',
    'Sekitar Bundaran HI': 'monumenPuing',
    'Api Unggun Bundaran HI': 'monumenPuing',
    'Reruntuhan Monas': 'monumenPuing',
    'Taman Kota Rusak': 'tamanKota',
    'Alun-alun Terbengkalai': 'tendaMarkasSurvivor',
    'Stadion Utama Gelora Bung Karno': 'stadionGudang',
    'Lobi Gedung Perkantoran': 'kantorKelasRuang',
    'Meja Resepsionis Lobi': 'kantorKelasRuang',
    'Ruang Kantor Lantai 2': 'kantorKelasRuang',
    'Koridor Lantai 3': 'kantorKelasRuang',
    'Gedung Pencakar Langit': 'kantorKelasRuang',
    'Pusat Perbelanjaan Hancur': 'malLobiAula',
    'Plaza Runtuh': 'malLobiAula',
    'Supermarket Terjarah': 'malLobiAula',
    'Pantry Lantai 3': 'warungMakan',
    'Warung Kopi Darurat': 'warungMakan',
    'Kamar Apartemen': 'ruanganKamarTidur',
    'Kamar Tidur Terbengkalai': 'ruanganKamarTidur',
    'Ruang Keamanan': 'labPustakaRiset',
    'Laboratorium Medis': 'labPustakaRiset',
    'Klinik Darurat': 'labPustakaRiset',
    'Gang Gelap': 'gangSampah',
    'Lorong Belakang Penuh Sampah': 'gangSampah',
    'Area Kumuh': 'gangSampah',
    'Stasiun MRT Bawah Tanah': 'stasiunMrt',
    'Rel MRT Layang': 'relMrtKereta',
    'Tangga Darurat': 'stasiunMrt',
    'Kamp Pengungsian': 'tendaMarkasSurvivor',
    'Pemukiman Sisa Kemanusiaan': 'tendaMarkasSurvivor',
    'Tenda Medis': 'tendaMarkasSurvivor',
    'Pasar Gelap': 'pasarSaudagar',
    'Bazar Puing': 'pasarSaudagar',
    'Markas Republik Merdeka': 'hqRepublik',
    'Atap Gedung': 'relMrtKereta',
};

// Peta kata kunci yang lebih komprehensif untuk pencocokan yang lebih luas.
const keywordToAssetKey: { [keyword: string]: AssetKey } = {
    // Area Terbuka
    'terbuka': 'areaTerbuka',
    'lapangan': 'areaTerbuka',
    'luar': 'areaTerbuka',
    
    // Jalan & Transportasi
    'jalan': 'jalanRayaJembatan',
    'raya': 'jalanRayaJembatan',
    'jembatan': 'jalanRayaJembatan',
    'tol': 'jalanRayaJembatan',
    'aspal': 'jalanRayaJembatan',
    'halte': 'jalanRayaJembatan',
    'layang': 'jalanRayaJembatan',
    'jpo': 'jalanRayaJembatan',
    'rel': 'relMrtKereta',
    'kereta': 'relMrtKereta',
    'stasiun': 'stasiunMrt',
    'mrt': 'stasiunMrt',
    'peron': 'stasiunMrt',
    
    // Bangunan & Interior
    'kantor': 'kantorKelasRuang',
    'kelas': 'kantorKelasRuang',
    'gedung': 'kantorKelasRuang',
    'menara': 'kantorKelasRuang',
    'lobi': 'malLobiAula',
    'balkon': 'malLobiAula',
    'aula': 'malLobiAula',
    'mal': 'malLobiAula',
    'plaza': 'malLobiAula',
    'supermarket': 'malLobiAula',
    'toko': 'malLobiAula',
    'eskalator': 'malLobiAula',
    'kamar': 'ruanganKamarTidur',
    'ruangan': 'ruanganKamarTidur',
    'tidur': 'ruanganKamarTidur',
    'apartemen': 'ruanganKamarTidur',
    'koridor': 'relMrtKereta', // Koridor & lorong MRT cocok
    'lorong': 'relMrtKereta',
    'pantry': 'warungMakan',
    'laboratorium': 'labPustakaRiset',
    'lab': 'labPustakaRiset',
    'pustaka': 'labPustakaRiset',
    'riset': 'labPustakaRiset',
    'klinik': 'labPustakaRiset',
    'server': 'labPustakaRiset',
    'rumah sakit': 'labPustakaRiset',
    
    // Area Pemukiman & Sosial
    'pasar': 'pasarSaudagar',
    'saudagar': 'pasarSaudagar',
    'bazar': 'pasarSaudagar',
    'kios': 'pasarSaudagar',
    'warung': 'warungMakan',
    'makan': 'warungMakan',
    'kafe': 'warungMakan',
    'dapur': 'warungMakan',
    'gang': 'gangSampah',
    'kumuh': 'gangSampah',
    'selokan': 'gangSampah',
    'sampah': 'gangSampah',
    'tenda': 'tendaMarkasSurvivor',
    'kamp': 'tendaMarkasSurvivor',
    'pemukiman': 'tendaMarkasSurvivor',
    'alun-alun': 'tendaMarkasSurvivor',
    'survivor': 'tendaMarkasSurvivor',
    'markas': 'hqRepublik',
    'republik': 'hqRepublik',
    'pos jaga': 'hqRepublik',
    'barak': 'hqRepublik',
    
    // Area Terbuka & Alam & Reruntuhan
    'monumen': 'monumenPuing',
    'bundaran': 'monumenPuing',
    'patung': 'monumenPuing',
    'puing': 'monumenPuing',
    'reruntuhan': 'monumenPuing',
    'stadion': 'stadionGudang',
    'gudang': 'stadionGudang',
    'logistik': 'stadionGudang',
    'arena': 'stadionGudang',
    'taman': 'tamanKota',
    'pohon': 'tamanKota',
    'danau': 'tamanKota',
    'atap': 'jalanRayaJembatan',
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
    // Fallback to a generic outdoor scene if no match is found
    const fallbackImages = assetManifest.backgrounds['jalanRayaJembatan'];
    const fallbackImageName = getRandomImage(fallbackImages);
    if(fallbackImageName) {
        return `${BACKGROUND_BASE_URL}/${fallbackImageName}`;
    }

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

export const getEnemyImageUrl = (enemyId: EnemyId): string | null => {
    let images: string[] | undefined;
    const lowerEnemyId = enemyId.toLowerCase();

    if (lowerEnemyId.includes('anomali')) {
        images = assetManifest.enemyPortraits.anomali;
    } else if (lowerEnemyId.includes('preman') || lowerEnemyId.includes('perampok')) {
        images = assetManifest.enemyPortraits.raider;
    } else {
        // Fallback for other types or unmatched IDs
        images = assetManifest.enemyPortraits.raider;
        console.warn(`No specific enemy portrait category for ${enemyId}, falling back to raider.`);
    }
    
    const imageName = getRandomImage(images);
    if (imageName) {
        return `${PORTRAIT_BASE_URL}/${imageName}`;
    }

    console.error(`Could not find any image for enemy ID: ${enemyId}`);
    return null;
}