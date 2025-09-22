// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, Chapter } from '../types';
import { codex } from '../core/codex';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// --- JSON Schema Definition for Chapter Generation ---
const choiceConditionSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['ATTRIBUTE', 'HAS_ITEM', 'HAS_SKILL'] },
        key: { type: Type.STRING, description: 'AttributeId, ItemId, atau SkillId yang akan diperiksa.' },
        value: { type: Type.INTEGER, description: 'Nilai yang dibutuhkan (skor atribut min, jumlah item min).' },
    },
    required: ['type', 'key', 'value'],
};

const storyEffectSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['CHANGE_HP', 'ADD_ITEM', 'REMOVE_ITEM', 'CHANGE_REPUTATION', 'ADD_XP', 'SET_FLAG', 'START_COMBAT'] },
        key: { type: Type.STRING, description: 'Target efek, misal ItemId, FactionId, EnemyId, atau nama flag.' },
        value: { type: Type.INTEGER, description: 'Besaran efek.' },
    },
    required: ['type', 'key', 'value'],
};

const chapterNodeChoiceSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: 'Teks pilihan yang ditampilkan ke pemain.' },
        targetNodeId: { type: Type.STRING, description: 'nodeId tujuan. HARUS ada di dalam array nodes.' },
        condition: { type: Type.ARRAY, items: choiceConditionSchema, description: 'Syarat opsional agar pilihan ini tersedia.' },
        effects: { type: Type.ARRAY, items: storyEffectSchema, description: 'Efek yang langsung terjadi saat pilihan dibuat.' },
    },
    required: ['text', 'targetNodeId', 'effects'],
};

const chapterNodeSchema = {
    type: Type.OBJECT,
    properties: {
        nodeId: { type: Type.STRING, description: 'ID unik dan deskriptif untuk node ini (mis: "masuk_pasar", "bicara_dengan_pedagang").' },
        narrative: { type: Type.STRING, description: 'Teks narasi utama untuk adegan ini.' },
        isChapterEnd: { type: Type.BOOLEAN, description: 'Set ke true jika node ini mengakhiri bab.' },
        choices: { type: Type.ARRAY, items: chapterNodeChoiceSchema, description: 'Daftar pilihan yang tersedia. Tidak boleh kosong kecuali isChapterEnd true.' },
        location: { type: Type.STRING, description: 'Nama deskriptif untuk lokasi saat ini (mis: "Pasar Gelap", "Reruntuhan Monas").' },
        effects: { type: Type.ARRAY, items: storyEffectSchema, description: 'Efek yang otomatis terjadi saat memasuki node ini.' },
    },
    required: ['nodeId', 'narrative', 'choices', 'location'],
};

const chapterSchema = {
    type: Type.OBJECT,
    properties: {
        chapterId: { type: Type.STRING, description: 'ID unik untuk bab ini (mis: "bab1_gema_di_sudirman").' },
        startNodeId: { type: Type.STRING, description: 'nodeId dari node pertama. HARUS ada di dalam array nodes.' },
        nodes: { type: Type.ARRAY, items: chapterNodeSchema, description: 'Array berisi semua node cerita dalam bab ini. Harus berisi jaringan cerita yang besar dan bercabang (minimal 100-300 node) untuk pengalaman yang mendalam.' },
    },
    required: ['chapterId', 'startNodeId', 'nodes'],
};
// --- End of Schema Definition ---

const buildChapterPrompt = (gameState: GameState, premise: { title: string, objective: string }): string => {
    const { player } = gameState;

    const codexSummary = `
    Item Penting: ${Object.keys(codex.items).join(', ')}.
    Musuh: ${Object.keys(codex.enemies).join(', ')}.
    Faksi: Sisa Kemanusiaan, Gerombolan Besi, Teknokrat, Geng Bangsat, Pemburu Agraris, Republik Merdeka, Saudagar Jalanan, Sekte Pustaka.
    Atribut Pemain: kekuatan, ketangkasan, kecerdasan, karisma.
    Keahlian Pemain: ${Object.keys(codex.skills).join(', ')}.
    `;

    return `
      Anda adalah Game Master (GM) jenius untuk RPG teks bernama NUSA FRACTA, berlatar di Jakarta pasca-apokaliptik.
      Tugas Anda adalah MENCIPTAKAN SELURUH BAB CERITA dari awal hingga akhir dalam format JSON yang valid dan sesuai dengan skema yang diberikan.

      PREMIS BAB INI:
      - Judul: "${premise.title}"
      - Tujuan: "${premise.objective}"

      STATUS PEMAIN SAAT INI:
      - Nama: ${player.name}
      - Level: ${player.level}
      - HP: ${player.hp}/${player.maxHp}
      - Latar Belakang: ${player.backgroundId ? codex.backgrounds[player.backgroundId].name : 'Tidak Diketahui'}
      - Atribut: ${JSON.stringify(player.attributes)}
      - Inventaris: ${player.inventory.map(i => `${i.itemId} (x${i.quantity})`).join(', ') || 'Kosong'}

      ATURAN PENTING:
      1.  **HASILKAN JSON LENGKAP:** Anda harus menghasilkan objek JSON tunggal yang berisi keseluruhan bab.
      2.  **PATUHI SKEMA:** JSON Anda HARUS 100% valid sesuai dengan skema yang diberikan. Ini sangat penting.
      3.  **CERITA MENDALAM & BERCABANG:** Buatlah narasi yang kompleks dengan banyak pilihan. Bab ini harus terasa besar dan luas, dengan minimal 100-300 node yang saling terhubung untuk memberikan banyak jalur dan replayability.
      4.  **KONSISTENSI LOGIKA:** Semua 'targetNodeId' dalam pilihan HARUS merujuk ke 'nodeId' yang ada di dalam array 'nodes' yang Anda buat. JANGAN membuat referensi ke node yang tidak ada.
      5.  **ID DESKRIPTIF:** Gunakan 'nodeId' yang singkat dan deskriptif (contoh: 'memasuki_lobi', 'bertemu_pedagang_misterius').
      6.  **GUNAKAN CODEX:** Manfaatkan item, musuh, faksi, dan keahlian dari ringkasan codex di bawah ini saat membuat efek, syarat, dan narasi.
      7.  **AWAL & AKHIR:** Bab harus memiliki 'startNodeId' yang jelas dan setidaknya satu node dengan 'isChapterEnd: true'.
      8.  **BAHASA:** Seluruh narasi, teks pilihan, dan lokasi harus dalam Bahasa Indonesia.
      9.  **NODE KEKALAHAN:** SELALU sertakan node kekalahan (defeat node) dengan nodeId "kalah_dan_pingsan". Node ini harus mendeskripsikan pemain pingsan, kehilangan beberapa item acak, dan kemudian sadar kembali di lokasi awal bab. Ini adalah node penting untuk penanganan kekalahan dalam pertempuran.

      RINGKASAN CODEX UNTUK REFERENSI:
      ${codexSummary}

      Sekarang, tuliskan seluruh bab cerita berdasarkan premis di atas dalam format JSON.
    `;
};

export const generateChapter = async (gameState: GameState, premise: { title: string, objective: string }): Promise<Chapter> => {
    const prompt = buildChapterPrompt(gameState, premise);

    try {
        console.log("Generating new chapter with premise:", premise.objective);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: chapterSchema,
            },
        });
        
        const jsonText = response.text.trim();
        console.log("Gemini response received, parsing JSON...");
        const generatedChapter = JSON.parse(jsonText);
        console.log("Chapter generated successfully with", generatedChapter.nodes.length, "nodes.");
        return generatedChapter as Chapter;

    } catch (error) {
        console.error("Gemini API call failed to generate chapter:", error);
        throw new Error("Gagal menghasilkan bab cerita dari AI. Silakan coba lagi.");
    }
};