import React, { useState, useMemo } from 'react';
import { GroceryItem, GroceryList } from '../../types';

interface GroceryProps {
  lists: GroceryList[];
  setLists: React.Dispatch<React.SetStateAction<GroceryList[]>>;
  isPremium: boolean;
  setShowPremiumPrompt: (show: boolean) => void;
  currencySymbol: string;
}

const GroceryView: React.FC<GroceryProps> = ({ 
  lists, 
  setLists,
  isPremium,
  setShowPremiumPrompt,
  currencySymbol
}) => {
  const [activeListId, setActiveListId] = useState<string>(lists[0]?.id || 'default');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', unit: '', quantity: '1' });

  const activeList = useMemo(() => {
    return lists.find(l => l.id === activeListId) || lists[0] || { id: 'default', name: 'Liste', items: [] };
  }, [lists, activeListId]);

  const total = useMemo(() => {
    return activeList.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  }, [activeList]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    const item: GroceryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      price: parseFloat(newItem.price) || 0,
      unit: newItem.unit || 'unité',
      quantity: parseInt(newItem.quantity) || 1,
      checked: false
    };

    setLists(prev => prev.map(l => l.id === activeListId ? { ...l, items: [...l.items, item] } : l));
    setNewItem({ name: '', price: '', unit: '', quantity: '1' });
  };

  const handleToggleItem = (itemId: string) => {
    setLists(prev => prev.map(l => l.id === activeListId ? {
      ...l,
      items: l.items.map(it => it.id === itemId ? { ...it, checked: !it.checked } : it)
    } : l));
  };

  const handleDeleteItem = (itemId: string) => {
    setLists(prev => prev.map(l => l.id === activeListId ? {
      ...l,
      items: l.items.filter(it => it.id !== itemId)
    } : l));
  };

  const handleUpdateItem = (itemId: string, updates: Partial<GroceryItem>) => {
    setLists(prev => prev.map(l => l.id === activeListId ? {
      ...l,
      items: l.items.map(it => it.id === itemId ? { ...it, ...updates } : it)
    } : l));
    setIsEditing(null);
  };

  const handleCreateNewList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    const newList: GroceryList = { 
      id: Date.now().toString(), 
      name: newListName.trim(), 
      items: [] 
    };
    
    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
    setNewListName('');
    setIsAddingList(false);
  };

  const performDelete = () => {
    if (lists.length <= 1) return;
    const remaining = lists.filter(l => l.id !== activeListId);
    setLists(remaining);
    setActiveListId(remaining[0].id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-8 border-b border-gray-100 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            {lists.map(l => (
              <button
                key={l.id}
                onClick={() => setActiveListId(l.id)}
                className={`px-8 py-3 text-xs font-bold tracking-widest uppercase rounded-sm border transition-all ${
                  activeListId === l.id 
                    ? 'bg-royal text-white border-royal shadow-lg' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gold/50'
                }`}
              >
                {l.name}
              </button>
            ))}
            {!isAddingList ? (
              <button 
                onClick={() => {
                  if (!isPremium) {
                    setShowPremiumPrompt(true);
                    return;
                  }
                  setIsAddingList(true);
                }} 
                className="px-6 py-3 text-xs font-bold text-gold border-2 border-gold border-dashed rounded-sm hover:bg-gold hover:text-white transition-all uppercase tracking-widest"
              >
                {isPremium ? '+ NOUVELLE LISTE' : '🔒 NOUVELLE LISTE (PREMIUM)'}
              </button>
            ) : (
              <form onSubmit={handleCreateNewList} className="flex gap-2 bg-bgGray p-1 rounded-sm">
                <input autoFocus type="text" value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="Nom..." className="px-4 py-2 bg-white border border-gray-100 text-xs font-bold rounded-sm outline-none focus:ring-1 focus:ring-gold w-40" />
                <button type="submit" className="px-4 py-2 bg-royal text-white text-xs font-bold rounded-sm uppercase">OK</button>
              </form>
            )}
          </div>
          {lists.length > 1 && (
            <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest">
              {showDeleteConfirm ? 'ANNULER ?' : 'SUPPRIMER LA LISTE'}
            </button>
          )}
        </div>
        {showDeleteConfirm && (
          <div className="bg-red-50 p-4 rounded-sm border border-red-100 flex items-center justify-between">
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Confirmer la suppression de "{activeList.name}" ?</p>
            <button onClick={performDelete} className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-sm uppercase shadow-md">SUPPRIMER DÉFINITIVEMENT</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 bg-white p-10 rounded-sm shadow-soft border-l-8 border-royal flex flex-col justify-center">
          <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">LISTE ACTIVE</h5>
          <h2 className="text-3xl font-serif font-bold text-royal uppercase tracking-tight">{activeList.name}</h2>
        </div>
        <div className="bg-royal p-10 rounded-sm shadow-premium flex flex-col justify-center text-center">
          <h5 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.3em] mb-2">TOTAL ESTIMÉ</h5>
          <h3 className="text-4xl font-serif font-bold text-gold tracking-tight">{total.toFixed(2)} {currencySymbol}</h3>
        </div>
      </div>

      <form onSubmit={handleAddItem} className="bg-white p-10 rounded-sm shadow-lg border-2 border-royal/5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <label className="text-[12px] font-bold text-gold uppercase tracking-widest mb-2 block">Article</label>
            <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Ex: Fromage" className="w-full px-6 py-4 bg-bgGray border-none text-base text-royal font-bold rounded-sm focus:ring-1 focus:ring-gold outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[12px] font-bold text-gold uppercase tracking-widest mb-2 block">Unité</label>
            <input type="text" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} placeholder="unité" className="w-full px-6 py-4 bg-bgGray border-none text-base text-royal font-bold rounded-sm focus:ring-1 focus:ring-gold outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[12px] font-bold text-gold uppercase tracking-widest mb-2 block">Quantité</label>
            <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} className="w-full px-6 py-4 bg-bgGray border-none text-base text-royal font-bold rounded-sm focus:ring-1 focus:ring-gold outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[12px] font-bold text-gold uppercase tracking-widest mb-2 block">Prix ({currencySymbol})</label>
            <input type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="0.00" className="w-full px-6 py-4 bg-bgGray border-none text-base text-royal font-bold rounded-sm focus:ring-1 focus:ring-gold outline-none" />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button type="submit" className="w-full py-5 bg-royal text-white text-xs font-bold tracking-[0.2em] uppercase rounded-sm shadow-xl hover:bg-gold transition-all">AJOUTER</button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {activeList.items.map(it => (
          <div key={it.id} className={`group flex flex-col md:flex-row md:items-center gap-6 p-8 rounded-sm border-2 transition-all ${it.checked ? 'bg-bgGray/30 border-gray-100 opacity-60' : 'bg-white border-gray-50 shadow-soft hover:border-royal/10'}`}>
            <div className="flex items-center gap-6 flex-grow">
              <input type="checkbox" checked={it.checked} onChange={() => handleToggleItem(it.id)} className="w-8 h-8 text-gold border-gray-300 rounded-full focus:ring-gold cursor-pointer" />
              {isEditing === it.id ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
                  <input type="text" defaultValue={it.name} onBlur={(e) => handleUpdateItem(it.id, { name: e.target.value })} className="px-4 py-2 bg-white border-2 border-gray-200 text-sm font-bold rounded-sm outline-none focus:border-gold" />
                  <input type="text" defaultValue={it.unit} onBlur={(e) => handleUpdateItem(it.id, { unit: e.target.value })} className="px-4 py-2 bg-white border-2 border-gray-200 text-sm font-bold rounded-sm outline-none focus:border-gold" />
                  <input type="number" defaultValue={it.quantity} onBlur={(e) => handleUpdateItem(it.id, { quantity: parseInt(e.target.value) })} className="px-4 py-2 bg-white border-2 border-gray-200 text-sm font-bold rounded-sm outline-none focus:border-gold" />
                  <input type="number" step="0.01" defaultValue={it.price} onBlur={(e) => handleUpdateItem(it.id, { price: parseFloat(e.target.value) })} className="px-4 py-2 bg-white border-2 border-gray-200 text-sm font-bold rounded-sm outline-none focus:border-gold" />
                </div>
              ) : (
                <div className={`flex flex-col md:flex-row md:items-center gap-4 md:gap-10 flex-grow ${it.checked ? 'line-through text-gray-400' : 'text-royal'}`}>
                  <span className="font-bold text-xl min-w-[200px] uppercase tracking-tight">{it.name}</span>
                  <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span>{it.quantity} {it.unit}</span>
                    <span>{it.price.toFixed(2)} {currencySymbol} / u</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between md:justify-end gap-10 md:min-w-[220px]">
              <div className={`text-2xl font-serif font-bold ${it.checked ? 'text-gray-300' : 'text-royal'}`}>
                {(it.price * it.quantity).toFixed(2)} {currencySymbol}
              </div>
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(isEditing === it.id ? null : it.id)} className="p-3 text-gray-300 hover:text-gold transition-colors bg-bgGray rounded-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onClick={() => handleDeleteItem(it.id)} className="p-3 text-gray-200 hover:text-red-500 transition-colors bg-bgGray rounded-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroceryView;
