import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { EventLogMessage } from '../../types';

const SidePanel: React.FC = () => {
    const { eventLog } = useSelector((state: RootState) => state.game);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`panel side-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="side-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--accent-color)'}}>Log Peristiwa</h3>
              <span className="side-panel-toggle">{isExpanded ? '▼' : '▲'}</span>
            </div>
           
            {isExpanded && eventLog.length > 0 && (
                <div className="event-log-container">
                    {eventLog.slice(-20).reverse().map((log, index) => (
                        <p key={`${log.id}-${index}`} className={`event-log-message ${log.type}`}>
                           {log.message}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SidePanel;