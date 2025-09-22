// core/codex.ts

import { StoryEffect, Enemy, Recipe, Quest, Item } from "../types";

interface ItemDetails {
  name: string;
  description: string;
  effects?: StoryEffect[]; 
}

interface BackgroundDetails {
    name: string;
    description: string;
    effects: any[];
    startingItems: Item[];
    portraitUrl: string;
}

interface Codex {
  items: { [itemId: string]: ItemDetails; };
  backgrounds: { [backgroundId: string]: BackgroundDetails; };
  skills: { [skillId: string]: { name: string; description: string; effects: any[] }; };
  enemies: { [enemyId: string]: Enemy; }; // NEW
  recipes: { [recipeId: string]: Recipe; }; // NEW
  quests: { [questId: string]: Quest; }; // NEW
}

const PORTRAIT_BASE_URL = '/portraits';

export const codex: Codex = {
  items: {
    pipa_besi: {
      name: 'Pipa Besi',
      description: 'Sebatang pipa besi berkarat. Bisa untuk memukul.',
    },
    air_minum: {
        name: 'Air Minum Kemasan',
        description: 'Menghilangkan dahaga dan memulihkan sedikit kesehatan.',
        effects: [{ type: 'CHANGE_HP', key: 'heal', value: 5 }]
    },
    perban: {
        name: 'Perban',
        description: 'Kain kasa steril untuk mengobati luka ringan.',
        effects: [{ type: 'CHANGE_HP', key: 'heal', value: 15 }]
    },
    makanan_ringan: {
      name: 'Makanan Ringan',
      description: 'Sebuah snack bar berenergi tinggi yang sudah agak basi, tapi masih bisa dimakan.'
    },
    komponen_elektronik: {
      name: 'Komponen Elektronik',
      description: 'Segenggam suku cadang elektronik yang berhasil diselamatkan.'
    },
    perkakas: {
      name: 'Perkakas',
      description: 'Satu set alat dasar. Berguna untuk perbaikan.'
    },
    peta_usang: {
      name: 'Peta Usang',
      description: 'Peta Jakarta Pusat yang kumal dengan catatan-catatan tulisan tangan.'
    },
    chip_data_lama: {
      name: 'Chip Data Lama',
      description: 'Sebuah chip data tua. Mungkin berisi informasi berharga.'
    },
    senapan_rakitan: {
      name: 'Senapan Rakitan',
      description: 'Senapan pipa kasar yang menembakkan proyektil dengan kekuatan besar. Tidak akurat tapi mematikan dari jarak dekat.'
    },
    makanan_kaleng: {
      name: 'Makanan Kaleng',
      description: 'Isinya misterius, tapi ini adalah makanan. Mungkin.',
      effects: [{ type: 'CHANGE_HP', key: 'heal', value: 10 }]
    },
    kotak_p3k: {
      name: 'Kotak P3K',
      description: 'Berisi perban, antiseptik, dan beberapa pereda nyeri. Sangat berguna.',
      effects: [{ type: 'CHANGE_HP', key: 'heal', value: 40 }]
    },
    senter_rusak: {
      name: 'Senter (Rusak)',
      description: 'Senter LED yang kokoh, tapi sepertinya tidak ada baterainya.'
    },
    pistol_9mm: {
      name: 'Pistol 9mm',
      description: 'Sebuah pistol semi-otomatis standar. Relik dari dunia lama, masih berfungsi dengan baik.'
    },
    peluru_9mm: {
      name: 'Peluru 9mm',
      description: 'Satu kotak peluru 9mm. Sangat berharga.'
    },
    rompi_anti_peluru: {
      name: 'Rompi Anti Peluru',
      description: 'Rompi balistik usang. Memberikan perlindungan dari serangan fisik.'
    },
    kunci_inggris: {
      name: 'Kunci Inggris',
      description: 'Alat berat yang bisa digunakan untuk memperbaiki atau... membongkar sesuatu. Termasuk tengkorak.'
    },
    makanan_basi: {
      name: 'Makanan Basi',
      description: 'Sebungkus makanan yang sudah tidak layak. Mungkin bisa digunakan sebagai umpan.'
    },
    filter_karbon: {
      name: 'Filter Karbon',
      description: 'Sebuah komponen silinder yang penting untuk sistem pemurnian air.'
    },
  },
  backgrounds: {
    'pemulung': {
      name: 'Pemulung',
      description: 'Terbiasa mengais reruntuhan, kamu gesit dan tahu di mana mencari barang berharga. (+2 Ketangkasan, -1 Kecerdasan, -1 Karisma)',
      effects: [
        { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 2 },
        { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: -1 },
        { type: 'ATTRIBUTE_MOD', key: 'karisma', value: -1 },
      ],
      startingItems: [{ itemId: 'komponen_elektronik', quantity: 2 }],
      portraitUrl: `${PORTRAIT_BASE_URL}/player_pemulung.png`
    },
    'mantan_tentara': {
      name: 'Mantan Tentara',
      description: 'Disiplin dan latihan keras menjadikanmu kuat secara fisik, meskipun sedikit kaku dalam bersosialisasi. (+2 Kekuatan, -1 Kecerdasan, -1 Karisma)',
      effects: [
        { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 2 },
        { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: -1 },
        { type: 'ATTRIBUTE_MOD', key: 'karisma', value: -1 },
      ],
      startingItems: [{ itemId: 'makanan_kaleng', quantity: 1 }],
      portraitUrl: `${PORTRAIT_BASE_URL}/player_mantan_tentara.png`
    },
    'teknisi_jalanan': {
      name: 'Teknisi Jalanan',
      description: 'Kamu tumbuh dengan membongkar pasang teknologi usang. Otakmu tajam untuk memecahkan masalah teknis. (+2 Kecerdasan, -1 Kekuatan, -1 Karisma)',
      effects: [
        { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 2 },
        { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: -1 },
        { type: 'ATTRIBUTE_MOD', key: 'karisma', value: -1 },
      ],
      startingItems: [{ itemId: 'perkakas', quantity: 1 }],
      portraitUrl: `${PORTRAIT_BASE_URL}/player_teknisi_jalanan.png`
    },
    'negosiator_pasar_gelap': {
        name: 'Negosiator Pasar Gelap',
        description: 'Lidahmu lebih tajam dari pisau. Kamu bisa meyakinkan siapa saja untuk melihat dari sudut pandangmu. (+2 Karisma, -1 Kekuatan, -1 Ketangkasan)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 2 },
            { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: -1 },
            { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: -1 },
        ],
        startingItems: [{ itemId: 'air_minum', quantity: 2 }],
        portraitUrl: `${PORTRAIT_BASE_URL}/player_negosiator_pasar_gelap.png`
    },
    'kurir_cepat': {
        name: 'Kurir Cepat',
        description: 'Di dunia tanpa sinyal, kamulah pesan itu sendiri. Kecepatan dan kegesitan adalah senjatamu. (+2 Ketangkasan, -1 Kekuatan, -1 Kecerdasan)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 2 },
            { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: -1 },
            { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: -1 },
        ],
        startingItems: [{ itemId: 'makanan_ringan', quantity: 1 }],
        portraitUrl: `${PORTRAIT_BASE_URL}/player_kurir_cepat.png`
    },
    'pustakawan_kiamat': {
        name: 'Pustakawan Kiamat',
        description: 'Kamu menyelamatkan pengetahuan dunia lama. Apa yang kurang dari ototmu, kamu gantikan dengan otak. (+2 Kecerdasan, -2 Kekuatan)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 2 },
            { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: -2 },
        ],
        startingItems: [{ itemId: 'peta_usang', quantity: 1 }],
        portraitUrl: `${PORTRAIT_BASE_URL}/player_pustakawan_kiamat.png`
    },
    'pengawal_pribadi': {
        name: 'Pengawal Pribadi',
        description: 'Tugasmu adalah menerima pukulan, dan membalasnya lebih keras. Sederhana, efektif, dan menyakitkan. (+2 Kekuatan, -2 Kecerdasan)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 2 },
            { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: -2 },
        ],
        startingItems: [{ itemId: 'perban', quantity: 1 }],
        portraitUrl: `${PORTRAIT_BASE_URL}/player_pengawal_pribadi.png`
    },
    'kultis_puing': {
        name: 'Kultis Puing',
        description: 'Kamu menemukan pencerahan di tengah kehancuran. Orang-orang tertarik pada keyakinanmu yang aneh. (+2 Karisma, -2 Ketangkasan)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 2 },
            { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: -2 },
        ],
        startingItems: [{ itemId: 'makanan_basi', quantity: 1 }],
        portraitUrl: `${PORTRAIT_BASE_URL}/player_kultis_puing.png`
    },
    'seniman_grafiti': {
        name: 'Seniman Grafiti',
        description: 'Dinding adalah kanvasmu. Kamu tahu seluk beluk jalanan dan memiliki gaya yang khas. (+1 Ketangkasan, +1 Karisma, -1 Kekuatan, -1 Kecerdasan)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 1 },
            { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 1 },
            { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: -1 },
            { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: -1 },
        ],
        startingItems: [{ itemId: 'air_minum', quantity: 1 }],
        portraitUrl: `${PORTRAIT_BASE_URL}/player_seniman_grafiti.png`
    },
    'petani_hidroponik': {
        name: 'Petani Hidroponik',
        description: 'Kamu menumbuhkan kehidupan di tempat yang mustahil. Kesabaran dan pengetahuan adalah alatmu. (+1 Kecerdasan, +1 Kekuatan, -1 Ketangkasan, -1 Karisma)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 1 },
            { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 1 },
            { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: -1 },
            { type: 'ATTRIBUTE_MOD', key: 'karisma', value: -1 },
        ],
        startingItems: [{ itemId: 'makanan_kaleng', quantity: 1 }],
        portraitUrl: `${PORTRAIT_BASE_URL}/player_petani_hidroponik.png`
    }
  },
  skills: {
    'bertahan_hidup': {
      name: 'Bertahan Hidup',
      description: 'Kamu tahu cara mencari air bersih dan makanan di reruntuhan.',
      effects: [],
    },
    'teknisi': {
      name: 'Teknisi',
      description: 'Kamu bisa memperbaiki barang-barang elektronik sederhana.',
      effects: [],
    },
    'pertolongan_pertama': {
        name: 'Pertolongan Pertama',
        description: 'Kamu terampil dalam mengobati luka-luka umum.',
        effects: [],
    },
    'menyelinap': {
        name: 'Menyelinap',
        description: 'Kamu tahu cara bergerak tanpa suara dan menghindari perhatian yang tidak diinginkan.',
        effects: [],
    },
    'peretas': {
        name: 'Peretas',
        description: 'Kamu bisa melewati kunci elektronik dan terminal dunia lama.',
        effects: [],
    },
    'senjata_rakitan': {
        name: 'Senjata Rakitan',
        description: 'Kamu mahir membuat dan menggunakan senjata darurat.',
        effects: [],
    },
    'botani_reruntuhan': {
        name: 'Botani Reruntuhan',
        description: 'Kamu dapat mengidentifikasi tanaman yang dapat dimakan dan obat-obatan yang tumbuh di era kiamat.',
        effects: [],
    },
    'pembohong_ulung': {
        name: 'Pembohong Ulung',
        description: 'Kamu bisa merangkai cerita yang meyakinkan untuk mendapatkan apa yang kamu inginkan.',
        effects: [],
    },
    'mekanik': {
        name: 'Mekanik',
        description: 'Kamu dapat memperbaiki dan merawat mesin-mesin sederhana.',
        effects: [],
    },
    'sejarawan_lisan': {
        name: 'Sejarawan Lisan',
        description: 'Kamu adalah gudang cerita dan pengetahuan dari sebelum dan sesudah kejatuhan.',
        effects: [],
    }
  },
  enemies: {
      'penjarah_golok': { name: 'Penjarah Bergolok', hp: 35, attack: 10, defense: 2, xp_reward: 25 },
      'penjarah_pipa': { name: 'Penjarah Pipa', hp: 30, attack: 8, defense: 4, xp_reward: 20 },
      // NEW: Added Raider enemies
      'raider_pemula': { name: 'Raider Pemula', hp: 40, attack: 12, defense: 5, xp_reward: 30 },
      'raider_ganas': { name: 'Raider Ganas', hp: 55, attack: 15, defense: 3, xp_reward: 45 },
      'raider_veteran': { name: 'Raider Veteran', hp: 65, attack: 14, defense: 8, xp_reward: 60 },
      // NEW: Added Anomaly enemies
      'anomali_brainrot': { name: 'Anomali Brainrot', hp: 25, attack: 18, defense: 1, xp_reward: 35 },
      'anomali_fungus': { name: 'Anomali Jamur', hp: 70, attack: 10, defense: 10, xp_reward: 55 },
      'anomali_kumbang': { name: 'Anomali Kumbang Lapis Baja', hp: 50, attack: 12, defense: 15, xp_reward: 45 },
      'anomali_tengkorak': { name: 'Anomali Tengkorak', hp: 30, attack: 10, defense: 2, xp_reward: 25 },
      'ratu_anomali': { name: 'Ratu Anomali', hp: 150, attack: 25, defense: 12, xp_reward: 200 },
  },
  recipes: {
      'medkit_rakitan': {
          name: 'Kotak P3K Rakitan',
          ingredients: [{ itemId: 'perban', quantity: 2 }, { itemId: 'air_minum', quantity: 1 }],
          output: { itemId: 'kotak_p3k', quantity: 1 }
      },
      'senapan_rakitan_basic': {
          name: 'Senapan Rakitan Sederhana',
          ingredients: [{ itemId: 'pipa_besi', quantity: 1 }, { itemId: 'perkakas', quantity: 1 }],
          output: { itemId: 'senapan_rakitan', quantity: 1 }
      }
  },
  quests: {
      'misi_filter_karbon': {
          name: 'Air untuk yang Haus',
          description: 'Davina dan kelompoknya di Bundaran HI membutuhkan filter karbon dari gedung perkantoran. Tempat itu kabarnya dikuasai oleh Gerombolan Besi.'
      },
      'petunjuk_gudang_manggarai': {
          name: 'Catatan Penjarah',
          description: "Sebuah catatan menyebutkan 'Gudang Medis di dekat Manggarai' dan 'Obat Penenang'. Mungkin ada sesuatu yang berharga di sana."
      },
      'petunjuk_oracle_bej': {
          name: 'Pesan dari Masa Lalu',
          description: "Sebuah terminal tua menyebutkan entitas bernama 'ORACLE' dan 'Bursa Efek Jakarta' sebagai prioritas saat 'Kilatan Senja' terjadi. Ini bisa menjadi petunjuk penting."
      }
  }
};