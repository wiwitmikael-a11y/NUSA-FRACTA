import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { loadGame as loadGameAction } from './store/gameSlice';
import { loadGame as loadGameFromStorage } from './services/storageService';

import NarrativePanel from './components/panels/NarrativePanel';
import ChoicePanel from './components/panels/ChoicePanel';
import SidePanel from './components/panels/SidePanel';
import StatusHUD from './components/hud/StatusHUD';
import InventoryUI from './components/ui/InventoryUI';
import CharacterSheetUI from './components/ui/CharacterSheetUI';
import CharacterCreation from './components/CharacterCreation';
import ChapterEndSummary from './components/ui/ChapterEndSummary';
import CombatPanel from './components/panels/CombatPanel'; // NEW
import JournalUI from './components/ui/JournalUI'; // NEW
import CraftingUI from './components/ui/CraftingUI'; // NEW

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { gameStarted, isLoading, isChapterEndModalOpen, isInCombat } = useSelector((state: RootState) => state.game);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isJournalOpen, setJournalOpen] = useState(false); // NEW
    const [isCraftingOpen, setCraftingOpen] = useState(false); // NEW
    
    useEffect(() => {
        const attemptLoad = async () => {
            const savedGame = await loadGameFromStorage('player1');
            if (savedGame) {
                dispatch(loadGameAction(savedGame));
            }
        };
        attemptLoad();
    }, [dispatch]);

    if (!gameStarted) {
        return <CharacterCreation />;
    }
    
    return (
        <div className="app-container">
            <header className="app-header">
                <StatusHUD />
                <nav>
                    <button onClick={() => setJournalOpen(true)}>Jurnal</button>
                    <button onClick={() => setCraftingOpen(true)}>Buat</button>
                    <button onClick={() => setSheetOpen(true)}>Karakter</button>
                    <button onClick={() => setInventoryOpen(true)}>Inventaris</button>
                </nav>
            </header>
            
            <main className="game-world">
                <NarrativePanel />
                <SidePanel />
                {isInCombat ? <CombatPanel /> : <ChoicePanel />}
            </main>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Memproses takdir...</p>
                </div>
            )}
            
            <InventoryUI isOpen={isInventoryOpen} onClose={() => setInventoryOpen(false)} />
            <CharacterSheetUI isOpen={isSheetOpen} onClose={() => setSheetOpen(false)} />
            <JournalUI isOpen={isJournalOpen} onClose={() => setJournalOpen(false)} />
            <CraftingUI isOpen={isCraftingOpen} onClose={() => setCraftingOpen(false)} />
            <ChapterEndSummary isOpen={isChapterEndModalOpen} />
        </div>
    );
};

export default App;