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
        error
    } = useSelector((state: RootState) => state.game);
    const panelRef = useRef<HTMLDivElement>(null);

    const currentNode = currentChapter?.nodes.find(node => node.nodeId === currentNodeId);
    
    // The narrative text now comes directly from the pre-generated chapter data.
    const narrativeText = isInCombat ? '' : (currentNode ? currentNode.narrative : 'Dunia hening sejenak...');
    
    // This callback now simply signals that the typewriter effect for the static text is done.
    const handleTypingComplete = useCallback(() => {
        dispatch(setNarrativeComplete(true));
    }, [dispatch]);

    // The typewriter hook is now only used for the main narrative text.
    const displayedText = useTypewriter(narrativeText, 20, handleTypingComplete);

    useEffect(() => {
        // Auto-scroll to bottom on new log entry or new text
        if (panelRef.current) {
            panelRef.current.scrollTop = panelRef.current.scrollHeight;
        }
    }, [combatLog, displayedText]);

    const renderContent = () => {
        if (isLoading && !currentChapter) return <p>Membangun alur cerita bab baru...</p>;
        if (error) return <p style={{color: 'var(--color-danger)'}}>Error: {error}</p>;
        
        if (isInCombat) {
            return (
                <div className="combat-log-container">
                    {combatLog.map(log => (
                        <p key={log.id} className={`combat-log-entry ${log.turn}-turn`}>
                            {log.message}
                        </p>
                    ))}
                </div>
            );
        }

        // If combat just ended, show the final log before the next narrative.
        if (!isInCombat && currentNodeId === null && combatLog.length > 0) {
             return (
                <div className="combat-log-container">
                    {combatLog.map(log => (
                        <p key={log.id} className={`combat-log-entry ${log.turn}-turn`}>
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