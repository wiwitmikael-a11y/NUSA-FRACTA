import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { startGame, setPlayerCharacter } from '../store/gameSlice';
import { codex } from '../core/codex';

const CharacterCreation: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [name, setName] = useState('');
    const [background, setBackground] = useState('');
    const [skill, setSkill] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() === '') {
            alert('Nama tidak boleh kosong.');
            return;
        }
        if (background === '') {
            alert('Silakan pilih latar belakang karakter Anda.');
            return;
        }
        if (skill === '') {
            alert('Silakan pilih keahlian karakter Anda.');
            return;
        }
        
        // Set player data first
        dispatch(setPlayerCharacter({ name: name.trim(), backgroundId: background, skillId: skill }));
        
        // Then, start the game with the static chapter
        dispatch(startGame());
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
                        required
                        maxLength={50}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="background">Latar Belakang:</label>
                    <select id="background" value={background} onChange={e => setBackground(e.target.value)} required>
                        <option value="" disabled>Pilih latar belakang</option>
                        {Object.entries(codex.backgrounds).map(([id, { name }]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    {background && <p className="description">{codex.backgrounds[background].description}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="skill">Keahlian:</label>
                    <select id="skill" value={skill} onChange={e => setSkill(e.target.value)} required>
                        <option value="" disabled>Pilih keahlian</option>
                        {Object.entries(codex.skills).map(([id, { name }]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    {skill && <p className="description">{codex.skills[skill].description}</p>}
                </div>
                <button type="submit" className="submit-button">Mulai Petualangan</button>
            </form>
        </div>
    );
};

export default CharacterCreation;