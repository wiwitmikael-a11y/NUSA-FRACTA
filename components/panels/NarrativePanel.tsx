import React, { useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { useTypewriter } from '../../hooks/useTypewriter';
import { setNarrativeComplete } from '../../store/gameSlice';

const NarrativePanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { 
        currentChapter, 
        currentNodeId, 
        isLoading, 
        isInCombat, 
        combatLog,
        error,
        currentRandomEvent,
        activeNpc,
    } = useSelector((state: RootState) => state.game);
    const panelRef = useRef<HTMLDivElement>(null);

    const currentNode = currentChapter?.nodes.find(node => node.nodeId === currentNodeId);
    
    const narrativeText = 
        currentRandomEvent ? currentRandomEvent.narrative :
        isInCombat ? '' : 
        (currentNode ? currentNode.narrative : 'Dunia hening sejenak...');
    
    const handleTypingComplete = useCallback(() => {
        dispatch(setNarrativeComplete(true));
    }, [dispatch]);

    const displayedText = useTypewriter(narrativeText, 20, handleTypingComplete);

    useEffect(() => {
        if (panelRef.current) {
            panelRef.current.scrollTop = panelRef.current.scrollHeight;
        }
    }, [combatLog, displayedText, activeNpc]);

    const renderContent = () => {
        if (isLoading && !currentChapter) return <p>Membangun alur cerita bab baru...</p>;
        if (error) return <p style={{color: 'var(--color-danger)'}}>Error: {error}</p>;

        if (currentRandomEvent && activeNpc) {
             return (
                <div className="visual-novel-dialog">
                    <div className="vn-portrait">
                        <img src={activeNpc.portraitUrl} alt={activeNpc.name} />
                    </div>
                    <div className="vn-text-box">
                        <h4>{activeNpc.name}</h4>
                        <p>{displayedText}</p>
                    </div>
                </div>
            );
        }
        
        if (isInCombat) {
            return (
                <div className="combat-log-container">
                    {combatLog.map(log => (
                        <p key={log.id} className={`combat-log-entry ${log.source}-source`}>
                            {log.message}
                        </p>
                    ))}
                </div>
            );
        }

        if (!isInCombat && currentNodeId === null && combatLog.length > 0) {
             return (
                <div className="combat-log-container">
                    {combatLog.map(log => (
                        <p key={log.id} className={`combat-log-entry ${log.source}-source`}>
                            {log.message}
                        </p>
                    ))}
                </div>
            );
        }

        return (
            <div>
                <p>{displayedText}</p>
            </div>
        );
    };

    return (
        <div className="panel narrative-panel" ref={panelRef}>
            {renderContent()}
        </div>
    );
};

export default NarrativePanel;