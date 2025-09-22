import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { startNextChapter } from '../../store/gameSlice';

const ChapterEndSummary: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { eventLog } = useSelector((state: RootState) => state.game);

    // Moved this hook before the conditional return to respect the Rules of Hooks.
    const finalNodeNarrative = useSelector((state: RootState) => {
        const node = state.game.currentChapter?.nodes.find(n => n.nodeId === state.game.currentNodeId);
        return node?.narrative || "Petualanganmu mencapai titik penting.";
    });

    if (!isOpen) return null;

    const handleContinue = () => {
        // Memicu thunk untuk menghasilkan dan memulai bab berikutnya.
        dispatch(startNextChapter());
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Bab Selesai</h2>
                <p><em>"{finalNodeNarrative}"</em></p>
                
                <div className="summary-section">
                    <h4>Ringkasan Bab:</h4>
                    <ul>
                        {eventLog.slice(-10).map(log => ( // Tampilkan 10 event terakhir
                            <li key={log.id} className={log.type}>{log.message}</li>
                        ))}
                        {eventLog.length === 0 && <li>Tidak ada peristiwa penting yang tercatat.</li>}
                    </ul>
                </div>

                <button onClick={handleContinue} className="submit-button" style={{width: '100%', textAlign: 'center'}}>
                    Lanjutkan Petualangan
                </button>
            </div>
        </div>
    );
};

export default ChapterEndSummary;