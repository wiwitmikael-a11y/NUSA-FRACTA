import React, { useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { useTypewriter } from '../../hooks/useTypewriter';
import { setNarrativeComplete } from '../../store/gameSlice';

const NarrativePanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { currentChapter, currentNodeId, isLoading, isInCombat, combatLog, currentEnemyId } = useSelector((state: RootState) => state.game);
    const panelRef = useRef<HTMLDivElement>(null);

    const currentNode = currentChapter?.nodes.find(node => node.nodeId === currentNodeId);
    
    // Determine what text to show
    const narrativeText = isInCombat ? '' : (currentNode ? currentNode.narrative : 'Dunia hening sejenak...');
    
    const handleTypingComplete = useCallback(() => {
        if (!isInCombat) {
            dispatch(setNarrativeComplete(true));
        }
    }, [dispatch, isInCombat]);

    const displayedText = useTypewriter(narrativeText, 20, handleTypingComplete);

    useEffect(() => {
        // Auto-scroll to bottom on new log entry
        if (panelRef.current) {
            panelRef.current.scrollTop = panelRef.current.scrollHeight;
        }
    }, [combatLog]);

    const renderContent = () => {
        if (isLoading) return <p>Merangkai takdir...</p>;
        
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

        return <p>{displayedText}</p>;
    };

    return (
        <div className="panel narrative-panel" ref={panelRef}>
            {renderContent()}
        </div>
    );
};

export default NarrativePanel;