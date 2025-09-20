import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { useItem } from '../../store/gameSlice';
import { codex } from '../../core/codex';
import { ItemId } from '../../types';

const InventoryUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const inventory = useSelector((state: RootState) => state.game.player.inventory);
    const dispatch = useDispatch<AppDispatch>();
    
    if (!isOpen) return null;

    const handleUseItem = (itemId: ItemId) => {
        dispatch(useItem(itemId));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Inventaris</h2>
                <button onClick={onClose} className="close-button">X</button>
                <ul className="inventory-list">
                    {inventory.length > 0 ? inventory.map(item => {
                        const itemDetails = codex.items[item.itemId];
                        const isUsable = itemDetails?.effects && itemDetails.effects.length > 0;
                        return (
                            <li key={item.itemId}>
                                <div className="item-info">
                                    <strong>{itemDetails?.name || item.itemId} (x{item.quantity})</strong>
                                    <p>{itemDetails?.description || 'No description.'}</p>
                                </div>
                                {isUsable && (
                                    <button className="action-button" onClick={() => handleUseItem(item.itemId)}>
                                        Gunakan
                                    </button>
                                )}
                            </li>
                        );
                    }) : <li>Kosong</li>}
                </ul>
            </div>
        </div>
    );
};

export default InventoryUI;