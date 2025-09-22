// core/events.ts
import { RandomEvent, GameState, ItemId } from '../types';
import { codex } from './codex';

// Helper untuk membuat event perdagangan yang dinamis
const createDynamicTradeEvent = (): RandomEvent => {
    const tradeableItems: ItemId[] = [
        'air_kemasan', 
        'makanan_kaleng', 
        'perban', 
        'komponen_elektronik', 
        'selotip', 
        'bat_baseball', 
        'pisau_dapur',
        'palu_godam',
        'kabel_tembaga',
        'pelindung_bahu_rakitan',
    ];
    const selectedItemId = tradeableItems[Math.floor(Math.random() * tradeableItems.length)];
    const item = codex.items[selectedItemId];
    const basePrice = Math.floor(item.value * 1.5); // Harga jual pedagang
    const hagglePrice = Math.floor(basePrice * 0.8); // Harga setelah tawar

    return {
        id: `pedagang_dinamis_${selectedItemId}`,
        type: 'trade',
        npc: {
            name: 'Saudagar Jalanan',
            portraitKey: 'faksi_saudagar_jalanan_01.png',
            faction: 'saudagar_jalanan',
        },
        narrative: `Seorang pria dengan tumpukan barang dagangan di punggungnya tersenyum licik. "Hei, kawan. Aku punya ${item.name} kualitas bagus. Mau beli? Hanya ${basePrice} Skrip."`,
        choices: [
            {
                text: `[Beli] ${item.name} seharga ${basePrice} Skrip.`,
                condition: [{ type: 'HAS_SKRIP', key: 'skrip', value: basePrice }],
                effects: [
                    { type: 'CHANGE_SKRIP', value: -basePrice, message: `Kamu kehilangan ${basePrice} Skrip.` },
                    { type: 'GAIN_ITEM', key: selectedItemId, value: 1, message: `Kamu mendapatkan 1 ${item.name}.` }
                ]
            },
            {
                text: `[Karisma 6+] Tawar menjadi ${hagglePrice} Skrip.`,
                 condition: [
                    { type: 'ATTRIBUTE', key: 'karisma', value: 6 },
                    { type: 'HAS_SKRIP', key: 'skrip', value: hagglePrice },
                ],
                 effects: [
                    { type: 'CHANGE_SKRIP', value: -hagglePrice, message: `Tawaran berhasil! Kamu kehilangan ${hagglePrice} Skrip.` },
                    { type: 'GAIN_ITEM', key: selectedItemId, value: 1, message: `Kamu mendapatkan 1 ${item.name}.` }
                 ]
            },
            {
                text: 'Lain kali saja.',
                effects: [
                     { type: 'NOTHING', message: 'Kamu menolak tawaran pedagang itu.' }
                ]
            }
        ]
    };
};


export const randomEvents: RandomEvent[] = [
    {
        id: 'warga_minta_tolong',
        type: 'dialogue',
        npc: {
            name: 'Warga Terluka',
            portraitKey: 'npc_warga_01.png',
            faction: 'sisa_kemanusiaan',
        },
        narrative: 'Seorang warga sipil dengan pakaian compang-camping memberi isyarat padamu. "Tolong," bisiknya, menunjuk ke luka di lengannya. "Apa kau punya perban?"',
        choices: [
            {
                text: '[Beri Perban] Tentu, ini untukmu.',
                condition: [{ type: 'HAS_ITEM', key: 'perban', value: 1 }],
                effects: [
                    { type: 'LOSE_ITEM', key: 'perban', value: 1, message: 'Kamu memberikan 1 Perban.' },
                    { type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: 5, message: 'Reputasimu dengan Sisa Kemanusiaan meningkat.' }
                ]
            },
            {
                text: 'Maaf, aku tidak punya apa-apa untukmu.',
                effects: [
                    { type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: -2, message: 'Warga itu menatapmu dengan kecewa.' },
                    { type: 'NOTHING', message: 'Kamu melanjutkan perjalanan, meninggalkan warga itu dengan nasibnya sendiri.' }
                ]
            }
        ]
    },
    // Event Perdagangan Dinamis
    {...createDynamicTradeEvent()},
    {
        id: 'perekrut_republik',
        type: 'dialogue',
        npc: {
            name: 'Perekrut Republik',
            portraitKey: 'faksi_republik_merdeka_01.png',
            faction: 'republik_merdeka',
        },
        narrative: 'Dua orang berseragam rapi dan lambang matahari terbit mendekatimu. "Kami dari Republik Merdeka," kata salah satunya. "Kami sedang membangun kembali masa depan. Tertarik untuk bergabung dengan tujuan mulia?"',
        choices: [
            {
                text: 'Ceritakan lebih banyak tentang Republik.',
                effects: [
                    { type: 'CHANGE_REPUTATION', key: 'republik_merdeka', value: 2, message: 'Mereka menghargai minatmu. Reputasi dengan Republik Merdeka sedikit meningkat.' }
                ]
            },
            {
                text: 'Aku tidak tertarik dengan faksi.',
                effects: [
                    { type: 'CHANGE_REPUTATION', key: 'republik_merdeka', value: -2, message: 'Mereka terlihat kecewa. Reputasi dengan Republik Merdeka sedikit menurun.' }
                ]
            }
        ]
    },
    {
        id: 'geng_bangsat_palak',
        type: 'threat',
        npc: {
            name: 'Anggota Geng Bangsat',
            portraitKey: 'faksi_geng_bangsat_01.png',
            faction: 'geng_bangsat'
        },
        narrative: 'Sekelompok orang berpenampilan sangar dengan cat semprot dan senjata rakitan menghadang jalanmu. "Dompet atau nyawa," geram salah satunya, "Serahkan Skrip-mu kalau mau lewat sini dengan aman."',
        choices: [
            {
                text: '[Serahkan 20 Skrip] Ambil ini dan jangan ganggu aku.',
                condition: [{ type: 'HAS_SKRIP', key: 'skrip', value: 20 }],
                effects: [
                    { type: 'CHANGE_SKRIP', value: -20, message: 'Kamu menyerahkan 20 Skrip. Mereka tertawa dan membiarkanmu lewat.' },
                ]
            },
            {
                text: '[Kekuatan 7+] Aku tidak akan memberikan apa-apa.',
                condition: [{ type: 'ATTRIBUTE', key: 'kekuatan', value: 7 }],
                effects: [
                    { type: 'START_COMBAT', key: 'preman_kumuh', message: 'Kamu menolak. "Pilihan yang bodoh!" teriaknya. Mereka menyerang!' }
                ]
            },
            {
                text: 'Aku tidak punya uang.',
                effects: [
                    { type: 'START_COMBAT', key: 'preman_kumuh', message: '"Bohong!" teriaknya. "Hajar dia dan periksa kantongnya!". Mereka menyerang!' }
                ]
            }
        ]
    },
    {
        id: 'penemuan_peti_terkunci',
        type: 'discovery',
        npc: {
            name: 'Sistem',
            portraitKey: '',
        },
        narrative: 'Di sudut sebuah ruangan yang hancur, kamu melihat sebuah peti logam yang kokoh. Sepertinya terkunci rapat, tapi mungkin isinya berharga.',
        choices: [
            {
                text: '[Ketangkasan 7+] Coba buka paksa kuncinya.',
                condition: [{ type: 'ATTRIBUTE', key: 'ketangkasan', value: 7 }],
                effects: [
                    { type: 'GAIN_ITEM', key: 'komponen_elektronik', value: 5, message: 'Dengan hati-hati, kamu berhasil membuka kunci peti. Kamu menemukan komponen!' },
                    { type: 'GAIN_ITEM', key: 'artefak_aneh', value: 1, message: 'Kamu juga menemukan sebuah artefak aneh.' }
                ]
            },
            {
                text: '[Kecerdasan 7+] Periksa mekanisme kuncinya.',
                condition: [{ type: 'ATTRIBUTE', key: 'kecerdasan', value: 7 }],
                effects: [
                     { type: 'GAIN_XP', value: 25, message: 'Kamu menemukan cara membuka peti tanpa merusaknya. Pengalaman berharga! (+25 XP)' },
                     { type: 'GAIN_ITEM', key: 'komponen_elektronik', value: 5, message: 'Kamu menemukan komponen elektronik.' },
                     { type: 'GAIN_ITEM', key: 'artefak_aneh', value: 1, message: 'Kamu juga menemukan sebuah artefak aneh.' }
                ]
            },
            {
                text: 'Tinggalkan saja. Terlalu berisiko.',
                effects: [
                    { type: 'NOTHING', message: 'Kamu memutuskan untuk tidak mengambil risiko dan meninggalkan peti itu.' }
                ]
            }
        ]
    },
    {
        id: 'pemburu_agraria_minta_makanan',
        type: 'dialogue',
        npc: {
            name: 'Pemburu Agraria',
            portraitKey: 'faksi_pemburu_agraria_01.png',
            faction: 'pemburu_agraria',
        },
        narrative: 'Seorang pemburu dengan kulit terbakar matahari menghentikanmu. "Aku sudah berhari-hari melacak mangsa tanpa hasil," katanya dengan suara serak. "Punya makanan lebih? Aku bisa menukarnya dengan beberapa bahan yang berguna."',
        choices: [
            {
                text: '[Beri Makanan Kaleng] Ini, ambillah.',
                condition: [{ type: 'HAS_ITEM', key: 'makanan_kaleng', value: 1 }],
                effects: [
                    { type: 'LOSE_ITEM', key: 'makanan_kaleng', value: 1, message: 'Kamu memberikan 1 Makanan Kaleng.' },
                    { type: 'GAIN_ITEM', key: 'kain_bekas', value: 3, message: 'Dia mengangguk berterima kasih dan memberimu beberapa kain.' },
                    { type: 'CHANGE_REPUTATION', key: 'pemburu_agraria', value: 5, message: 'Reputasimu dengan Pemburu Agraria meningkat.' }
                ]
            },
            {
                text: 'Aku harus menyimpan makananku sendiri.',
                effects: [
                    { type: 'CHANGE_REPUTATION', key: 'pemburu_agraria', value: -3, message: 'Pemburu itu mendengus dan berbalik pergi dengan kecewa.' },
                    { type: 'NOTHING', message: 'Kamu menyimpan persediaanmu untuk dirimu sendiri.' }
                ]
            }
        ]
    },
    {
        id: 'dilema_medis_pemukiman',
        type: 'dialogue',
        triggerCondition: (state: GameState) => state.player.inventory.some(item => item.itemId === 'stimulan'),
        npc: {
            name: 'Pemimpin Pemukiman',
            portraitKey: 'npc_warga_07.png',
            faction: 'sisa_kemanusiaan',
        },
        narrative: 'Pemimpin sebuah pemukiman kecil memanggilmu ke tenda medis. Wajahnya cemas. "Penyintas, kami dalam masalah besar. Wabah menyebar dan kami kehabisan stimulan. Kudengar kau punya satu. Demi kemanusiaan, maukah kau membantu kami?"',
        choices: [
            {
                text: 'Tentu saja. Ambil ini, tanpa bayaran.',
                condition: [{ type: 'HAS_ITEM', key: 'stimulan', value: 1 }],
                effects: [
                    { type: 'LOSE_ITEM', key: 'stimulan', value: 1, message: 'Kamu memberikan Stimulan. Wajah pemimpin itu dipenuhi rasa terima kasih.' },
                    { type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: 15, message: 'Tindakanmu tidak akan dilupakan. Reputasi dengan Sisa Kemanusiaan meningkat pesat.' },
                    { type: 'GAIN_XP', value: 50, message: 'Kamu mendapatkan 50 XP karena membantu sesama.'}
                ]
            },
            {
                text: '[Jual] Bantuan tidak gratis. 200 Skrip.',
                condition: [
                    { type: 'HAS_ITEM', key: 'stimulan', value: 1 }
                ],
                effects: [
                    { type: 'LOSE_ITEM', key: 'stimulan', value: 1, message: 'Kamu menjual Stimulan itu.' },
                    { type: 'CHANGE_SKRIP', value: 200, message: 'Dengan berat hati, dia membayarmu 200 Skrip.'},
                    { type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: -10, message: 'Mereka mendapatkan apa yang mereka butuhkan, tetapi reputasimu tercoreng.' }
                ]
            },
            {
                text: 'Itu milikku. Aku tidak bisa memberikannya.',
                effects: [
                    { type: 'CHANGE_REPUTATION', key: 'sisa_kemanusiaan', value: -15, message: 'Dia menatapmu dengan tidak percaya. "Kau akan membiarkan kami mati?" Reputasimu dengan Sisa Kemanusiaan anjlok.' }
                ]
            }
        ]
    },
    {
        id: 'sekte_pustaka_trade',
        type: 'dialogue',
        npc: {
            name: 'Pustakawan Sekte',
            portraitKey: 'faksi_sekte_pustaka_01.png',
            faction: 'sekte_pustaka'
        },
        narrative: 'Seseorang berjubah yang menutupi wajahnya mendekat dengan tenang. Dia melihat Artefak Aneh yang kau bawa. "Benda itu... relik dari Dunia Lama. Kami, Sekte Pustaka, mengumpulkannya. Maukah kau menukarnya dengan pengetahuan... atau sesuatu yang lebih nyata?"',
        triggerCondition: (state: GameState) => state.player.inventory.some(item => item.itemId === 'artefak_aneh'),
        choices: [
            {
                text: '[Tukar dengan Item] Apa yang kau tawarkan?',
                condition: [{ type: 'HAS_ITEM', key: 'artefak_aneh', value: 1 }],
                effects: [
                    { type: 'LOSE_ITEM', key: 'artefak_aneh', value: 1, message: 'Kamu menukar Artefak Aneh.' },
                    { type: 'GAIN_ITEM', key: 'data_chip', value: 1, message: 'Dia memberimu sebuah Data Chip yang terawat baik.' },
                    { type: 'CHANGE_REPUTATION', key: 'sekte_pustaka', value: 5, message: 'Reputasimu dengan Sekte Pustaka meningkat.' }
                ]
            },
            {
                text: '[Tukar dengan Info] Aku butuh informasi.',
                 condition: [{ type: 'HAS_ITEM', key: 'artefak_aneh', value: 1 }],
                effects: [
                    { type: 'LOSE_ITEM', key: 'artefak_aneh', value: 1, message: 'Kamu menukar Artefak Aneh.' },
                    { type: 'GAIN_XP', value: 50, message: 'Dia membisikkan rahasia tentang titik lemah Anomali. (+50 XP)' },
                    { type: 'CHANGE_REPUTATION', key: 'sekte_pustaka', value: 5, message: 'Reputasimu dengan Sekte Pustaka meningkat.' }
                ]
            },
            {
                text: 'Ini milikku. Aku tidak tertarik.',
                effects: [
                    { type: 'CHANGE_REPUTATION', key: 'sekte_pustaka', value: -3, message: 'Pustakawan itu mengangguk pelan dan menghilang ke dalam bayang-bayang. Dia tampak kecewa.' }
                ]
            }
        ]
    },
    {
        id: 'sergapan_anomali_tengkorak',
        type: 'threat',
        npc: { name: 'Sistem', portraitKey: '' },
        narrative: 'Tiba-tiba, udara di sekitarmu terasa dingin dan berat. Dari balik puing-puing, sebuah tengkorak melayang dengan energi spektral yang menakutkan, matanya menyala merah. Ia menyerang tanpa peringatan!',
        choices: [
            {
                text: 'Lawan!',
                effects: [{ type: 'START_COMBAT', key: 'anomali_tengkorak', message: 'Anomali Tengkorak menyerang!' }]
            }
        ]
    },
    {
        id: 'sergapan_perampok_nekat',
        type: 'threat',
        npc: { name: 'Sistem', portraitKey: '' },
        narrative: 'Bayangan bergerak cepat di gang sempit. Sebelum kau sempat bereaksi, seorang perampok dengan tatapan mata liar melompat keluar, senjatanya teracung. "Jangan bergerak! Serahkan semuanya!"',
        choices: [
            {
                text: 'Lawan!',
                effects: [{ type: 'START_COMBAT', key: 'perampok_nekat', message: 'Perampok Nekat menyerang!' }]
            }
        ]
    },
     {
        id: 'patroli_geng_bangsat',
        type: 'threat',
        npc: { name: 'Letnan Geng Bangsat', portraitKey: 'faksi_geng_bangsat_leader.png', faction: 'geng_bangsat' },
        narrative: 'Kamu berpapasan dengan patroli Geng Bangsat yang dipimpin oleh seseorang yang tampak lebih besar dan lebih kejam dari yang lain. "Kau tersesat, anak manis?" dia menyeringai. "Ini wilayah kami. Kau harus membayar pajak."',
        choices: [
            {
                text: '[Lawan] Aku tidak membayar siapapun.',
                effects: [{ type: 'START_COMBAT', key: 'letnan_geng_bangsat', message: 'Letnan Geng Bangsat tertawa. "Jawaban yang salah!"' }]
            },
            {
                 text: '[Ketangkasan 8+] Coba menyelinap pergi.',
                 condition: [{ type: 'ATTRIBUTE', key: 'ketangkasan', value: 8 }],
                 effects: [{ type: 'NOTHING', message: 'Kamu berhasil menyelinap ke dalam bayangan tanpa terdeteksi.'}]
            }
        ]
    },
    {
        id: 'spora_anomali_jamur',
        type: 'threat',
        npc: { name: 'Sistem', portraitKey: '' },
        narrative: 'Kamu mencium bau tanah basah dan pembusukan yang aneh. Di depanmu, gumpalan jamur aneh berdenyut dan bergerak. Tiba-tiba ia melepaskan kepulan spora ke arahmu!',
        choices: [
            {
                text: 'Bertahan!',
                effects: [{ type: 'START_COMBAT', key: 'anomali_jamur', message: 'Anomali Jamur menyebarkan spora dan menyerang!' }]
            }
        ]
    }
];