import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { startGame, setPlayerCharacter, generateAndStartChapter } from '../store/gameSlice';
import { codex } from '../core/codex';
import { PlayerAttributes } from '../types';
import soundService from '../services/soundService';

const randomNames = ['Bayu', 'Citra', 'Dharma', 'Elang', 'Gita', 'Harun', 'Rin', 'Jaka'];

// Helper untuk memformat efek keahlian menjadi string yang mudah dibaca
const formatEffects = (effects: any[]): string => {
    if (!effects || effects.length === 0) return '';
    const parts = effects.map(eff => {
        const sign = eff.value > 0 ? '+' : '';
        return `${sign}${eff.value} ${eff.key}`;
    });
    return `(${parts.join(', ')})`;
};

// Helper untuk merender deskripsi dengan teks efek berwarna
const renderDescriptionWithEffect = (desc: string) => {
    const match = desc.match(/(.*)(\(.*\))/);
    if (match && match[2]) {
        return (
            <>
                {match[1].trim()} <span className="effect-text">{match[2]}</span>
            </>
        );
    }
    return desc;
};

// Helper untuk mendapatkan kelas CSS berdasarkan nilai atribut
const getAttributeValueClass = (value: number): string => {
    if (value < 5) return 'low';
    if (value === 5) return 'mid';
    if (value > 5 && value <= 7) return 'high';
    return 'very-high'; // untuk nilai > 7
};

const CharacterCreation: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [name, setName] = useState('');
    const [background, setBackground] = useState('');
    const [skill, setSkill] = useState('');

    const displayAttributes = useMemo(() => {
        const baseAttributes: PlayerAttributes = { kekuatan: 5, ketangkasan: 5, kecerdasan: 5, karisma: 5 };
        
        if (background && codex.backgrounds[background]) {
            codex.backgrounds[background].effects.forEach(effect => {
                if (effect.type === 'ATTRIBUTE_MOD') {
                    const key = effect.key as keyof PlayerAttributes;
                    baseAttributes[key] += effect.value;
                }
            });
        }
        
        if (skill && codex.skills[skill]) {
            codex.skills[skill].effects.forEach(effect => {
                if (effect.type === 'ATTRIBUTE_MOD') {
                    const key = effect.key as keyof PlayerAttributes;
                    baseAttributes[key] += effect.value;
                }
            });
        }
        return baseAttributes;
    }, [background, skill]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Inisialisasi audio pada interaksi pengguna pertama untuk memastikan izin browser
        soundService.initialize();

        // 1. Tentukan pilihan final (pilihan pengguna atau acak)
        const finalName = name.trim() || randomNames[Math.floor(Math.random() * randomNames.length)];
        
        let finalBackgroundId = background;
        if (finalBackgroundId === '') {
            const backgroundIds = Object.keys(codex.backgrounds);
            finalBackgroundId = backgroundIds[Math.floor(Math.random() * backgroundIds.length)];
        }

        let finalSkillId = skill;
        if (finalSkillId === '') {
            const skillIds = Object.keys(codex.skills);
            finalSkillId = skillIds[Math.floor(Math.random() * skillIds.length)];
        }

        // 2. Hitung ulang atribut berdasarkan pilihan final untuk memastikan konsistensi
        const finalAttributes: PlayerAttributes = { kekuatan: 5, ketangkasan: 5, kecerdasan: 5, karisma: 5 };
        
        if (finalBackgroundId && codex.backgrounds[finalBackgroundId]) {
            codex.backgrounds[finalBackgroundId].effects.forEach(effect => {
                if (effect.type === 'ATTRIBUTE_MOD') {
                    const key = effect.key as keyof PlayerAttributes;
                    finalAttributes[key] += effect.value;
                }
            });
        }
        
        if (finalSkillId && codex.skills[finalSkillId]) {
            codex.skills[finalSkillId].effects.forEach(effect => {
                if (effect.type === 'ATTRIBUTE_MOD') {
                    const key = effect.key as keyof PlayerAttributes;
                    finalAttributes[key] += effect.value;
                }
            });
        }

        // 3. Kirim action dengan data yang benar dan konsisten
        dispatch(setPlayerCharacter({ 
            name: finalName, 
            backgroundId: finalBackgroundId, 
            skillId: finalSkillId, 
            attributes: finalAttributes 
        }));
        
        dispatch(startGame());

        // Mulai musik latar setelah game dimulai
        soundService.playBgm('explore');

        // Kirim thunk async untuk menghasilkan bab pertama
        dispatch(generateAndStartChapter({
            title: "Gema di Sudirman",
            objective: "Kamu baru saja tiba di reruntuhan Jalan Sudirman. Tujuanmu adalah bertahan hidup, mencari petunjuk tentang apa yang terjadi pada dunia, dan menemukan tempat aman pertama."
        }));
    };

    return (
        <div className="character-creation-container">
            <h1>Buat Karakter</h1>
            <p>Selamat datang di NUSA FRACTA. Bertahan hidup tidak akan mudah. Siapakah dirimu?</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nama:</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Atau biarkan takdir memilih..."
                        maxLength={50}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="background">Latar Belakang:</label>
                    <select id="background" value={background} onChange={e => setBackground(e.target.value)}>
                        <option value="">Pilih latar belakang atau biarkan kosong</option>
                        {Object.entries(codex.backgrounds).map(([id, { name }]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    {background && <p className="description">{renderDescriptionWithEffect(codex.backgrounds[background].description)}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="skill">Keahlian:</label>
                    <select id="skill" value={skill} onChange={e => setSkill(e.target.value)}>
                        <option value="">Pilih keahlian atau biarkan kosong</option>
                        {Object.entries(codex.skills).map(([id, { name }]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    {skill && (
                        <div className="description">
                            {codex.skills[skill].description}
                            <p className="effect-text">
                                {formatEffects(codex.skills[skill].effects)}
                            </p>
                        </div>
                    )}
                </div>

                {background && (
                    <div className="creation-summary-section">
                        <div className="portrait-display">
                            <img 
                              src={codex.backgrounds[background].portraitUrl} 
                              alt="Potret Karakter" 
                              className="pulsing-glow"
                            />
                        </div>
                        <div className="stats-display">
                            <h4>Atribut Awal</h4>
                            <ul>
                                {Object.entries(displayAttributes).map(([key, value]) => (
                                    <li key={key}>
                                        <span>{key}</span>
                                        {/* FIX: The value from Object.entries is inferred as 'unknown', which is not assignable to 'number'. Cast 'value' to 'number' to fix the TypeScript error. */}
                                        <span className={`attr-value ${getAttributeValueClass(value as number)}`}>{value as number}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <button type="submit" className="submit-button">Mulai Petualangan</button>
                
                <div className="disclaimer-container">
                    <p className="disclaimer-text">
                        Game ini adalah karya fiksi. Nama, karakter, tempat, dan insiden adalah produk imajinasi penulis atau digunakan secara fiktif. Kemiripan dengan orang, hidup atau mati, atau peristiwa nyata adalah kebetulan semata.
                    </p>
                    <p className="copyright-text">
                        © 2025 Rangga X Atharrazka Core
                    </p>
                </div>
            </form>
        </div>
    );
};

export default CharacterCreation;