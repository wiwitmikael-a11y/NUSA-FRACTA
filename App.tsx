import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { addInfoLog } from './store/gameSlice';
import { saveGame } from './services/storageService';
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
import SettingsUI from './components/ui/SettingsUI';

// Helper hook to get previous value
function usePrevious<T>(value: T): T | undefined {
  // FIX: Explicitly provide `undefined` as the initial value to `useRef`.
  // Some TypeScript/ESLint configurations can misinterpret `useRef<T>()` as a call with 0 arguments when 1 is expected.
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const gameState = useSelector((state: RootState) => state.game);
    const { gameStarted, isLoading, isChapterEndModalOpen } = gameState;
    
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isJournalOpen, setJournalOpen] = useState(false);
    const [isCraftingOpen, setCraftingOpen] = useState(false);
    const [isMapOpen, setMapOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [isCommandMenuOpen, setCommandMenuOpen] = useState(false);
    const [introFinished, setIntroFinished] = useState(false);
    const commandMenuRef = useRef<HTMLDivElement>(null);
    
    // Initialize game event sound effects hook
    useGameSfx();

    const prevInventoryOpen = usePrevious(isInventoryOpen);
    const prevSheetOpen = usePrevious(isSheetOpen);
    const prevJournalOpen = usePrevious(isJournalOpen);
    const prevCraftingOpen = usePrevious(isCraftingOpen);
    const prevMapOpen = usePrevious(isMapOpen);
    const prevSettingsOpen = usePrevious(isSettingsOpen);

    const handleSaveGame = () => {
        saveGame('player1', gameState);
        dispatch(addInfoLog('Game berhasil disimpan.'));
    };

    // Global UI sound effects
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if ((event.target as HTMLElement).closest('button')) {
                soundService.playSfx('uiClick');
            }
        };
        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

     // Close command menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (commandMenuRef.current && !commandMenuRef.current.contains(event.target as Node)) {
                setCommandMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Modal open sound effect
    useEffect(() => {
        if ((isInventoryOpen && !prevInventoryOpen) ||
            (isSheetOpen && !prevSheetOpen) ||
            (isJournalOpen && !prevJournalOpen) ||
            (isCraftingOpen && !prevCraftingOpen) ||
            (isMapOpen && !prevMapOpen) ||
            (isSettingsOpen && !prevSettingsOpen)
            ) {
            soundService.playSfx('uiOpen');
        }
    }, [isInventoryOpen, isSheetOpen, isJournalOpen, isCraftingOpen, isMapOpen, isSettingsOpen, prevInventoryOpen, prevSheetOpen, prevJournalOpen, prevCraftingOpen, prevMapOpen, prevSettingsOpen]);

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
                <nav ref={commandMenuRef}>
                    <button className="command-menu-button" onClick={() => setCommandMenuOpen(prev => !prev)}>
                        Akses Terminal
                    </button>
                    <div className={`command-menu-dropdown ${isCommandMenuOpen ? 'open' : ''}`}>
                        <button onClick={() => { setSheetOpen(true); setCommandMenuOpen(false); }}>Karakter</button>
                        <button onClick={() => { setInventoryOpen(true); setCommandMenuOpen(false); }}>Inventaris</button>
                        <button onClick={() => { setMapOpen(true); setCommandMenuOpen(false); }}>Peta</button>
                        <button onClick={() => { setJournalOpen(true); setCommandMenuOpen(false); }}>Jurnal</button>
                        <button onClick={() => { setCraftingOpen(true); setCommandMenuOpen(false); }}>Racik</button>
                        <button onClick={() => { handleSaveGame(); setCommandMenuOpen(false); }}>Simpan</button>
                        <button onClick={() => { setSettingsOpen(true); setCommandMenuOpen(false); }}>Pengaturan</button>
                    </div>
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
            <SettingsUI isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
            <ChapterEndSummary isOpen={isChapterEndModalOpen} />
        </div>
    );
};

export default App;