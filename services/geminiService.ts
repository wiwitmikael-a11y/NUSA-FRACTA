// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, Chapter } from '../types';

// FIX: Initialize GoogleGenAI with a named apiKey object.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateChapterPrompt = (gameState: GameState, objective: string): string => {
    const { player } = gameState;
    const inventoryList = player.inventory.map(i => `${i.itemId} (x${i.quantity})`).join(', ') || 'kosong';
    const attributes = `Kekuatan ${player.attributes.kekuatan}, Ketangkasan ${player.attributes.ketangkasan}, Kecerdasan ${player.attributes.kecerdasan}, Karisma ${player.attributes.karisma}`;
    const reputation = Object.entries(player.reputation).map(([faction, value]) => `${faction}: ${value}`).join(', ');

    return `
        Anda adalah Game Master untuk sebuah game RPG teks post-apocalyptic bernama NUSA FRACTA, berlatar di reruntuhan Jakarta, Indonesia.
        Tugas Anda adalah membuat satu bab cerita yang PANJANG, EPIK, DAN IMERSIF dalam format JSON yang ketat.

        Aturan Paling Penting:
        1.  **Format JSON**: Respons HARUS berupa objek JSON tunggal yang valid, sesuai dengan skema. JANGAN tambahkan markdown (seperti \`\`\`json) di sekitarnya.
        2.  **TIDAK ADA JALAN BUNTU**: Setiap node HARUS memiliki setidaknya SATU pilihan yang TIDAK memiliki properti 'condition' atau 'check'. Ini adalah pilihan 'fallback' yang selalu bisa dipilih pemain.
        3.  **Kreativitas & Skala**: Buat narasi yang menarik, kompleks, dan sinematik. Gunakan nama tempat, slang, dan budaya lokal yang relevan. Cerita harus terasa besar dan berdampak.
        4.  **Konsistensi**: Pertahankan konsistensi dengan keadaan pemain yang diberikan. Lanjutkan cerita dari lokasi dan kondisi saat ini.
        5.  **Gameplay Bermakna**: Sediakan 2-4 pilihan yang benar-benar berbeda di setiap node.
        6.  **Struktur Bab**: Bab harus terdiri dari 15-25 node. Node pertama 'start'. Satu node harus menjadi akhir (isChapterEnd: true).
        7.  **Lokasi Deskriptif**: Berikan nama lokasi yang imersif dan spesifik.
        8.  **Waktu & Suasana**: Untuk setiap node, tentukan 'timeOfDay' (pagi, siang, sore, malam).
        9.  **Cek Atribut Statis (Syarat Mutlak)**: Gunakan properti 'condition' untuk pilihan yang hanya bisa diambil jika syarat terpenuhi. Contoh: "[Kekuatan 8+] Robohkan barikade." Nilai syarat HARUS masuk akal (tidak lebih dari +3 dari atribut pemain saat ini).
        10. **Cek Atribut Probabilistik (BARU & PENTING!)**: Untuk aksi yang berisiko, gunakan properti 'check'. Ini akan memicu "lemparan dadu" di dalam game.
            - "check": { "attribute": "ketangkasan", "difficulty": 12 } -> Atribut yang diuji dan tingkat kesulitan (angka 5-18).
            - "effects": Ini adalah efek jika cek BERHASIL.
            - "failureEffects": Ini adalah efek jika cek GAGAL (misal: kehilangan HP, item, atau memicu alarm).
            - Contoh: Pilihan "Coba membobol kunci" bisa berhasil membuka pintu (effects) atau gagal dan merusak alat (failureEffects).
        11. **Konsekuensi Pilihan**: Setiap pilihan harus memiliki dampak. Gunakan 'effects' (untuk sukses/pilihan simpel) dan 'failureEffects' (untuk kegagalan cek).
        12. **Validitas Node Tujuan**: Pastikan setiap 'targetNodeId' mengacu pada 'nodeId' yang ADA di dalam daftar 'nodes' yang Anda hasilkan.

        Lore Dunia NUSA FRACTA (Gunakan ini sebagai inspirasi):
        - Faksi Utama: Sisa Kemanusiaan, Gerombolan Besi (raider kejam), Teknokrat (pencari teknologi), Geng Bangsat (anarkis), Pemburu Agraria (survivalis alam), Republik Merdeka (pembangun peradaban), Saudagar Jalanan (pedagang), Sekte Pustaka (penjaga pengetahuan).
        - NPC Penting (Calon Companion): Ayra (mekanik jenius), Davina (prajurit Republik Merdeka idealis), Raizen (pemburu misterius).
        - Musuh: Anjing Liar, Preman Kumuh, Perampok, Anomali Tengkorak, Anomali Jamur, Ratu Anomali (boss).

        Instruksi Tambahan untuk Bab Ini:
        - Ciptakan narasi yang epik dan bercabang. Manfaatkan mekanik 'check' probabilistik untuk menciptakan momen menegangkan.
        - Perkenalkan setidaknya satu faksi secara mendalam.
        - Berikan kesempatan untuk bertemu salah satu calon companion (Ayra, Davina, atau Raizen).
        - Variasikan tantangan: dialog, eksplorasi, teka-teki, dan pertarungan.
        - Pastikan akhir bab terasa seperti sebuah pencapaian.

        Karakter Pemain Saat Ini:
        - Nama: ${player.name}
        - Level: ${player.level}
        - Latar Belakang: ${player.backgroundId}
        - Keahlian: ${player.skillId}
        - Atribut: ${attributes}
        - Inventaris: ${inventoryList}
        - Reputasi Faksi: ${reputation}
        - Lokasi Saat Ini: ${gameState.currentLocation}
        - Story Flags Aktif: ${JSON.stringify(player.storyFlags)}

        Tujuan Bab Ini:
        ${objective}

        Sekarang, buatkan konten untuk bab yang kaya dan panjang ini dalam format JSON sesuai skema.
    `;
};

export const generateChapter = async (gameState: GameState, chapterDetails: { title: string; objective: string }): Promise<Chapter> => {
    const prompt = generateChapterPrompt(gameState, chapterDetails.objective);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        chapterId: { type: Type.STRING },
                        title: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        nodes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    nodeId: { type: Type.STRING },
                                    narrative: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    timeOfDay: { type: Type.STRING },
                                    choices: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                text: { type: Type.STRING },
                                                targetNodeId: { type: Type.STRING },
                                                condition: { 
                                                    type: Type.ARRAY,
                                                    nullable: true,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: {
                                                            type: { type: Type.STRING },
                                                            key: { type: Type.STRING },
                                                            value: { type: Type.NUMBER },
                                                        },
                                                        required: ['type', 'key', 'value']
                                                    }
                                                },
                                                effects: {
                                                    type: Type.ARRAY,
                                                    nullable: true,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: {
                                                            type: { type: Type.STRING },
                                                            key: { type: Type.STRING, nullable: true },
                                                            value: { type: Type.NUMBER, nullable: true },
                                                            message: { type: Type.STRING }
                                                        },
                                                        required: ['type', 'message']
                                                    }
                                                },
                                                check: {
                                                    type: Type.OBJECT,
                                                    nullable: true,
                                                    properties: {
                                                        attribute: { type: Type.STRING },
                                                        difficulty: { type: Type.NUMBER }
                                                    },
                                                    required: ['attribute', 'difficulty']
                                                },
                                                failureEffects: {
                                                    type: Type.ARRAY,
                                                    nullable: true,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: {
                                                            type: { type: Type.STRING },
                                                            key: { type: Type.STRING, nullable: true },
                                                            value: { type: Type.NUMBER, nullable: true },
                                                            message: { type: Type.STRING }
                                                        },
                                                        required: ['type', 'message']
                                                    }
                                                }
                                            },
                                            required: ['text', 'targetNodeId']
                                        }
                                    },
                                    isChapterEnd: { type: Type.BOOLEAN, nullable: true }
                                },
                                required: ['nodeId', 'narrative', 'location', 'timeOfDay', 'choices']
                            }
                        }
                    },
                    required: ['chapterId', 'title', 'objective', 'nodes']
                },
            },
        });

        const jsonText = response.text.trim();
        const generatedChapter = JSON.parse(jsonText) as Chapter;
        
        generatedChapter.title = chapterDetails.title;
        generatedChapter.objective = chapterDetails.objective;

        return generatedChapter;

    } catch (error) {
        console.error("Error generating chapter with Gemini:", error);
        throw new Error("Gagal menghasilkan alur cerita baru. Mungkin ada masalah dengan koneksi atau API key.");
    }
};