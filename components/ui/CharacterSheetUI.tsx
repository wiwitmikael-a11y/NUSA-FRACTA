import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { codex } from '../../core/codex';
import { assignAttributePoint } from '../../store/gameSlice';
import { AttributeId } from '../../types';


const CharacterSheetUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const player = useSelector((state: RootState) => state.game.player);
    const dispatch = useDispatch<AppDispatch>();
    
    if (!isOpen) return null;

    const handleAssignPoint = (attribute: AttributeId) => {
        dispatch(assignAttributePoint(attribute));
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Karakter: {player.name}</h2>
                <button onClick={onClose} className="close-button">X</button>
                
                 {player.unspentAttributePoints > 0 && (
                    <div className="unspent-points-notice">
                        Anda punya {player.unspentAttributePoints} poin atribut untuk dialokasikan!
                    </div>
                )}
                
                <div className="character-sheet-grid">
                     <div className="sheet-section">
                        <h3>Status</h3>
                        <p>Level: {player.level}</p>
                        <p>XP: {player.xp} / {player.level * 100}</p>
                        <p>HP: {player.hp} / {player.maxHp}</p>
                    </div>

                    <div className="sheet-section">
                        <h3>Atribut</h3>
                        <ul className="attributes-list">
                            {Object.entries(player.attributes).map(([key, value]) => (
                                <li key={key}>
                                    <div>
                                        <strong className="attr-name">{key}</strong>: {value as React.ReactNode}
                                    </div>
                                    {player.unspentAttributePoints > 0 && (
                                        <button 
                                            className="attr-assign-button" 
                                            onClick={() => handleAssignPoint(key as AttributeId)}
                                            title={`Tingkatkan ${key}`}
                                        >
                                            +
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sheet-section">
                        <h3>Latar Belakang & Keahlian</h3>
                        <p><strong>Latar Belakang</strong>: {player.backgroundId ? codex.backgrounds[player.backgroundId]?.name : 'Tidak diketahui'}</p>
                        <p><strong>Keahlian</strong>: {player.skillId ? codex.skills[player.skillId]?.name : 'Tidak diketahui'}</p>
                    </div>

                    <div className="sheet-section">
                        <h3>Reputasi</h3>
                        <ul className="reputation-list">
                            {Object.entries(player.reputation).map(([key, value]) => (
                                <li key={key}>
                                    <strong>{key.replace(/_/g, ' ')}</strong>
                                    <span>{value as React.ReactNode}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterSheetUI;