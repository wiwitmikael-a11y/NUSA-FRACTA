import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { calculateXpForNextLevel } from '../../core/gameRules';
import { codex } from '../../core/codex';

const StatusHUD: React.FC = () => {
    const { player } = useSelector((state: RootState) => state.game);
    const hpPercentage = player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 0;
    const nextLevelXp = calculateXpForNextLevel(player.level);
    const xpPercentage = nextLevelXp > 0 ? (player.xp / nextLevelXp) * 100 : 0;
    const activeCompanion = player.activeCompanion ? codex.companions[player.activeCompanion] : null;

    return (
        <div className="status-hud">
            {player.portraitUrl && (
                <div className="player-portrait">
                    <img src={player.portraitUrl} alt="Player Portrait" className="animated-portrait" />
                </div>
            )}
            {activeCompanion && (
                <div className="companion-portrait" title={`Companion Aktif: ${activeCompanion.name}`}>
                    <img src={activeCompanion.portraitUrl} alt={activeCompanion.name} className="animated-portrait" />
                </div>
            )}
            <div className="player-info">
                <div className="player-name">{player.name} | Lvl {player.level} | {player.skrip} Skrip</div>
                <div className="hud-bars">
                    <div className="hp-bar-container">
                        <div className="hp-bar" style={{ width: `${hpPercentage}%` }}></div>
                        <div className="hp-text">{player.hp} / {player.maxHp} HP</div>
                    </div>
                    <div className="xp-bar-container">
                        <div className="xp-bar" style={{ width: `${xpPercentage}%` }}></div>
                        <div className="xp-text">{player.xp} / {nextLevelXp} XP</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusHUD;