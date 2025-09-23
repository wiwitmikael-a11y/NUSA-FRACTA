import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { loadGame as loadGameAction } from './store/gameSlice';
import { loadGame as loadGameFromStorage } from './services/storageService';
import { useGameSfx } from './hooks/useGameSfx';
import soundService from './services/soundService';

import NarrativePanel from './components/panels/NarrativePanel';
import ChoicePanel from './components/panels/ChoicePanel';
import SidePanel from './components/panels/SidePanel';
import StatusHUD from './components/hud/StatusHUD';
import InventoryUI from './components/ui/InventoryUI';
import CharacterSheetUI from './components/ui/CharacterSheetUI';
import CharacterCreation from './components/CharacterCreation';
import ChapterEndSummary from './components/ui/ChapterEndSummary';
import JournalUI from './components/ui/JournalUI';
import CraftingUI from './components/ui/CraftingUI';
import ImagePanel from './components/panels/ImagePanel';
import LoadingOverlay from './components/ui/LoadingOverlay';
import IntroVideo from './components/IntroVideo';
import MapUI from './components/ui/MapUI';

// Helper hook to get previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { gameStarted, isLoading, isChapterEndModalOpen } = useSelector((state: RootState) => state.game);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isJournalOpen, setJournalOpen] = useState(false);
    const [isCraftingOpen, setCraftingOpen] = useState(false);
    const [isMapOpen, setMapOpen] = useState(false);
    const [introFinished, setIntroFinished] = useState(false);
    
    // Initialize game event sound effects hook
    useGameSfx();

    const prevInventoryOpen = usePrevious(isInventoryOpen);
    const prevSheetOpen = usePrevious(isSheetOpen);
    const prevJournalOpen = usePrevious(isJournalOpen);
    const prevCraftingOpen = usePrevious(isCraftingOpen);
    const prevMapOpen = usePrevious(isMapOpen);

    useEffect(() => {
        const attemptLoad = async () => {
            const savedGame = await loadGameFromStorage('player1');
            if (savedGame) {
                dispatch(loadGameAction(savedGame));
            }
        };
        attemptLoad();
    }, [dispatch]);

    // Global UI sound effects
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if ((event.target as HTMLElement).closest('button')) {
                soundService.playSfx('uiClick');
            }
        };
        // Use capture phase to ensure sound plays even if the event is stopped
        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    // Modal open sound effect
    useEffect(() => {
        if ((isInventoryOpen && !prevInventoryOpen) ||
            (isSheetOpen && !prevSheetOpen) ||
            (isJournalOpen && !prevJournalOpen) ||
            (isCraftingOpen && !prevCraftingOpen) ||
            (isMapOpen && !prevMapOpen)
            ) {
            soundService.playSfx('uiOpen');
        }
    }, [isInventoryOpen, isSheetOpen, isJournalOpen, isCraftingOpen, isMapOpen, prevInventoryOpen, prevSheetOpen, prevJournalOpen, prevCraftingOpen, prevMapOpen]);

    if (!introFinished) {
        return <IntroVideo onFinished={() => setIntroFinished(true)} />;
    }

    if (!gameStarted) {
        return <CharacterCreation />;
    }
    
    return (
        <div className="app-container">
            <header className="app-header">
                <StatusHUD />
                <nav>
                    <button onClick={() => setMapOpen(true)}>Peta</button>
                    <button onClick={() => setJournalOpen(true)}>Jurnal</button>
                    <button onClick={() => setCraftingOpen(true)}>Racik</button>
                    <button onClick={() => setSheetOpen(true)}>Karakter</button>
                    <button onClick={() => setInventoryOpen(true)}>Inventaris</button>
                </nav>
            </header>
            
            <main className="game-world">
                <ImagePanel />
                <div className="story-section">
                    <NarrativePanel />
                    <ChoicePanel />
                </div>
                <SidePanel />
            </main>

            {isLoading && <LoadingOverlay />}
            
            <InventoryUI isOpen={isInventoryOpen} onClose={() => setInventoryOpen(false)} />
            <CharacterSheetUI isOpen={isSheetOpen} onClose={() => setSheetOpen(false)} />
            <JournalUI isOpen={isJournalOpen} onClose={() => setJournalOpen(false)} />
            <CraftingUI isOpen={isCraftingOpen} onClose={() => setCraftingOpen(false)} />
            <MapUI isOpen={isMapOpen} onClose={() => setMapOpen(false)} />
            <ChapterEndSummary isOpen={isChapterEndModalOpen} />
        </div>
    );
};

export default App;