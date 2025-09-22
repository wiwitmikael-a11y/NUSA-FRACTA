// components/ui/CharacterSheetUI.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { codex } from '../../core/codex';
import { AttributeId } from '../../types';
import { increaseAttribute } from '../../store/gameSlice';

const CharacterSheetUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const player = useSelector((state: RootState) => state.game.player);
    const dispatch = useDispatch<AppDispatch>();

    if (!isOpen) return null;

    const background = player.backgroundId ? codex.backgrounds[player.backgroundId] : null;
    const skill = player.skillId ? codex.skills[player.skillId] : null;
    
    const handleIncreaseAttribute = (attribute: AttributeId) => {
        if (player.unspentAttributePoints > 0) {
            dispatch(increaseAttribute(attribute));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content character-sheet" onClick={e => e.stopPropagation()}>
                <h2>Lembar Karakter</h2>
                <button onClick={onClose} className="close-button">X</button>
                
                <div className="sheet-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    {player.portraitUrl && <img src={player.portraitUrl} alt="Player Portrait" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '2px solid var(--accent-color)' }} />}
                    <div className="header-info">
                        <h3>{player.name}</h3>
                        <p>Level {player.level}</p>
                        <p>{background?.name} | {skill?.name}</p>
                    </div>
                </div>

                <div className="sheet-section" style={{ marginBottom: '1.5rem' }}>
                    <h4>Atribut</h4>
                    {player.unspentAttributePoints > 0 && 
                        <p className="points-available" style={{ color: 'var(--accent-color)'}}>
                            Poin atribut tersedia: {player.unspentAttributePoints}
                        </p>
                    }
                    <ul>
                        {Object.entries(player.attributes).map(([key, value]) => (
                            <li key={key}>
                                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{value as number}</span>
                                    {player.unspentAttributePoints > 0 && (
                                        <button 
                                            className="increase-attr-btn"
                                            onClick={() => handleIncreaseAttribute(key as AttributeId)}
                                            title={`Tingkatkan ${key}`}
                                        >+</button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                 <div className="sheet-section">
                    <h4>Reputasi</h4>
                    <ul>
                         {Object.entries(player.reputation).map(([key, value]) => (
                            <li key={key}>
                                <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                <span>{value as number}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default CharacterSheetUI;