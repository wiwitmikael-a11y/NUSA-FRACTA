// components/ui/InventoryUI.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { codex } from '../../core/codex';
import { ItemId, EquipmentSlot } from '../../types';
import { useItem, equipItem, unequipItem } from '../../store/gameSlice';

const InventoryUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { inventory, equippedItems } = useSelector((state: RootState) => state.game.player);
    const dispatch = useDispatch<AppDispatch>();

    if (!isOpen) return null;

    const handleUseItem = (itemId: ItemId) => {
        dispatch(useItem(itemId));
    };

    const handleEquipItem = (itemId: ItemId) => {
        dispatch(equipItem(itemId));
    };
    
    const handleUnequipItem = (slot: EquipmentSlot) => {
        dispatch(unequipItem(slot));
    };

    const renderEquippedItem = (slot: EquipmentSlot, slotName: string) => {
        const itemId = equippedItems[slot];
        const item = itemId ? codex.items[itemId] : null;

        return (
            <li key={slot}>
                <div className="item-info">
                    <strong>{slotName}: {item ? item.name : 'Kosong'}</strong>
                    {item && item.effects && <p>{item.effects.map(e => `+${e.value} ${e.key.replace(/_/g, ' ')}`).join(', ')}</p>}
                </div>
                {item && (
                    <button className="action-button" onClick={() => handleUnequipItem(slot)}>
                        Lepas
                    </button>
                )}
            </li>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="close-button">X</button>
                
                <h2>Terpasang</h2>
                <ul className="inventory-list" style={{ marginBottom: '2rem' }}>
                    {renderEquippedItem('meleeWeapon', 'Senjata')}
                    {renderEquippedItem('armor', 'Armor')}
                </ul>
                
                <h2>Inventaris</h2>
                <ul className="inventory-list">
                    {inventory.length > 0 ? inventory.map(({ itemId, quantity }) => {
                        const itemDetails = codex.items[itemId];
                        if (!itemDetails) return null;
                        
                        const isEquippable = !!itemDetails.equipmentSlot;

                        return (
                            <li key={itemId}>
                                <div className="item-info">
                                    <strong>{itemDetails.name} (x{quantity})</strong>
                                    <p>{itemDetails.description}</p>
                                </div>
                                {isEquippable ? (
                                    <button 
                                        className="action-button"
                                        onClick={() => handleEquipItem(itemId)}
                                    >
                                        Pasang
                                    </button>
                                ) : itemDetails.type === 'consumable' && (
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