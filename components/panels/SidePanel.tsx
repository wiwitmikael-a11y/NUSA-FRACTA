import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { EventLogMessage } from '../../types';

const SidePanel: React.FC = () => {
    const { eventLog } = useSelector((state: RootState) => state.game);
    const [displayLog, setDisplayLog] = useState<EventLogMessage[]>([]);
    
    useEffect(() => {
        if (eventLog.length > 0) {
            setDisplayLog(eventLog.slice(-5));
        }
    }, [eventLog]);

    return (
        <div className="panel side-panel">
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--accent-color)'}}>Log Peristiwa</h3>
            </div>
           
            {displayLog.length > 0 && (
                <div className="event-log-container">
                    {displayLog.slice().reverse().map((log, index) => (
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