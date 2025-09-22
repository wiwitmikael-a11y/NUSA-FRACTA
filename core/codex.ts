// core/codex.ts
import type { Codex } from '../types';

export const codex: Codex = {
  items: {
    'pipa_besi': { name: 'Pipa Besi', description: 'Sebatang pipa besi berkarat. Lebih baik daripada tangan kosong.', type: 'weapon' },
    'perban': { name: 'Perban', description: 'Kain kasa steril untuk membalut luka. Memulihkan sedikit HP.', type: 'consumable', effects: { heal: 25 } },
    'air_kemasan': { name: 'Air Kemasan', description: 'Air minum bersih, barang langka di dunia ini.', type: 'consumable', effects: { heal: 10 } },
    'keripik_basi': { name: 'Keripik Basi', description: 'Rasanya aneh, tapi lebih baik daripada kelaparan.', type: 'consumable', effects: { heal: 5 } },
    'komponen_elektronik': { name: 'Komponen Elektronik', description: 'Rangkaian sirkuit dan kabel yang bisa digunakan untuk kerajinan.', type: 'material' },
    'kain_bekas': { name: 'Kain Bekas', description: 'Potongan kain usang, bisa dirajut menjadi sesuatu yang berguna.', type: 'material' },
    'kunci_inggris': { name: 'Kunci Inggris', description: 'Alat serbaguna untuk reparasi... atau pertahanan diri.', type: 'weapon' },
  },
  skills: {
    'teknisi': {
      name: 'Teknisi',
      description: 'Kamu tahu cara kerja mesin. Memberimu pemahaman lebih tentang teknologi pra-keruntuhan. (+2 Kecerdasan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 2 }],
    },
    'medis': {
      name: 'Medis',
      description: 'Kamu pernah belajar dasar-dasar pertolongan pertama. Kamu lebih efektif saat menggunakan item penyembuh.',
      effects: [{ type: 'SKILL_BONUS', key: 'healing_effectiveness', value: 25 }], // 25% bonus healing
    },
    'negosiator': {
        name: 'Negosiator',
        description: 'Lidahmu setajam silet. Kamu bisa bicara untuk keluar dari masalah. (+2 Karisma)',
        effects: [{ type: 'ATTRIBUTE_MOD', key: 'karisma', value: 2 }],
    },
    'petarung_jalanan': {
        name: 'Petarung Jalanan',
        description: 'Kamu tahu cara berkelahi. Tanganmu lebih mematikan dari biasanya. (+2 Kekuatan)',
        effects: [{ type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 2 }],
    }
  },
  backgrounds: {
    'kurir': {
      name: 'Kurir Paket',
      description: 'Sebelum semuanya runtuh, kamu mengantar paket. Kakimu kuat dan kamu tahu jalanan seperti punggung tanganmu. (+1 Ketangkasan, +1 Kekuatan)',
      effects: [
        { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 1 },
        { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 1 }
      ],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/kurir.jpeg',
    },
    'mahasiswa_ti': {
      name: 'Mahasiswa TI',
      description: 'Kamu sedang mengerjakan skripsi saat listrik padam selamanya. Otakmu adalah senjatamu. (+2 Kecerdasan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 2 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/mahasiswa_ti.jpeg',
    },
    'karyawan_swasta': {
        name: 'Karyawan Swasta',
        description: 'Kamu terbiasa dengan politik kantor dan tenggat waktu yang mencekik. Kamu tahu cara berbicara dengan orang. (+1 Karisma, +1 Kecerdasan)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 1 },
            { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 1 }
        ],
        portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/karyawan.jpeg',
    },
    'atlet': {
        name: 'Atlet',
        description: 'Tubuhmu adalah kuil. Kamu kuat dan cepat, dibangun untuk daya tahan. (+2 Kekuatan)',
        effects: [{ type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 2 }],
        portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/atlet.jpeg',
    }
  },
  enemies: {
    'anjing_liar': {
      name: 'Anjing Liar',
      description: 'Sekawanan anjing kelaparan yang menjadi liar setelah keruntuhan.',
      hp: 30,
      attack: 8,
      defense: 2,
      xpValue: 15,
      lootTable: [{ itemId: 'kain_bekas', chance: 0.5, quantity: [1, 2] }],
    },
    'preman_kumuh': {
        name: 'Preman Kumuh',
        description: 'Penjarah putus asa yang akan melakukan apa saja untuk mendapatkan sumber daya.',
        hp: 50,
        attack: 12,
        defense: 5,
        xpValue: 30,
        lootTable: [
            { itemId: 'pipa_besi', chance: 0.3, quantity: [1, 1] },
            { itemId: 'keripik_basi', chance: 0.7, quantity: [1, 3] },
        ],
    },
  },
  recipes: {
    'perban_darurat': {
        name: 'Perban Darurat',
        result: { itemId: 'perban', quantity: 1 },
        ingredients: [{ itemId: 'kain_bekas', quantity: 2 }],
    },
  },
  quests: {
    'cari_air': {
        name: 'Sumber Air Bersih',
        description: 'Bertahan hidup butuh air. Kamu harus mencari sumber air minum yang aman di sekitar sini.',
    }
  }
};
