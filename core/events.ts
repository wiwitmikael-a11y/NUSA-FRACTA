// core/events.ts
import { RandomEvent } from '../types';

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
                    { type: 'NOTHING', message: 'Kamu melanjutkan perjalanan, meninggalkan warga itu dengan nasibnya sendiri.' }
                ]
            }
        ]
    },
    {
        id: 'pedagang_tukar_barang',
        type: 'trade',
        npc: {
            name: 'Saudagar Jalanan',
            portraitKey: 'faksi_saudagar_jalanan_01.png',
            faction: 'saudagar_jalanan',
        },
        narrative: 'Seorang pria dengan tumpukan barang dagangan di punggungnya tersenyum licik. "Hei, kawan. Aku punya beberapa Air Kemasan bersih, barang langka. Mau beli? Hanya 30 Skrip per botol."',
        choices: [
            {
                text: '[Beli] Air Kemasan seharga 30 Skrip.',
                condition: [{ type: 'HAS_SKRIP', key: 'skrip', value: 30 }],
                effects: [
                    { type: 'CHANGE_SKRIP', value: -30, message: 'Kamu kehilangan 30 Skrip.' },
                    { type: 'GAIN_ITEM', key: 'air_kemasan', value: 1, message: 'Kamu mendapatkan 1 Air Kemasan.' }
                ]
            },
            {
                text: '[Karisma] Tawar menjadi 25 Skrip.',
                 condition: [
                    { type: 'ATTRIBUTE', key: 'karisma', value: 6 },
                    { type: 'HAS_SKRIP', key: 'skrip', value: 25 },
                ],
                 effects: [
                    { type: 'CHANGE_SKRIP', value: -25, message: 'Tawaran berhasil! Kamu kehilangan 25 Skrip.' },
                    { type: 'GAIN_ITEM', key: 'air_kemasan', value: 1, message: 'Kamu mendapatkan 1 Air Kemasan.' }
                 ]
            },
            {
                text: 'Lain kali saja.',
                effects: [
                     { type: 'NOTHING', message: 'Kamu menolak tawaran pedagang itu.' }
                ]
            }
        ]
    },
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
    }
];