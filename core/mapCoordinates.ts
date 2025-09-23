// core/mapCoordinates.ts

// Coordinates are in percentage (top, left) for responsive positioning
export const mapCoordinates: Record<string, { x: number; y: number }> = {
    // Sudirman & HI Area
    'Jalan Jenderal Sudirman': { x: 50, y: 55 },
    'Sekitar Bundaran HI': { x: 52, y: 48 },
    'Api Unggun Bundaran HI': { x: 52, y: 49 },
    'Halte Bus TransJakarta': { x: 48, y: 60 },
    'Jembatan Penyeberangan Orang (JPO)': { x: 51, y: 52 },

    // Office & High-rise Buildings
    'Lobi Gedung Perkantoran': { x: 60, y: 58 },
    'Meja Resepsionis Lobi': { x: 61, y: 58 },
    'Ruang Kantor Lantai 2': { x: 60, y: 57 },
    'Koridor Lantai 3': { x: 60, y: 56 },
    'Gedung Pencakar Langit': { x: 62, y: 62 },
    'Atap Gedung': { x: 62, y: 60 },

    // Commercial & Shopping
    'Pusat Perbelanjaan Hancur': { x: 45, y: 45 },
    'Plaza Runtuh': { x: 44, y: 46 },
    'Supermarket Terjarah': { x: 46, y: 44 },
    'Pantry Lantai 3': { x: 45, y: 43 },
    'Warung Kopi Darurat': { x: 40, y: 50 },

    // Residential & Alleys
    'Kamar Apartemen': { x: 58, y: 50 },
    'Kamar Tidur Terbengkalai': { x: 58, y: 49 },
    'Gang Gelap': { x: 55, y: 65 },
    'Lorong Belakang Penuh Sampah': { x: 56, y: 66 },
    'Area Kumuh': { x: 54, y: 68 },

    // Transportation & Underground
    'Stasiun MRT Bawah Tanah': { x: 40, y: 65 },
    'Rel MRT Layang': { x: 45, y: 70 },
    'Tangga Darurat': { x: 41, y: 64 },
    'Jalan Tol Terbengkalai': { x: 30, y: 80 },
    'Jalan Layang Runtuh': { x: 35, y: 75 },

    // Settlements & Factions
    'Kamp Pengungsian': { x: 65, y: 45 },
    'Pemukiman Sisa Kemanusiaan': { x: 66, y: 44 },
    'Tenda Medis': { x: 67, y: 45 },
    'Pasar Gelap': { x: 75, y: 55 },
    'Bazar Puing': { x: 76, y: 56 },
    'Markas Republik Merdeka': { x: 70, y: 35 },
    
    // Landmarks & Open Areas
    'Reruntuhan Monas': { x: 50, y: 20 },
    'Taman Kota Rusak': { x: 35, y: 40 },
    'Alun-alun Terbengkalai': { x: 38, y: 38 },
    'Stadion Utama Gelora Bung Karno': { x: 25, y: 55 },
    
    // Labs & Tech
    'Ruang Keamanan': { x: 80, y: 30 },
    'Laboratorium Medis': { x: 82, y: 28 },
    'Klinik Darurat': { x: 81, y: 29 },
};
