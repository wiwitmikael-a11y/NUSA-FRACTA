import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { attack, flee } from '../../store/gameSlice';
import { codex } from '../../core/codex';

const CombatPanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { currentEnemyId, enemyCurrentHp } = useSelector((state: RootState) => state.game);

    if (!currentEnemyId) return null;
    
    const enemy = codex.enemies[currentEnemyId];
    const enemyHpPercentage = (enemyCurrentHp / enemy.hp) * 100;
    
    return (
        <div className="panel combat-panel">
            <div className="enemy-status">
                <h4>{enemy.name}</h4>
                <div className="enemy-hp-bar-container">
                    <div className="enemy-hp-bar" style={{ width: `${enemyHpPercentage}%` }}></div>
                </div>
                <small>{enemyCurrentHp} / {enemy.hp} HP</small>
            </div>
            <ul>
                <li>
                    <button onClick={() => dispatch(attack())}>Serang</button>
                </li>
                {/* <li>
                    <button disabled>Gunakan Item</button>
                </li> */}
                <li>
                    <button onClick={() => dispatch(flee())}>Kabur</button>
                </li>
            </ul>
        </div>
    );
};

export default CombatPanel;
