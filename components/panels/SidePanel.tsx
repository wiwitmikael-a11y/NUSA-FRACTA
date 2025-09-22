import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { EventLogMessage } from '../../types';

const SidePanel: React.FC = () => {
    const { currentLocation, eventLog } = useSelector((state: RootState) => state.game);
    // State lokal ini akan menyimpan pesan log yang ingin kita tampilkan untuk sementara.
    const [displayLog, setDisplayLog] = useState<EventLogMessage[]>([]);
    
    useEffect(() => {
        // Ketika log peristiwa baru tiba dari Redux, kita akan menampilkannya.
        // Logika ini menggantikan log lama, mencegah bug akumulasi tak terbatas dan kunci duplikat.
        if (eventLog.length > 0) {
            // Tampilkan 5 log terakhir
            setDisplayLog(eventLog.slice(-5));
        }
    }, [eventLog]); // Efek ini hanya bergantung pada log peristiwa terbaru dari state Redux.

    return (
        <div className="panel side-panel">
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--accent-color)'}}>Informasi</h3>
               <p style={{ fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}><strong>Lokasi:</strong> {currentLocation}</p>
            </div>
           
            {displayLog.length > 0 && (
                <div className="event-log-container">
                    {/* 
                      Membalik array agar log terbaru muncul di atas, lalu memetakannya.
                      Menggunakan index sebagai key aman di sini karena daftar bersifat sementara.
                    */}
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