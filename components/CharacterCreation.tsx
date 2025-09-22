import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { startGame, setPlayerCharacter, generateAndStartChapter } from '../store/gameSlice';
import { codex } from '../core/codex';
import { PlayerAttributes } from '../types';

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

    const finalAttributes = useMemo(() => {
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

        let finalName = name.trim();
        let finalBackground = background;
        let finalSkill = skill;

        // Randomisasi jika ada field yang kosong
        if (finalName === '') {
            finalName = randomNames[Math.floor(Math.random() * randomNames.length)];
        }
        if (finalBackground === '') {
            const backgroundIds = Object.keys(codex.backgrounds);
            finalBackground = backgroundIds[Math.floor(Math.random() * backgroundIds.length)];
        }
        if (finalSkill === '') {
            const skillIds = Object.keys(codex.skills);
            finalSkill = skillIds[Math.floor(Math.random() * skillIds.length)];
        }
        
        dispatch(setPlayerCharacter({ name: finalName, backgroundId: finalBackground, skillId: finalSkill, attributes: finalAttributes }));
        
        dispatch(startGame());

        // Dispatch async thunk untuk menghasilkan bab pertama
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
                                {Object.entries(finalAttributes).map(([key, value]) => (
                                    <li key={key}>
                                        <span>{key}</span>
                                        <span className={`attr-value ${getAttributeValueClass(value)}`}>{value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <button type="submit" className="submit-button">Mulai Petualangan</button>
            </form>
        </div>
    );
};

export default CharacterCreation;