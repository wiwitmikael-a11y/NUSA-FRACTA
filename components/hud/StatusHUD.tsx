import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const StatusHUD: React.FC = () => {
    const player = useSelector((state: RootState) => state.game.player);
    const hpPercentage = player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 0;
    const nextLevelXp = player.level * 100;
    const xpPercentage = nextLevelXp > 0 ? (player.xp / nextLevelXp) * 100 : 0;

    return (
        <div className="status-hud">
            <div className="player-name">{player.name} | Lvl {player.level}</div>
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
    );
};

export default StatusHUD;