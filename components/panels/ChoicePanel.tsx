import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { makeChoice } from '../../store/gameSlice';
import { ChapterNodeChoice, ChoiceCondition, Player, ItemId, SkillId, AttributeId } from '../../types';

const checkConditions = (player: Player, conditions: ChoiceCondition[]): boolean => {
    return conditions.every(condition => {
        if (condition.type === 'ATTRIBUTE') {
            const playerAttributeValue = player.attributes[condition.key as AttributeId];
            return playerAttributeValue >= condition.value;
        }
        if (condition.type === 'HAS_ITEM') {
            const itemInInventory = player.inventory.find(i => i.itemId === condition.key);
            return itemInInventory ? itemInInventory.quantity >= condition.value : false;
        }
        if (condition.type === 'HAS_SKILL') {
            return player.skillId === condition.key;
        }
        return true;
    });
};

const getConditionText = (conditions: ChoiceCondition[]): string => {
    return conditions.map(condition => {
        if (condition.type === 'ATTRIBUTE') {
            return `Butuh ${condition.key} >= ${condition.value}`;
        }
        if (condition.type === 'HAS_ITEM') {
            return `Butuh item: ${condition.key}`;
        }
        if (condition.type === 'HAS_SKILL') {
            return `Butuh keahlian: ${condition.key}`;
        }
        return '';
    }).join(', ');
}

const ChoicePanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { currentChapter, currentNodeId, player, isNarrativeComplete } = useSelector((state: RootState) => state.game);

    const currentNode = currentChapter?.nodes.find(node => node.nodeId === currentNodeId);

    const isChoiceDisabled = (choice: ChapterNodeChoice): boolean => {
        if (!choice.condition || choice.condition.length === 0) return false;
        return !checkConditions(player, choice.condition);
    };

    const handleChoiceClick = (choice: ChapterNodeChoice) => {
        dispatch(makeChoice(choice));
    };

    if (!currentNode || currentNode.isChapterEnd) {
        return <div className="panel choice-panel"></div>; // Hide choices on chapter end
    }
    
    if (currentNode.choices.length === 0) {
         return <div className="panel choice-panel">Jalan buntu... sepertinya ada yang salah.</div>;
    }

    return (
        <div className="panel choice-panel">
            {isNarrativeComplete && (
                <ul>
                    {currentNode.choices.map((choice, index) => {
                        const disabled = isChoiceDisabled(choice);
                        const title = disabled && choice.condition 
                            ? getConditionText(choice.condition)
                            : '';
                        
                        return (
                            <li key={index}>
                                <button
                                    onClick={() => handleChoiceClick(choice)}
                                    disabled={disabled}
                                    title={title}
                                    className={disabled ? 'choice-disabled' : ''}
                                >
                                    {choice.text}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ChoicePanel;