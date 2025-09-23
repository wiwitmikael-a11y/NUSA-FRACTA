// components/ui/SettingsUI.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { resetGame } from '../../store/gameSlice';
import soundService from '../../services/soundService';
import { deleteSave } from '../../services/storageService';

const SettingsUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [bgmVolume, setBgmVolume] = useState(soundService.getBgmVolume());
    const [sfxVolume, setSfxVolume] = useState(soundService.getSfxVolume());
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        soundService.setBgmVolume(bgmVolume);
    }, [bgmVolume]);

    useEffect(() => {
        soundService.setSfxVolume(sfxVolume);
    }, [sfxVolume]);

    if (!isOpen) return null;

    const handleReset = () => {
        dispatch(resetGame());
        deleteSave('player1');
        setShowResetConfirm(false);
        onClose(); 
        // Mungkin perlu me-reload halaman untuk pengalaman reset yang bersih
        window.location.reload();
    };

    return (
        <div className="modal-overlay terminal-modal settings-modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="terminal-header">
                    <span className="terminal-title">PENGATURAN SISTEM</span>
                    <button onClick={onClose} className="close-button">X</button>
                </div>
                <div className="terminal-body">
                    {/* Audio Settings */}
                    <div className="volume-slider">
                        <label>
                            <span>// VOLUME MUSIK</span>
                            <span>{Math.round(bgmVolume * 100)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={bgmVolume}
                            onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="volume-slider">
                        <label>
                            <span>// VOLUME EFEK SUARA</span>
                            <span>{Math.round(sfxVolume * 100)}%</span>
                        </label>
                         <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={sfxVolume}
                            onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                        />
                    </div>

                    {/* Data Settings */}
                    <div className="reset-section">
                        {!showResetConfirm ? (
                             <button onClick={() => setShowResetConfirm(true)}>RESET DATA PERMAINAN</button>
                        ) : (
                            <div className="reset-confirmation">
                                <p><strong>PERINGATAN:</strong> Tindakan ini akan menghapus semua kemajuan Anda secara permanen. Anda yakin?</p>
                                <div>
                                    <button onClick={handleReset}>YA, HAPUS SEMUANYA</button>
                                    <button onClick={() => setShowResetConfirm(false)}>TIDAK, BATALKAN</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsUI;