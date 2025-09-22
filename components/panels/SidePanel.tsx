import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { EventLogMessage } from '../../types';

const SidePanel: React.FC = () => {
    const { currentLocation, eventLog, player } = useSelector((state: RootState) => state.game);
    // State lokal ini akan menyimpan pesan log yang ingin kita tampilkan untuk sementara.
    const [displayLog, setDisplayLog] = useState<EventLogMessage[]>([]);
    
    useEffect(() => {
        // Ketika log peristiwa baru tiba dari Redux, kita akan menampilkannya.
        // Logika ini menggantikan log lama, mencegah bug akumulasi tak terbatas dan kunci duplikat.
        if (eventLog.length > 0) {
            setDisplayLog(eventLog);
            
            // Kita mengatur timer untuk menghapus pesan setelah beberapa detik.
            const timer = setTimeout(() => {
                setDisplayLog([]);
            }, 5000); // Pesan menghilang setelah 5 detik.
            
            // Jika peristiwa baru terjadi sebelum timer selesai, fungsi cleanup akan menghapus timer lama.
            return () => clearTimeout(timer);
        }
    }, [eventLog]); // Efek ini hanya bergantung pada log peristiwa terbaru dari state Redux.

    return (
        <div className="panel side-panel">
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--accent-color)'}}>Informasi</h3>
               <p style={{ fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}><strong>Lokasi:</strong> {currentLocation}</p>
               <p style={{ fontSize: '1.1rem', margin: '0.25rem 0 0 0' }}><strong>Skrip:</strong> {player.skrip}</p>
            </div>
           
            {displayLog.length > 0 && (
                <div className="event-log-container">
                    {/* 
                      Daftar di displayLog bersifat sementara dan tidak pernah diurutkan ulang, jadi menggunakan indeks
                      di dalam key memastikan keunikan dan mencegah kesalahan rendering.
                    */}
                    {displayLog.map((log, index) => (
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