import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { codex } from '../../core/codex';

const JournalUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const storyFlags = useSelector((state: RootState) => state.game.player.storyFlags);
    
    if (!isOpen) return null;

    const activeQuests = Object.keys(storyFlags)
        .filter(flag => storyFlags[flag] && codex.quests[flag])
        .map(flag => codex.quests[flag]);

    return (
        <div className="modal-overlay terminal-modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="terminal-header">
                    <span className="terminal-title">LOG MISI v1.3a</span>
                    <button onClick={onClose} className="close-button">X</button>
                </div>
                <div className="terminal-body">
                    <ul className="journal-list">
                        {activeQuests.length > 0 ? activeQuests.map(quest => (
                            <li key={quest.name}>
                                <div className="quest-info">
                                    <strong>{quest.name}</strong>
                                    <p>// {quest.description}</p>
                                </div>
                            </li>
                        )) : <li>Tidak ada entri log misi aktif.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default JournalUI;