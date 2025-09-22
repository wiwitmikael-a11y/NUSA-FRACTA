// components/ui/InventoryUI.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { codex } from '../../core/codex';
import { ItemId } from '../../types';

const InventoryUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const inventory = useSelector((state: RootState) => state.game.player.inventory);
    const dispatch = useDispatch<AppDispatch>();

    if (!isOpen) return null;

    const handleUseItem = (itemId: ItemId) => {
        // Dispatch logic to use an item would go here
        console.log(`Using item: ${itemId}`);
        // Example: dispatch(useItem(itemId));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Inventaris</h2>
                <button onClick={onClose} className="close-button">X</button>
                <ul className="inventory-list">
                    {inventory.length > 0 ? inventory.map(({ itemId, quantity }) => {
                        const itemDetails = codex.items[itemId];
                        if (!itemDetails) return null;
                        
                        return (
                            <li key={itemId}>
                                <div className="item-info">
                                    <strong>{itemDetails.name} (x{quantity})</strong>
                                    <p>{itemDetails.description}</p>
                                </div>
                                {itemDetails.type === 'consumable' && (
                                    <button 
                                        className="action-button"
                                        onClick={() => handleUseItem(itemId)}
                                    >
                                        Gunakan
                                    </button>
                                )}
                            </li>
                        );
                    }) : <li>Inventaris kosong.</li>}
                </ul>
            </div>
        </div>
    );
};

export default InventoryUI;
