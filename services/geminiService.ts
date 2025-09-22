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
        2.  **TIDAK ADA JALAN BUNTU (PENTING!)**: Setiap node HARUS memiliki setidaknya SATU pilihan yang TIDAK memiliki properti 'condition' sama sekali. Ini adalah pilihan 'fallback' yang selalu bisa dipilih pemain untuk menjamin kelanjutan cerita.
        3.  **Kreativitas & Skala**: Buat narasi yang menarik, kompleks, dan sinematik. Gunakan nama tempat, slang, dan budaya lokal yang relevan. Cerita harus terasa besar dan berdampak.
        4.  **Konsistensi**: Pertahankan konsistensi dengan keadaan pemain yang diberikan. Lanjutkan cerita dari lokasi dan kondisi saat ini.
        5.  **Gameplay Bermakna**: Sediakan 2-4 pilihan yang benar-benar berbeda di setiap node. Pilihan harus mengarah ke cabang cerita yang berbeda, bukan hanya variasi teks kecil.
        6.  **Struktur Bab**: Bab harus terdiri dari 15-25 node yang saling berhubungan. Node pertama harus 'start'. Salah satu node harus menjadi akhir dari bab (isChapterEnd: true).
        7.  **Lokasi Deskriptif**: Berikan nama lokasi yang imersif dan spesifik, contoh: "Lobi Menara Perkantoran Arcadia yang Sunyi", "Pasar Darurat di Reruntuhan Stasiun Gambir", "Terowongan MRT Tergenang Air".
        8.  **Waktu & Suasana**: Untuk setiap node, tentukan 'timeOfDay' (pagi, siang, sore, malam) untuk membangun atmosfer.
        9.  **Cek Atribut**: Buat beberapa pilihan yang memerlukan cek atribut. Tulis teks pilihan dengan format: "[NamaAtribut NilaiMinimal+] Teks Pilihan". Contoh: "[Kekuatan 8+] Robohkan barikade darurat."
        10. **Konsekuensi Pilihan (WAJIB)**: Setiap pilihan harus memiliki dampak. Gunakan properti 'effects' dalam pilihan untuk memberikan item, mengubah HP, memulai pertarungan, atau mengatur story flag.
            // FIX: Removed nested backticks from the example JSON strings to resolve a syntax error.
            - {"type": "GAIN_ITEM", "key": "item_id", "value": 1, "message": "Kamu menemukan perban."}
            - {"type": "CHANGE_HP", "value": -10, "message": "Kamu terluka saat melompat."}
            - {"type": "START_COMBAT", "key": "enemy_id", "message": "Sesosok anomali melompat ke arahmu!"}
            - {"type": "SET_FLAG", "key": "quest_id", "value": 1, "message": "Kamu memulai misi baru."}

        Lore Dunia NUSA FRACTA (Gunakan ini sebagai inspirasi):
        - Faksi Utama: Sisa Kemanusiaan, Gerombolan Besi (raider kejam), Teknokrat (pencari teknologi), Geng Bangsat (anarkis), Pemburu Agraria (survivalis alam), Republik Merdeka (pembangun peradaban), Saudagar Jalanan (pedagang), Sekte Pustaka (penjaga pengetahuan).
        - NPC Penting (Calon Companion): Ayra (mekanik jenius), Davina (prajurit Republik Merdeka idealis), Raizen (pemburu misterius).
        - Musuh: Anjing Liar, Preman Kumuh, Perampok, Anomali Tengkorak, Anomali Jamur, Ratu Anomali (boss).

        Instruksi Tambahan untuk Bab Ini:
        - Ciptakan narasi yang epik dan bercabang. Jangan takut membuat alur cerita yang dramatis.
        - Perkenalkan setidaknya satu faksi secara mendalam. Tunjukkan cara hidup, markas, atau anggota penting mereka.
        - Berikan kesempatan untuk bertemu salah satu calon companion (Ayra, Davina, atau Raizen) dan berinteraksi dengan mereka.
        - Variasikan tantangan: dialog dengan konsekuensi, eksplorasi berbahaya, teka-teki lingkungan, dan pertarungan yang menegangkan.
        - Pastikan akhir bab terasa seperti sebuah pencapaian, bukan berhenti mendadak.

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
            // FIX: Use 'gemini-2.5-flash' model.
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                // FIX: Use responseMimeType and responseSchema for structured JSON output.
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

        // FIX: Extract text and parse it as JSON.
        const jsonText = response.text.trim();
        const generatedChapter = JSON.parse(jsonText) as Chapter;
        
        // Ensure the generated chapter has the correct title and objective
        generatedChapter.title = chapterDetails.title;
        generatedChapter.objective = chapterDetails.objective;

        return generatedChapter;

    } catch (error) {
        console.error("Error generating chapter with Gemini:", error);
        throw new Error("Gagal menghasilkan alur cerita baru. Mungkin ada masalah dengan koneksi atau API key.");
    }
};