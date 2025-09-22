// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, Chapter } from '../types';

// FIX: Initialize GoogleGenAI with a named apiKey object.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateChapterPrompt = (gameState: GameState, objective: string): string => {
    const { player } = gameState;
    const inventoryList = player.inventory.map(i => `${i.itemId} (x${i.quantity})`).join(', ') || 'kosong';
    const attributes = `Kekuatan ${player.attributes.kekuatan}, Ketangkasan ${player.attributes.ketangkasan}, Kecerdasan ${player.attributes.kecerdasan}, Karisma ${player.attributes.karisma}`;

    return `
        Anda adalah Game Master untuk sebuah game RPG teks post-apocalyptic bernama NUSA FRACTA, berlatar di reruntuhan Jakarta, Indonesia.
        Tugas Anda adalah membuat satu bab cerita dalam format JSON yang ketat berdasarkan keadaan pemain saat ini dan tujuan bab.

        Aturan Penting:
        1.  **Format JSON**: Respons HARUS berupa objek JSON tunggal yang valid, sesuai dengan skema yang diberikan. JANGAN tambahkan markdown (seperti \`\`\`json) di sekitar JSON.
        2.  **Kreativitas**: Buat narasi yang menarik, imersif, dan sesuai dengan tema post-apocalyptic Indonesia. Gunakan nama tempat, slang, dan budaya lokal yang relevan.
        3.  **Konsistensi**: Pertahankan konsistensi dengan keadaan pemain yang diberikan.
        4.  **Gameplay**: Sediakan 2-4 pilihan yang bermakna di setiap node. Pilihan harus mengarah ke node yang berbeda atau memiliki konsekuensi.
        5.  **Struktur Bab**: Bab harus terdiri dari 5-8 node yang saling berhubungan. Node pertama harus 'start'. Salah satu node harus menjadi akhir dari bab (isChapterEnd: true).
        6.  **Lokasi**: Berikan nama lokasi yang deskriptif dan spesifik untuk setiap node, contoh: "Lobi Gedung Perkantoran Terbengkalai", "Gang Sempit di Belakang Plaza", "Stasiun MRT Bawah Tanah".
        7.  **Waktu**: Untuk setiap node, tentukan 'timeOfDay' (pagi, siang, sore, malam) untuk mengatur suasana.
        8.  **Node ID**: nodeId harus berupa string pendek dan deskriptif (misal: 'start', 'lobi_investigasi', 'kabur_lewat_jendela').

        Karakter Pemain Saat Ini:
        - Nama: ${player.name}
        - Level: ${player.level}
        - Latar Belakang: ${player.backgroundId}
        - Keahlian: ${player.skillId}
        - Atribut: ${attributes}
        - Inventaris: ${inventoryList}
        - Lokasi Saat Ini: ${gameState.currentLocation}
        - Story Flags: ${JSON.stringify(player.storyFlags)}

        Tujuan Bab Ini:
        ${objective}

        Sekarang, buatkan konten untuk bab ini dalam format JSON sesuai skema.
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
                                            },
                                            required: ['text', 'targetNodeId']
                                        }
                                    },
                                    isChapterEnd: { type: Type.BOOLEAN }
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