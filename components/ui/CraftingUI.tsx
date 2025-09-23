import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { craftItem } from '../../store/gameSlice';
import { codex } from '../../core/codex';
import { Recipe } from '../../types';

const CraftingUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const inventory = useSelector((state: RootState) => state.game.player.inventory);
    const dispatch = useDispatch<AppDispatch>();
    
    if (!isOpen) return null;

    const canCraft = (recipe: Recipe) => {
        return recipe.ingredients.every(ingredient => {
            const itemInInventory = inventory.find(i => i.itemId === ingredient.itemId);
            return itemInInventory ? itemInInventory.quantity >= ingredient.quantity : false;
        });
    };
    
    const handleCraft = (recipe: Recipe) => {
        dispatch(craftItem(recipe));
    };

    return (
        <div className="modal-overlay terminal-modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="terminal-header">
                    <span className="terminal-title">MODUL RACIK v2.1</span>
                     <button onClick={onClose} className="close-button">X</button>
                </div>
                <div className="terminal-body">
                    <ul className="crafting-list">
                        {Object.values(codex.recipes).map((recipe, index) => {
                            const isCraftable = canCraft(recipe);
                            const ingredientText = recipe.ingredients
                                .map(ing => `${codex.items[ing.itemId]?.name || ing.itemId} [${ing.quantity}]`)
                                .join(', ');

                            return (
                                <li key={index}>
                                    <div className="recipe-info">
                                        <strong>SKEMA: {recipe.name}</strong>
                                        <p>BUTUH: {ingredientText}</p>
                                    </div>
                                    <button 
                                        className="action-button"
                                        disabled={!isCraftable}
                                        onClick={() => handleCraft(recipe)}
                                    >
                                        [ RACIK ]
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CraftingUI;