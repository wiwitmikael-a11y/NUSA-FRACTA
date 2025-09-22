// core/codex.ts
import type { Codex } from '../types';

export const codex: Codex = {
  items: {
    // SENJATA MELEE
    'pipa_besi': { 
      name: 'Pipa Besi', 
      description: 'Sebatang pipa besi berkarat. Lebih baik daripada tangan kosong.', 
      type: 'weapon', 
      equipmentSlot: 'meleeWeapon',
      effects: [{ type: 'SKILL_BONUS', key: 'flat_damage_bonus', value: 3 }],
      value: 25 
    },
    'kunci_inggris': { 
      name: 'Kunci Inggris', 
      description: 'Alat serbaguna untuk reparasi... atau pertahanan diri.', 
      type: 'weapon',
      equipmentSlot: 'meleeWeapon',
      effects: [{ type: 'SKILL_BONUS', key: 'flat_damage_bonus', value: 5 }], 
      value: 40 
    },
    'pisau_dapur': {
        name: 'Pisau Dapur',
        description: 'Tajam dan cepat, tapi tidak terlalu kokoh.',
        type: 'weapon',
        equipmentSlot: 'meleeWeapon',
        effects: [{ type: 'SKILL_BONUS', key: 'flat_damage_bonus', value: 4 }],
        value: 30
    },
    'bat_baseball': {
        name: 'Bat Baseball Kayu',
        description: 'Peninggalan olahraga dari masa lalu. Pukulan yang solid.',
        type: 'weapon',
        equipmentSlot: 'meleeWeapon',
        effects: [{ type: 'SKILL_BONUS', key: 'flat_damage_bonus', value: 6 }],
        value: 55
    },
    'golok': {
        name: 'Golok',
        description: 'Senjata tebas serbaguna, bagus untuk pertarungan dan membelah semak-semak.',
        type: 'weapon',
        equipmentSlot: 'meleeWeapon',
        effects: [{ type: 'SKILL_BONUS', key: 'flat_damage_bonus', value: 8 }],
        value: 80
    },

    // ARMOR
    'jaket_kulit_usang': {
      name: 'Jaket Kulit Usang',
      description: 'Jaket kulit tebal yang telah melihat hari-hari yang lebih baik. Memberikan sedikit perlindungan.',
      type: 'armor',
      equipmentSlot: 'armor',
      effects: [{ type: 'SKILL_BONUS', key: 'damage_resistance', value: 2 }],
      value: 60,
    },
    'rompi_improvisasi': {
      name: 'Rompi Improvisasi',
      description: 'Terbuat dari potongan ban dan logam. Berat tapi fungsional.',
      type: 'armor',
      equipmentSlot: 'armor',
      effects: [{ type: 'SKILL_BONUS', key: 'damage_resistance', value: 4 }],
      value: 100,
    },
     'rompi_balistik_rusak': {
      name: 'Rompi Balistik Rusak',
      description: 'Rompi polisi atau tentara yang sudah usang. Beberapa pelat keramiknya retak, tapi masih memberikan perlindungan yang layak.',
      type: 'armor',
      equipmentSlot: 'armor',
      effects: [{ type: 'SKILL_BONUS', key: 'damage_resistance', value: 6 }],
      value: 180,
    },

    // KONSUMSI
    'perban': { name: 'Perban', description: 'Kain kasa steril untuk membalut luka. Memulihkan sedikit HP.', type: 'consumable', effects: [{ type: 'SKILL_BONUS', key: 'healing_effectiveness', value: 25 }], value: 20 },
    'air_kemasan': { name: 'Air Kemasan', description: 'Air minum bersih, barang langka di dunia ini.', type: 'consumable', effects: [{ type: 'SKILL_BONUS', key: 'healing_effectiveness', value: 10 }], value: 30 },
    'keripik_basi': { name: 'Keripik Basi', description: 'Rasanya aneh, tapi lebih baik daripada kelaparan.', type: 'consumable', effects: [{ type: 'SKILL_BONUS', key: 'healing_effectiveness', value: 5 }], value: 5 },
    'makanan_kaleng': { name: 'Makanan Kaleng', description: 'Sarden atau kornet dari dunia lama. Memulihkan HP dalam jumlah sedang.', type: 'consumable', effects: [{ type: 'SKILL_BONUS', key: 'healing_effectiveness', value: 40 }], value: 50 },
    'kopi_instan': { name: 'Kopi Instan', description: 'Secangkir semangat di dunia yang lelah. Menghilangkan rasa kantuk untuk sementara.', type: 'consumable', effects: [], value: 15 }, // Efek mungkin ditambahkan di masa depan
    'stimulan': { name: 'Stimulan Kimia', description: 'Suntikan peningkat adrenalin. Memulihkan banyak HP, tapi mungkin ada efek samping.', type: 'consumable', effects: [{ type: 'SKILL_BONUS', key: 'healing_effectiveness', value: 75 }], value: 120 },


    // MATERIAL KERAJINAN
    'komponen_elektronik': { name: 'Komponen Elektronik', description: 'Rangkaian sirkuit dan kabel yang bisa digunakan untuk kerajinan.', type: 'material', value: 15 },
    'kain_bekas': { name: 'Kain Bekas', description: 'Potongan kain usang, bisa dirajut menjadi sesuatu yang berguna.', type: 'material', value: 10 },
    'selotip': { name: 'Selotip', description: 'Penyelamat di dunia pasca-keruntuhan. Bisa merekatkan hampir semua hal.', type: 'material', value: 12 },
    'sekrup_baut': { name: 'Sekrup & Baut', description: 'Kumpulan pengencang logam dari berbagai ukuran.', type: 'material', value: 8 },
    'baterai_bekas': { name: 'Baterai Bekas', description: 'Masih memiliki sedikit daya. Mungkin bisa menghidupkan sesuatu.', type: 'material', value: 20 },
    'plastik_bekas': { name: 'Plastik Bekas', description: 'Potongan-potongan plastik dari botol atau wadah. Bisa dilebur dan dibentuk ulang.', type: 'material', value: 5 },


    // MISC & QUEST
    'artefak_aneh': { name: 'Artefak Aneh', description: 'Benda logam aneh yang berdengung pelan. Mungkin berharga bagi seseorang.', type: 'misc', value: 100 },
    'kunci_gudang': { name: 'Kunci Gudang', description: 'Kunci berkarat dengan label "Gudang B-03".', type: 'key', value: 0 },
    'data_chip': { name: 'Data Chip', description: 'Sebuah chip penyimpanan data. Isinya tidak diketahui.', type: 'misc', value: 150 },
  },
  skills: {
    'petarung_brutal': {
      name: 'Petarung Brutal',
      description: 'Kamu menyelesaikan masalah dengan kekerasan. (+2 Kekuatan, +25% kerusakan serangan jarak dekat)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 2 }, { type: 'SKILL_BONUS', key: 'melee_damage_bonus', value: 25 }],
    },
    'tabib_lapangan': {
      name: 'Tabib Lapangan',
      description: 'Kamu tahu cara menambal luka dengan sumber daya seadanya. (+2 Kecerdasan, item penyembuh 50% lebih efektif)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 2 }, { type: 'SKILL_BONUS', key: 'healing_effectiveness', value: 50 }],
    },
    'pelari_cepat': {
      name: 'Pelari Cepat',
      description: 'Kakimu adalah aset terbesarmu untuk keluar dari bahaya. (+2 Ketangkasan, +25% peluang berhasil kabur, +10% peluang menghindar dari serangan)',
      effects: [
        { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 2 }, 
        { type: 'SKILL_BONUS', key: 'flee_chance_bonus', value: 25 },
        { type: 'SKILL_BONUS', key: 'dodge_chance', value: 10 },
      ],
    },
    'cendekiawan_puing': {
      name: 'Cendekiawan Puing',
      description: 'Setiap pengalaman adalah pelajaran berharga. (+1 Kecerdasan, +1 Karisma, +20% perolehan XP)',
      effects: [
          { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 1 }, 
          { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 1 },
          { type: 'SKILL_BONUS', key: 'xp_gain_bonus', value: 20 }
      ],
    },
    'pemulung_ahli': {
      name: 'Pemulung Ahli',
      description: 'Kamu memiliki mata yang tajam untuk barang berharga di antara sampah. (+2 Ketangkasan, +35% peluang menemukan item tambahan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 2 }, { type: 'SKILL_BONUS', key: 'loot_find_bonus', value: 35 }],
    },
    'negosiator_ulung': {
        name: 'Negosiator Ulung',
        description: 'Lidahmu lebih tajam dari pisau berkarat. Kamu ahli dalam membujuk dan berdebat. (+2 Karisma, +15% harga lebih baik saat berdagang)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 2 },
            { type: 'SKILL_BONUS', key: 'better_prices_bonus', value: 15 },
        ],
    },
    'mekanik_handal': {
        name: 'Mekanik Handal',
        description: 'Tanganmu terampil memperbaiki dan memodifikasi perangkat. (+2 Kecerdasan, 25% peluang tidak menggunakan material saat membuat item)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 2 },
            { type: 'SKILL_BONUS', key: 'crafting_resource_saver_chance', value: 25 },
        ],
    },
    'pengintai_taktis': {
        name: 'Pengintai Taktis',
        description: 'Kamu selalu waspada, mampu melihat celah untuk serangan mematikan. (+1 Ketangkasan, +1 Kecerdasan, +10% peluang serangan kritikal)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 1 }, 
            { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 1 },
            { type: 'SKILL_BONUS', key: 'critical_hit_chance', value: 10 },
        ],
    },
    'penyintas_tangguh': {
      name: 'Penyintas Tangguh',
      description: 'Tubuhmu telah beradaptasi dengan kerasnya dunia baru. (+1 Kekuatan, +1 Ketangkasan, +20% HP Maksimal)',
      effects: [
          { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 1 }, 
          { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 1 },
          { type: 'SKILL_BONUS', key: 'base_hp_bonus', value: 20 } // Diinterpretasikan sebagai persentase
      ],
    },
    'wajah_karismatik': {
        name: 'Wajah Karismatik',
        description: 'Orang-orang cenderung mempercayai senyummu, sebuah keuntungan di dunia yang penuh curiga. (+1 Karisma, +1 Ketangkasan, +15% perolehan reputasi)',
        effects: [
            { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 1 }, 
            { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 1 },
            { type: 'SKILL_BONUS', key: 'reputation_gain_bonus', value: 15 },
        ],
    }
  },
  backgrounds: {
    'pemulung': {
      name: 'Pemulung',
      description: 'Kamu bertahan hidup dengan memungut sisa-sisa peradaban. Kamu tahu barang mana yang berharga dan di mana mencarinya. (+1 Kecerdasan, +1 Ketangkasan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 1 }, { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 1 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_pemulung.png',
    },
    'mantan_tentara': {
      name: 'Mantan Tentara',
      description: 'Disiplin dan pelatihan tempur adalah bagian dari dirimu. Kamu tetap tenang di bawah tekanan dan tahu cara menggunakan senjata. (+2 Kekuatan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 2 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_mantan_tentara.png',
    },
    'teknisi_jalanan': {
      name: 'Teknisi Jalanan',
      description: 'Kamu bisa memperbaiki hampir semua alat elektronik dari sebelum keruntuhan. Pengetahuanmu tentang teknologi sangat berharga. (+2 Kecerdasan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 2 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_teknisi_jalanan.png',
    },
    'negosiator_pasar_gelap': {
      name: 'Negosiator Pasar Gelap',
      description: 'Lidahmu setajam silet. Kamu tahu cara mendapatkan harga terbaik dan meyakinkan orang lain untuk melihat dari sudut pandangmu. (+2 Karisma)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'karisma', value: 2 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_negosiator_pasar_gelap.png',
    },
    'kurir_cepat': {
      name: 'Kurir Cepat',
      description: 'Kecepatan adalah kelebihanmu. Kamu terbiasa melintasi reruntuhan kota dengan gesit untuk mengirimkan pesan atau barang. (+2 Ketangkasan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 2 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_kurir_cepat.png',
    },
    'pustakawan_kiamat': {
      name: 'Pustakawan Kiamat',
      description: 'Kamu adalah penjaga pengetahuan lama. Di tengah kekacauan, kamu percaya bahwa buku dan data adalah kunci untuk membangun kembali dunia. (+1 Kecerdasan, +1 Karisma)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 1 }, { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 1 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_pustakawan_kiamat.png',
    },
    'seniman_grafiti': {
      name: 'Seniman Grafiti',
      description: 'Bagimu, tembok kota adalah kanvas. Kamu meninggalkan jejak di mana-mana, sebuah simbol perlawanan dan harapan di dunia yang kelam. (+1 Ketangkasan, +1 Karisma)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 1 }, { type: 'ATTRIBUTE_MOD', key: 'karisma', value: 1 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_seniman_grafiti.png',
    },
    'pengawal_pribadi': {
      name: 'Pengawal Pribadi',
      description: 'Sebelumnya, kamu melindungi orang kaya. Sekarang, keahlianmu dalam pertarungan jarak dekat membuatmu bertahan hidup. (+1 Kekuatan, +1 Ketangkasan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 1 }, { type: 'ATTRIBUTE_MOD', key: 'ketangkasan', value: 1 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_pengawal_pribadi.png',
    },
    'petani_hidroponik': {
      name: 'Petani Hidroponik',
      description: 'Saat tanah terkontaminasi, kamu belajar menanam pangan dengan air dan teknologi. Keahlianmu menyediakan makanan adalah hal langka. (+1 Kecerdasan, +1 Kekuatan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 1 }, { type: 'ATTRIBUTE_MOD', key: 'kekuatan', value: 1 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_petani_hidroponik.png',
    },
    'kultis_puing': {
      name: 'Kultis Puing',
      description: 'Kamu menemukan makna spiritual di tengah kehancuran. Kamu memimpin kelompok kecil yang percaya pada pertanda dan ramalan dari reruntuhan. (+1 Karisma, +1 Kecerdasan)',
      effects: [{ type: 'ATTRIBUTE_MOD', key: 'karisma', value: 1 }, { type: 'ATTRIBUTE_MOD', key: 'kecerdasan', value: 1 }],
      portraitUrl: 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/portraits/player_kultis_puing.png',
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
      skripDrop: [5, 10],
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
        skripDrop: [15, 30],
    },
    'perampok': {
      name: 'Perampok',
      description: 'Manusia kejam yang hidup dari menjarah orang lain. Mereka sering bergerak dalam kelompok kecil.',
      hp: 60,
      attack: 15,
      defense: 8,
      xpValue: 40,
      lootTable: [
          { itemId: 'pipa_besi', chance: 0.5, quantity: [1, 1] },
          { itemId: 'air_kemasan', chance: 0.4, quantity: [1, 2] },
          { itemId: 'jaket_kulit_usang', chance: 0.1, quantity: [1, 1] },
      ],
      skripDrop: [20, 45],
    },
    'anomali_tengkorak': {
        name: 'Anomali Tengkorak',
        description: 'Makhluk aneh yang tampak seperti tengkorak melayang dengan energi aneh. Gerakannya tidak menentu.',
        hp: 40,
        attack: 18,
        defense: 3,
        xpValue: 35,
        lootTable: [
          { itemId: 'komponen_elektronik', chance: 0.3, quantity: [1, 2] },
          { itemId: 'baterai_bekas', chance: 0.2, quantity: [1, 1] },
        ],
        skripDrop: [10, 25],
    },
    'anomali_jamur': {
        name: 'Anomali Jamur',
        description: 'Gumpalan jamur berjalan yang menyebarkan spora beracun. Jangan terlalu dekat.',
        hp: 80,
        attack: 10,
        defense: 10,
        xpValue: 50,
        lootTable: [
            { itemId: 'perban', chance: 0.2, quantity: [1, 1] },
            { itemId: 'makanan_kaleng', chance: 0.1, quantity: [1, 1] },
        ],
        skripDrop: [30, 60],
    },
    'ratu_anomali': {
        name: 'Ratu Anomali',
        description: 'Entitas besar dan mengerikan yang tampaknya menjadi pusat dari aktivitas anomali di sekitarnya.',
        hp: 200,
        attack: 25,
        defense: 15,
        xpValue: 200,
        lootTable: [
            { itemId: 'stimulan', chance: 1, quantity: [1, 2] },
            { itemId: 'data_chip', chance: 0.5, quantity: [1, 1] },
        ],
        skripDrop: [150, 300],
    },
  },
  recipes: {
    'perban_darurat': {
        name: 'Perban Darurat',
        result: { itemId: 'perban', quantity: 1 },
        ingredients: [{ itemId: 'kain_bekas', quantity: 2 }],
    },
    'rompi_rakitan': {
        name: 'Rompi Rakitan',
        result: { itemId: 'rompi_improvisasi', quantity: 1 },
        ingredients: [
            { itemId: 'plastik_bekas', quantity: 5 },
            { itemId: 'selotip', quantity: 2 },
            { itemId: 'kain_bekas', quantity: 3 },
        ],
    },
  },
  quests: {
    'cari_air': {
        name: 'Sumber Air Bersih',
        description: 'Bertahan hidup butuh air. Kamu harus mencari sumber air minum yang aman di sekitar sini.',
    },
    'investigasi_sinyal': {
        name: 'Investigasi Sinyal Aneh',
        description: 'Sebuah sinyal radio lemah terdeteksi dari arah stasiun MRT. Cari tahu sumbernya.',
    },
    'tawaran_saudagar': {
        name: 'Tawaran Saudagar',
        description: 'Seorang saudagar menawarkan peta ke \'gudang aman\', tapi dia meminta bayaran yang tinggi. Putuskan apakah ini layak dipercaya.',
    },
    'bantu_republik': {
        name: 'Bantu Patroli Republik',
        description: 'Sebuah patroli Republik Merdeka meminta bantuanmu untuk membersihkan area dari perampok.',
    }
  }
};