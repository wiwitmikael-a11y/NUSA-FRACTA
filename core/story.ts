// core/story.ts
import { Chapter } from "../types";

export const chapter1: Chapter = {
    chapterId: "bab1_gema_di_sudirman",
    startNodeId: "awal_sudirman",
    nodes: [
        // START
        {
            nodeId: "awal_sudirman",
            narrative: "Debu dan keheningan menyelimuti Jalan Sudirman. Rangka-rangka gedung pencakar langit yang hangus mencakar langit kelabu. Kamu baru saja memanjat keluar dari stasiun MRT Dukuh Atas yang pengap, dan udara malam yang tercemar terasa menusuk paru-paru. Sekitar seratus meter di depan, di dekat bangkai Monumen Selamat Datang, kelip api unggun memecah kegelapan. Di sebelah kirimu, pintu kaca sebuah gedung perkantoran modern tampak pecah, menganga seperti mulut gua yang gelap.",
            location: "Jalan Jenderal Sudirman",
            choices: [
                { text: "Mendekati api unggun dengan hati-hati.", targetNodeId: "mendekati_api_unggun", effects: [] },
                { text: "Menyelidiki gedung perkantoran yang gelap.", targetNodeId: "masuki_lobi_gedung", effects: [] },
                { text: "Menggeledah reruntuhan halte bus TransJakarta di dekatmu.", targetNodeId: "geledah_halte_bus", effects: [] }
            ]
        },
        // JALUR 1: API UNGGUN
        {
            nodeId: "mendekati_api_unggun",
            narrative: "Kamu melangkah perlahan, memanfaatkan bangkai mobil sebagai perlindungan. Semakin dekat, kamu bisa melihat tiga sosok duduk mengelilingi api yang berasal dari tong sampah. Mereka mengenakan pakaian tambal sulam dan salah satunya memegang senapan rakitan. Mereka belum melihatmu. Kamu bisa mencoba menyapa mereka, atau mencari posisi yang lebih baik untuk mengamati.",
            location: "Sekitar Bundaran HI",
            choices: [
                { text: "Keluar dari persembunyian dengan tangan terangkat, menunjukkan niat damai.", targetNodeId: "sapa_penjaga_api", effects: [] },
                { text: "[Kecerdasan > 5] Mencari tempat lebih tinggi untuk mengintai mereka dari jauh.", targetNodeId: "intai_dari_jpo", condition: [{ type: 'ATTRIBUTE', key: 'kecerdasan', value: 6 }], effects: [{ type: 'ADD_XP', key: 'intel', value: 5 }] }
            ]
        },
        {
            nodeId: "sapa_penjaga_api",
            narrative: "Saat kamu melangkah keluar, ketiga orang itu langsung berdiri, dan si pemegang senapan mengarahkannya padamu. 'Berhenti!' bentak seorang wanita paruh baya yang tampaknya menjadi pemimpin mereka. 'Siapa kamu? Apa urusanmu di sini?' Wajah mereka tegang, campuran antara rasa takut dan kelelahan. Ini adalah momen krusial.",
            location: "Api Unggun Bundaran HI",
            choices: [
                { text: "[Karisma > 6] 'Tenang, saya hanya seorang pengelana. Saya tidak mencari masalah.'", targetNodeId: "dialog_damai", condition: [{ type: 'ATTRIBUTE', key: 'karisma', value: 7 }], effects: [{ type: 'ADD_XP', key: 'diplomacy', value: 10 }] },
                { text: "[Kekuatan > 7] 'Turunkan senjatamu atau kau akan menyesal.'", targetNodeId: "konfrontasi_tegang", condition: [{ type: 'ATTRIBUTE', key: 'kekuatan', value: 8 }], effects: [] },
                { text: "'Aku melihat apimu. Aku hanya butuh istirahat sejenak.'", targetNodeId: "permintaan_netral", effects: [] }
            ]
        },
        {
            nodeId: "dialog_damai",
            narrative: "Mendengar nada bicaramu yang tenang, ketegangan mereka sedikit mereda. Wanita itu, Davina, menurunkan senapannya sedikit. 'Pengelana, ya? Jarang ada yang masih waras di luar sini. Kami dari Plaza Indonesia, mencari persediaan. Alat penyaring air kami rusak. Ada satu komponen penting, filter karbon, yang seharusnya ada di gedung perkantoran di seberang jalan. Tapi kami dengar tempat itu sudah jadi sarang Gerombolan Besi.'",
            location: "Api Unggun Bundaran HI",
            choices: [
                { text: "'Aku bisa mengambilkannya untuk kalian.'", targetNodeId: "terima_tugas_davina", effects: [{ type: 'ADD_XP', key: 'quest', value: 10 }, { type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: 5 }] },
                { text: "'Gerombolan Besi? Kedengarannya berbahaya. Semoga kalian beruntung.'", targetNodeId: "akhir_bab_netral_setelah_info", effects: [] }
            ]
        },
        {
            nodeId: "konfrontasi_tegang",
            narrative: "Ancamanmu membuat suasana semakin panas. Pria di sebelah Davina mengeluarkan golok. 'Cari mati, hah?!' geramnya. 'Orang sepertimu yang bikin Jakarta jadi neraka!' Davina menahannya, tapi matanya menatapmu tajam. 'Pergi. Sekarang. Ini peringatan terakhir.'",
            location: "Api Unggun Bundaran HI",
            choices: [
                { text: "Mengalah dan pergi.", targetNodeId: "awal_sudirman", effects: [{ type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: -5 }] },
                { text: "'Aku tidak akan diancam.' (Memicu perkelahian)", targetNodeId: "pertarungan_api_unggun", effects: [{ type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: -15 }, { type: 'START_COMBAT', key: 'penjarah_golok', value: 1 }] }
            ]
        },
        {
             nodeId: "permintaan_netral",
             narrative: "Davina menatapmu curiga, menilai setiap gerakanmu. 'Dunia ini keras,' katanya. 'Kami tidak bisa percaya begitu saja pada orang asing.' Dia memberi isyarat agar kamu duduk di jarak yang aman. Suasana tetap tegang, dan jelas mereka tidak akan berbagi informasi atau sumber daya dengan mudah.",
             location: "Api Unggun Bundaran HI",
             choices: [
                 { text: "Tunggu dengan sabar, mungkin mereka akan pergi.", targetNodeId: "menunggu_di_jpo", effects: []},
                 { text: "Bangkit dan pergi mencari tempat lain.", targetNodeId: "awal_sudirman", effects: []}
             ]
        },
        {
            nodeId: "intai_dari_jpo",
            narrative: "Kamu menemukan tangga darurat menuju JPO yang rusak. Dari atas sini, kamu memiliki pandangan yang jelas ke arah api unggun. Mereka tampak seperti penyintas biasa, bukan gerombolan penjarah. Mereka berbagi makanan kaleng dan berbicara dengan suara pelan. Kamu melihat peta lusuh terbentang di antara mereka. Tiba-tiba, salah satu dari mereka mendongak dan matanya seolah bertemu dengan matamu. Mereka menyadari kehadiranmu.",
            location: "Jembatan Penyeberangan Orang (JPO)",
            choices: [
                { text: "Segera turun dan menghampiri mereka sebelum mereka panik.", targetNodeId: "sapa_penjaga_api", effects: [] },
                { text: "Tetap bersembunyi dan menunggu mereka pergi.", targetNodeId: "menunggu_di_jpo", effects: [] }
            ]
        },
        {
            nodeId: "menunggu_di_jpo",
            narrative: "Kamu menunggu dalam diam. Setelah sekitar satu jam, kelompok itu memadamkan api, mengemasi barang-barang mereka, dan bergerak ke arah utara, menghilang di antara reruntuhan. Tempat itu sekarang aman untuk diperiksa.",
            location: "Jembatan Penyeberangan Orang (JPO)",
            choices: [
                { text: "Turun dan periksa bekas perkemahan mereka.", targetNodeId: "bekas_perkemahan", effects: []}
            ]
        },
        {
             nodeId: "bekas_perkemahan",
             narrative: "Kamu turun ke lokasi api unggun yang sekarang sudah padam. Asap tipis masih mengepul dari tong sampah. Mereka tidak meninggalkan banyak hal, tetapi saat mengais-ngais abu, kamu menemukan sebuah catatan yang hangus sebagian. Sebagian besar tidak terbaca, kecuali kata-kata: '...filter karbon... ...gedung... ...Gerombolan Besi...'",
             location: "Api Unggun Bundaran HI",
             choices: [
                { text: "Informasi ini mungkin berguna. Lanjutkan penjelajahan.", targetNodeId: "awal_sudirman", effects: [{ type: 'SET_FLAG', key: 'petunjuk_filter_karbon', value: 1}]}
             ]
        },
        {
            nodeId: "terima_tugas_davina",
            narrative: "Davina menatapmu dengan terkejut, lalu secercah harapan muncul di matanya. 'Kamu serius? Itu akan sangat membantu kami. Hati-hati, gedung itu gelap dan tak terduga. Ambil ini,' katanya sambil menyerahkan beberapa perban bersih. 'Jika kamu berhasil, kembalilah. Kami akan memberimu imbalan yang pantas dan menunjukkan jalan aman ke Plaza Indonesia.'",
            location: "Api Unggun Bundaran HI",
            choices: [
                { text: "'Aku akan kembali secepatnya.' (Menuju gedung kantor)", targetNodeId: "masuki_lobi_gedung", effects: [{ type: 'ADD_ITEM', key: 'perban', value: 2 }, { type: 'SET_FLAG', key: 'misi_filter_karbon', value: 1 }] }
            ]
        },
        {
            nodeId: "pertarungan_api_unggun",
            narrative: "Kamu sekarang berhadapan dengan penjarah yang marah. Dia mengacungkan goloknya dengan liar. Tidak ada jalan untuk kembali.",
            location: "Api Unggun Bundaran HI",
            choices: [
                { text: "Lanjutkan...", targetNodeId: "menang_pertarungan", effects: []}
            ]
        },
        {
            nodeId: "menang_pertarungan",
            narrative: "Penjarah itu tergeletak di tanah. Melihat rekannya jatuh, Davina dan satu orang lainnya tampak ketakutan. Mereka melempar senjata mereka dan lari ke dalam kegelapan, meninggalkan semua perbekalan mereka. Kamu menang, tapi rasa bersalah dan adrenalin menguasaimu.",
            location: "Api Unggun Bundaran HI",
            choices: [
                { text: "Ambil semua barang mereka dan pergi.", targetNodeId: "akhir_bab_menang_brutal", effects: [{ type: 'ADD_ITEM', key: 'senapan_rakitan', value: 1 }, { type: 'ADD_ITEM', key: 'makanan_kaleng', value: 3 }, { type: 'ADD_ITEM', key: 'air_minum', value: 2 }, { type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: -25 }] }
            ]
        },
        // JALUR 2: GEDUNG KANTOR
        {
            nodeId: "masuki_lobi_gedung",
            narrative: "Kamu melangkahi pecahan kaca dan masuk ke dalam lobi yang megah namun hancur. Kegelapan pekat menyelimutimu. Udara di dalam terasa dingin dan berbau apak. Di tengah lobi, ada meja resepsionis marmer yang terbalik. Di belakangnya ada pintu keamanan yang tertutup rapat. Tangga darurat di sudut ruangan tampak bisa diakses.",
            location: "Lobi Gedung Perkantoran",
            choices: [
                { text: "Periksa area meja resepsionis untuk mencari sesuatu yang berguna.", targetNodeId: "periksa_resepsionis", effects: [] },
                { text: "Langsung menuju tangga darurat untuk naik ke lantai atas.", targetNodeId: "naik_tangga_lantai2", effects: [] }
            ]
        },
        {
            nodeId: "periksa_resepsionis",
            narrative: "Kamu menggeledah laci-laci meja yang terbuka. Sebagian besar isinya hanya kertas-kertas yang sudah membusuk. Namun, di laci paling bawah, kamu menemukan sebuah kotak P3K kecil dan sebuah senter tanpa baterai. Tiba-tiba, kamu mendengar suara decitan dari arah pintu keamanan.",
            location: "Meja Resepsionis Lobi",
            choices: [
                { text: "Mengambil barang, lalu segera naik ke tangga darurat.", targetNodeId: "naik_tangga_lantai2", effects: [{ type: 'ADD_ITEM', key: 'kotak_p3k', value: 1 }, { type: 'ADD_ITEM', key: 'senter_rusak', value: 1 }] },
                { text: "[Keahlian: Peretas] Mencoba membuka pintu keamanan.", targetNodeId: "ruang_keamanan", condition: [{ type: 'HAS_SKILL', key: 'peretas', value: 1 }], effects: [{ type: 'ADD_XP', key: 'hacking', value: 10 }] },
                { text: "Menggedor pintu keamanan dan berteriak, 'Ada orang di sana?'", targetNodeId: "gedor_pintu_keamanan", effects: [] }
            ]
        },
        {
            nodeId: "gedor_pintu_keamanan",
            narrative: "Gedoranmu menggema di lobi yang sunyi. Setelah hening sejenak, suara geraman rendah terdengar dari balik pintu, diikuti oleh suara cakaran yang panik. Apa pun yang ada di dalam sana bukanlah manusia dan kedengarannya tidak ramah.",
            location: "Meja Resepsionis Lobi",
            choices: [
                 { text: "Lebih baik tidak berurusan dengan itu. Naik ke tangga darurat.", targetNodeId: "naik_tangga_lantai2", effects: []}
            ]
        },
        {
            nodeId: "ruang_keamanan",
            narrative: "Dengan beberapa manuver cekatan pada panel kunci, pintu itu berbunyi 'klik' dan terbuka. Di dalam ruangan kecil itu penuh dengan monitor mati. Namun, satu terminal darurat masih menyala dengan layar hijau berkedip. Di sudut ruangan, sebuah loker senjata baja berdiri kokoh. Sepertinya butuh kode untuk membukanya.",
            location: "Ruang Keamanan",
            choices: [
                { text: "[Kecerdasan > 7] Periksa terminal untuk mencari informasi.", targetNodeId: "terminal_aktif", condition: [{ type: 'ATTRIBUTE', key: 'kecerdasan', value: 8 }], effects: [{ type: 'ADD_XP', key: 'intel', value: 15 }] },
                { text: "[Kekuatan > 9] Coba bongkar paksa loker senjata.", targetNodeId: "bongkar_loker", condition: [{ type: 'ATTRIBUTE', key: 'kekuatan', value: 10 }], effects: [{ type: 'ADD_XP', key: 'strength', value: 10 }] },
                { text: "Mengabaikan semuanya dan kembali ke lobi.", targetNodeId: "masuki_lobi_gedung", effects: [] }
            ]
        },
         {
            nodeId: "bongkar_loker",
            narrative: "Kamu mengerahkan seluruh kekuatanmu untuk membongkar engsel loker. Dengan suara robekan logam yang memekakkan telinga, pintunya terbuka. Namun, upaya itu membuatmu sangat kelelahan.",
            location: "Ruang Keamanan",
            choices: [
                { text: "Lihat isinya.", targetNodeId: "buka_loker_sukses", effects: [{ type: 'CHANGE_HP', key: 'fatigue', value: -10 }] }
            ]
        },
        {
            nodeId: "terminal_aktif",
            narrative: "Kamu mengakses terminal. Sebagian besar data rusak, tapi kamu menemukan log terakhir sebelum 'Kilatan Senja'. Isinya: 'Anomali energi terdeteksi. Protokol 734 diaktifkan. Semua data penting dialihkan ke ORACLE. Bursa Efek Jakarta adalah prioritas. Lupakan yang lain.' Di baris terakhir ada catatan teknisi: 'Sialan, kode loker senjata diubah lagi. Untung aku menuliskannya di bawah meja. 1-9-8-4.'",
            location: "Ruang Keamanan",
            choices: [
                { text: "Gunakan kode 1984 untuk membuka loker.", targetNodeId: "buka_loker_sukses", effects: [{ type: 'ADD_XP', key: 'intel', value: 10 }] },
                { text: "Keluar dari ruangan dengan informasi baru tentang 'Oracle' dan BEJ.", targetNodeId: "akhir_bab_info_teknokrat", effects: [{ type: 'ADD_XP', key: 'discovery', value: 30 }, { type: 'SET_FLAG', key: 'petunjuk_oracle_bej', value: 1 }] }
            ]
        },
        {
            nodeId: "buka_loker_sukses",
            narrative: "Pintu loker yang berat terbuka. Di dalamnya, tersimpan rapi sebuah pistol polisi 9mm, dua kotak amunisi penuh, dan rompi anti peluru yang sedikit usang. Ini adalah harta karun di dunia seperti ini.",
            location: "Ruang Keamanan",
            choices: [
                { text: "Ambil semuanya dan lanjutkan penjelajahan.", targetNodeId: "naik_tangga_lantai2", effects: [{ type: 'ADD_ITEM', key: 'pistol_9mm', value: 1 }, { type: 'ADD_ITEM', key: 'peluru_9mm', value: 24 }, { type: 'ADD_ITEM', key: 'rompi_anti_peluru', value: 1 }] }
            ]
        },
        {
            nodeId: "naik_tangga_lantai2",
            narrative: "Anak tangga beton terasa dingin di bawah kakimu. Di lantai dua, pintu menuju ruang kantor sedikit terbuka, memperlihatkan barisan bilik kerja yang berantakan. Namun, kamu mencium bau asap rokok yang tajam dan mendengar suara bisikan kasar dari dalam. Jelas ada orang di sana.",
            location: "Tangga Darurat",
            choices: [
                { text: "[Ketangkasan > 7] Mengintip melalui celah pintu tanpa suara.", targetNodeId: "intip_ruang_kantor", condition: [{ type: 'ATTRIBUTE', key: 'ketangkasan', value: 8 }], effects: [{ type: 'ADD_XP', key: 'stealth', value: 5 }] },
                { text: "Langsung masuk dan hadapi siapa pun yang ada di dalam.", targetNodeId: "konfrontasi_penjarah_langsung", effects: [] },
                { text: "Mengabaikan lantai dua dan terus naik ke lantai tiga.", targetNodeId: "menuju_lantai_tiga", effects: [] }
            ]
        },
        {
            nodeId: "intip_ruang_kantor",
            narrative: "Kamu menempelkan mata ke celah pintu. Dua orang anggota Gerombolan Besi sedang menggeledah laci-laci. Mereka memakai pelindung dari ban bekas dan memegang pipa besi. 'Tidak ada apa-apa di sini, Rizky,' kata salah satunya. 'Baja akan menguliti kita jika kita kembali dengan tangan kosong.' Mereka belum menyadari keberadaanmu. Ini kesempatanmu.",
            location: "Celah Pintu Lantai 2",
            choices: [
                { text: "Menyerang mereka saat lengah.", targetNodeId: "konfrontasi_penjarah_menyelinap", effects: [] },
                { text: "Mundur diam-diam dan naik ke lantai tiga.", targetNodeId: "menuju_lantai_tiga", effects: [{ type: 'ADD_XP', key: 'stealth', value: 10 }] }
            ]
        },
        {
            nodeId: "konfrontasi_penjarah_menyelinap",
            narrative: "Kamu mendobrak pintu dan menyerang sebelum mereka sempat bereaksi. Satu penjarah jatuh sebelum sempat mengangkat senjatanya. Tinggal satu lagi, yang kini menatapmu dengan campuran kaget dan marah.",
            location: "Ruang Kantor Lantai 2",
            choices: [
                 { text: "Habisi dia.", targetNodeId: "pertarungan_penjarah_pipa", effects: []}
            ]
        },
        {
            nodeId: "konfrontasi_penjarah_langsung",
            narrative: "Kamu mendobrak pintu. Dua penjarah itu terkejut dan langsung bersiaga. 'Lihat apa yang kita punya di sini,' seringai salah satunya, memperlihatkan gigi yang ompong. 'Seekor tikus kesepian. Serahkan barangmu, dan mungkin kami akan membiarkanmu hidup.'",
            location: "Ruang Kantor Lantai 2",
            choices: [
                { text: "Lawan mereka.", targetNodeId: "pertarungan_penjarah_pipa", effects: []}
            ]
        },
        {
             nodeId: "pertarungan_penjarah_pipa",
             narrative: "Para penjarah Gerombolan Besi menyerang dengan brutal. Pipa besi mereka ayunkan dengan membabi buta.",
             location: "Ruang Kantor Lantai 2",
             choices: [
                 { text: "Lanjutkan...", targetNodeId: "geledah_penjarah", effects: [{ type: 'START_COMBAT', key: 'penjarah_pipa', value: 1}] }
             ]
        },
        {
            nodeId: "geledah_penjarah",
            narrative: "Setelah pertarungan yang sengit, kamu menggeledah kantong mereka. Kamu menemukan beberapa makanan ringan yang sudah basi, sebuah kunci inggris, dan sebuah catatan kumal. Catatan itu bertuliskan: 'Target: Gudang Medis di dekat Manggarai. Bawa semua 'Obat Penenang'.",
            location: "Ruang Kantor Lantai 2",
            choices: [
                { text: "Ambil barang-barang itu dan lanjutkan ke lantai tiga.", targetNodeId: "menuju_lantai_tiga", effects: [{ type: 'ADD_ITEM', key: 'makanan_basi', value: 2 }, { type: 'ADD_ITEM', key: 'kunci_inggris', value: 1 }, { type: 'SET_FLAG', key: 'petunjuk_gudang_manggarai', value: 1 }] }
            ]
        },
        {
            nodeId: "menuju_lantai_tiga",
            narrative: "Kamu melanjutkan perjalanan menaiki tangga. Udara semakin dingin. Pintu ke lantai tiga terbuka, mengarah ke area pantry dan ruang rekreasi. Di sini lebih sunyi, tapi bau busuk yang aneh tercium dari dalam pantry.",
            location: "Tangga Darurat antara Lantai 2 & 3",
            choices: [
                { text: "Periksa pantry, sumber bau busuk itu.", targetNodeId: "periksa_pantry", effects: [] },
                { text: "Cari ruang penyimpanan atau utilitas.", targetNodeId: "cari_ruang_utilitas", effects: [] }
            ]
        },
        {
             nodeId: "periksa_pantry",
             narrative: "Saat kamu membuka pintu pantry, bau busuk itu menghantammu dengan keras. Sumbernya adalah kulkas industri yang mati, pintunya sedikit terbuka. Di dalamnya ada sesuatu yang sudah membusuk. Namun, di rak atas yang bersih, kamu melihat beberapa botol air mineral dan makanan kaleng yang belum tersentuh.",
             location: "Pantry Lantai 3",
             choices: [
                 { text: "Ambil barang bersih dan segera keluar.", targetNodeId: "cari_ruang_utilitas", effects: [{ type: 'ADD_ITEM', key: 'air_minum', value: 2 }, { type: 'ADD_ITEM', key: 'makanan_kaleng', value: 2 }] }
             ]
        },
        {
            nodeId: "cari_ruang_utilitas",
            narrative: "Kamu menemukan sebuah pintu dengan tanda 'RUANG MEKANIKAL'. Di dalamnya, kamu melihat sistem ventilasi dan pemurnian air gedung. Di salah satu unit yang rusak, kamu melihat sebuah tabung filter karbon yang tampak persis seperti yang dideskripsikan Davina.",
            location: "Koridor Lantai 3",
            choices: [
                { text: "Ambil filter dan kembali ke Davina.", targetNodeId: "kembali_ke_davina", effects: [{ type: 'ADD_ITEM', key: 'filter_karbon', value: 1 }] },
                { text: "Ambil filter, tapi lanjutkan naik ke atap untuk melihat situasi.", targetNodeId: "atap_gedung", effects: [{ type: 'ADD_ITEM', key: 'filter_karbon', value: 1 }] }
            ]
        },
        {
             nodeId: "atap_gedung",
             narrative: "Pintu menuju atap terbuka dengan derit. Angin malam meniup wajahmu. Dari sini, kamu bisa melihat seluruh bentangan Sudirman yang gelap, hanya diterangi oleh kilat sesekali di kejauhan dan beberapa api unggun yang tersebar. Pemandangan ini memberimu gambaran yang lebih baik tentang dunia yang hancur ini.",
             location: "Atap Gedung",
             choices: [
                 { text: "Turun dan kembali ke Davina.", targetNodeId: "kembali_ke_davina", effects: [{ type: 'ADD_XP', key: 'exploration', value: 15 }] }
             ]
        },

        // JALUR 3: HALTE BUS
        {
             nodeId: "geledah_halte_bus",
             narrative: "Rangka halte bus yang hangus berdiri miring. Di dalamnya, hanya ada poster-poster yang sudah luntur dan pecahan kaca. Namun, di bawah bangku logam yang terbalik, kamu melihat sebuah tas selempang yang terjepit.",
             location: "Halte Bus TransJakarta",
             choices: [
                 { text: "[Kekuatan > 5] Coba angkat bangku untuk mengambil tas.", targetNodeId: "ambil_tas_halte", condition: [{ type: 'ATTRIBUTE', key: 'kekuatan', value: 6 }], effects: []},
                 { text: "Abaikan saja, sepertinya tidak ada yang berharga.", targetNodeId: "awal_sudirman", effects: []}
             ]
        },
        {
             nodeId: "ambil_tas_halte",
             narrative: "Dengan sedikit usaha, kamu berhasil mengangkat bangku yang berat itu. Tas selempang itu terbuat dari kanvas tebal. Di dalamnya, kamu menemukan peta usang Jakarta Pusat dengan beberapa lokasi dilingkari spidol merah, dan sebuah komponen elektronik yang aneh.",
             location: "Halte Bus TransJakarta",
             choices: [
                 { text: "Ambil barang-barang itu dan lanjutkan.", targetNodeId: "awal_sudirman", effects: [{ type: 'ADD_ITEM', key: 'peta_usang', value: 1 }, { type: 'ADD_ITEM', key: 'komponen_elektronik', value: 1 }, { type: 'ADD_XP', key: 'scavenging', value: 15 }] }
             ]
        },

        // ENDINGS
        {
            nodeId: "kembali_ke_davina",
            narrative: "Kamu kembali ke api unggun dengan filter di tangan. Wajah Davina bersinar karena lega. 'Kamu berhasil! Kami berhutang padamu,' katanya tulus. 'Seperti yang dijanjikan, ini imbalanmu.' Dia memberimu senapan rakitan yang tadi dipegangnya. 'Dan ini jalan ke Plaza Indonesia. Ikuti jalan ini, lewati patung kuda, cari spanduk besar 'HARAPAN'. Katakan 'Davina mengirimku' pada penjaga. Mereka akan membiarkanmu masuk. Sampai jumpa di sana, kawan.'",
            location: "Api Unggun Bundaran HI",
            isChapterEnd: true,
            choices: [],
            effects: [{ type: 'ADD_ITEM', key: 'senapan_rakitan', value: 1 }, { type: 'ADD_XP', key: 'quest_complete', value: 50 }, { type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: 25 }, { type: 'SET_FLAG', key: 'misi_filter_karbon', value: 0 }]
        },
        {
            nodeId: "akhir_bab_dirampok",
            narrative: "Pukulan terakhir membuat pandanganmu kabur. Kamu terbangun beberapa waktu kemudian di sebuah gang yang pesing, kepalamu pusing. Kantongmu telah dikosongkan. Mereka mengambil sebagian besar perbekalanmu, meninggalkanmu hanya dengan pakaian yang melekat di tubuh. Malam ini adalah pelajaran yang pahit tentang kekejaman NUSA FRACTA.",
            location: "Gang Gelap",
            isChapterEnd: true,
            choices: [],
            effects: [{ type: 'REMOVE_ITEM', key: 'air_minum', value: 1 }, { type: 'REMOVE_ITEM', key: 'makanan_ringan', value: 1 }]
        },
        {
            nodeId: "akhir_bab_info_teknokrat",
            narrative: "Kamu memutuskan informasi lebih berharga daripada senjata. Nama 'Oracle' dan 'BEJ' terngiang di kepalamu. Mungkinkah ini faksi Teknokrat yang selama ini hanya menjadi desas-desus? Sebuah kelompok misterius yang memuja teknologi lama. Kamu mungkin belum siap menghadapi mereka, tapi sekarang kamu tahu di mana harus mulai mencari. Pengetahuan adalah kekuatan, dan malam ini kamu menjadi lebih kuat.",
            location: "Ruang Keamanan",
            isChapterEnd: true,
            choices: []
        },
         {
            nodeId: "akhir_bab_menang_brutal",
            narrative: "Kamu berdiri di antara barang-barang rampasan, suara langkah kaki mereka yang ketakutan menghilang ditelan malam. Kemenangan ini terasa hampa. Kamu mendapatkan sumber daya, tetapi juga musuh baru. Di NUSA FRACTA, setiap tindakan memiliki gema.",
            location: "Api Unggun Bundaran HI",
            isChapterEnd: true,
            choices: []
        },
         {
            nodeId: "akhir_bab_netral_setelah_info",
            narrative: "Kamu meninggalkan kelompok Davina dengan informasi baru tentang Gerombolan Besi dan Plaza Indonesia. Kamu memutuskan untuk tidak terlibat lebih jauh untuk saat ini. Di dunia yang hancur ini, terkadang pilihan terbaik adalah tidak memilih sama sekali dan terus berjalan. Malam masih panjang.",
            location: "Jalanan Gelap",
            isChapterEnd: true,
            choices: []
        },
    ]
};