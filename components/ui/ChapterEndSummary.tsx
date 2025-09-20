import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { closeChapterEndModal } from '../../store/gameSlice';

const ChapterEndSummary: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { player, eventLog } = useSelector((state: RootState) => state.game);

    if (!isOpen) return null;

    const handleClose = () => {
        // In a real multi-chapter game, this would trigger loading the next chapter.
        // For now, it just closes.
        dispatch(closeChapterEndModal());
        alert("Bab ini telah berakhir. Nantikan kelanjutan petualanganmu!");
    };

    const finalNodeNarrative = useSelector((state: RootState) => {
        const node = state.game.currentChapter?.nodes.find(n => n.nodeId === state.game.currentNodeId);
        return node?.narrative || "Petualanganmu mencapai titik penting.";
    });

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Bab Selesai</h2>
                <p><em>"{finalNodeNarrative}"</em></p>
                
                <div className="summary-section">
                    <h4>Ringkasan Bab:</h4>
                    <ul>
                        {eventLog.map(log => (
                            <li key={log.id} className={log.type}>{log.message}</li>
                        ))}
                        {eventLog.length === 0 && <li>Tidak ada peristiwa penting yang tercatat.</li>}
                    </ul>
                </div>

                <button onClick={handleClose} className="submit-button" style={{width: '100%', textAlign: 'center'}}>
                    Lanjutkan
                </button>
            </div>
        </div>
    );
};

export default ChapterEndSummary;