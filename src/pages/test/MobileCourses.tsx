import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingItem, ArchivedShoppingList } from './MobileTypes';
import { translations, translateShoppingItemName } from './translations';

interface MobileCoursesProps {
  onBack: () => void;
  shoppingItems: ShoppingItem[];
  setShoppingItems: (items: ShoppingItem[]) => void;
  oldLists: ArchivedShoppingList[];
  setOldLists: React.Dispatch<React.SetStateAction<ArchivedShoppingList[]>>;
  lang?: 'fr' | 'en';
}

const MobileCourses: React.FC<MobileCoursesProps> = ({ 
  onBack, 
  shoppingItems, 
  setShoppingItems,
  oldLists,
  setOldLists,
  lang = 'fr'
}) => {
  const t = translations[lang || 'fr'];
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('u');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [activeListName, setActiveListName] = useState('Liste Principale');
  const [activeListId, setActiveListId] = useState('default');

  const [isOldListsOpen, setIsOldListsOpen] = useState(false);
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [customListName, setCustomListName] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const shoppingUnits = ['u', 'kg', 'g', 'L', 'ml', 'paq'];
  const estimatedTotal = shoppingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Safely synchronize current active list changes with the list entry inside oldLists in real-time
  React.useEffect(() => {
    if (!activeListId) return;

    setOldLists(prev => {
      const idx = prev.findIndex(l => l.id === activeListId);
      const total = shoppingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (idx > -1) {
        const current = prev[idx];
        const itemsChanged = JSON.stringify(current.items) !== JSON.stringify(shoppingItems);
        const nameChanged = current.name !== activeListName;
        
        if (itemsChanged || nameChanged) {
          const copy = [...prev];
          copy[idx] = {
            ...current,
            name: activeListName,
            itemsCount: shoppingItems.length,
            total: total,
            items: shoppingItems
          };
          return copy;
        }
      }
      return prev;
    });
  }, [shoppingItems, activeListName, activeListId, setOldLists]);

  const handleCreateNewList = () => {
    setCustomListName('');
    setIsNamingModalOpen(true);
  };

  const handleConfirmCreateList = () => {
    if (!customListName.trim()) return;

    // Archive current default list if it's active and not empty before spawning a new one
    if (activeListId === 'default' && shoppingItems.length > 0) {
      const archived: ArchivedShoppingList = {
        id: 'default',
        name: activeListName,
        date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US'),
        itemsCount: shoppingItems.length,
        total: estimatedTotal,
        items: [...shoppingItems]
      };
      setOldLists(prev => {
        const filtered = prev.filter(l => l.id !== 'default');
        return [archived, ...filtered];
      });
    }

    const newId = `list-${Date.now()}`;
    const newName = customListName.trim();

    setActiveListName(newName);
    setActiveListId(newId);
    setShoppingItems([]);

    setOldLists(prev => [
      {
        id: newId,
        name: newName,
        date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US'),
        itemsCount: 0,
        total: 0,
        items: []
      },
      ...prev
    ]);

    setIsNamingModalOpen(false);
  };

  const handleRestoreOldList = (archived: ArchivedShoppingList) => {
    // 1. Keep track of current default list
    const currentItemsCount = shoppingItems.length;
    const currentTotal = estimatedTotal;

    // 2. If modern default list exists with elements, flush it safely back to oldLists cache
    if (activeListId === 'default' && currentItemsCount > 0) {
      const snap: ArchivedShoppingList = {
        id: 'default',
        name: activeListName,
        date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US'),
        itemsCount: currentItemsCount,
        total: currentTotal,
        items: [...shoppingItems]
      };
      setOldLists(prev => {
        const filtered = prev.filter(l => l.id !== 'default');
        return [snap, ...filtered];
      });
    }

    // 3. Mount restored list as active
    setActiveListName(archived.name);
    setActiveListId(archived.id);
    setShoppingItems(archived.items || []);
    setIsOldListsOpen(false);
  };

  const handleDeleteOldList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOldLists(prev => prev.filter(l => l.id !== id));
    if (activeListId === id) {
      setActiveListName(lang === 'fr' ? 'Liste Principale' : 'Main Shopping List');
      setActiveListId('default');
      setShoppingItems([]);
    }
  };

  const handleDeleteCurrentList = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteCurrentList = () => {
    setShoppingItems([]);
    setIsDeleteConfirmOpen(false);

    // Also remove the entry from old lists if it is a custom created list
    if (activeListId !== 'default') {
      setOldLists(prev => prev.filter(l => l.id !== activeListId));
      setActiveListName(lang === 'fr' ? 'Liste Principale' : 'Main Shopping List');
      setActiveListId('default');
    }
  };

  const getListNameDisplay = () => {
    if (activeListId === 'default' && activeListName === 'Liste Principale') {
      return lang === 'fr' ? 'Liste Principale' : 'Main Shopping List';
    }
    return activeListName;
  };

  return (
    <motion.div
      key={`courses-${activeListId}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col no-scrollbar relative"
    >
      {/* Courses Header */}
      <div className="px-6 pt-4 mb-3">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="text-royal">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-serif font-bold text-royal">{lang === 'fr' ? 'Shopping' : 'Shopping'}</h1>
            <span className="text-[10px] font-black text-gold uppercase tracking-wider -mt-1 flex items-center gap-1">
              <i className="fa-solid fa-basket-shopping text-[8px]"></i>
              {getListNameDisplay()}
            </span>
          </div>
        </div>

        {/* Royal Combined Rectangle (Summary) */}
        <div className="relative h-20 w-full rounded-2xl overflow-hidden shadow-soft flex border border-gold mb-4">
          <div className="w-1/3 bg-royal flex flex-col items-center justify-center">
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest mb-1">Total</span>
            <span className="text-xl font-serif font-bold text-white">{shoppingItems.length}</span>
          </div>
          <div className="w-1/3 bg-gold flex flex-col items-center justify-center">
            <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest mb-1">
              {lang === 'fr' ? 'À Acheter' : 'To Buy'}
            </span>
            <span className="text-xl font-serif font-bold text-white flex items-center justify-center">
              {shoppingItems.filter(i => !i.checked).length}
            </span>
          </div>
          <div className="w-1/3 bg-royal flex flex-col items-center justify-center border-l border-gold/20">
            <span className="text-[8px] font-bold text-gold uppercase tracking-widest mb-1">
              {lang === 'fr' ? 'Budget Estimé' : 'Est. Budget'}
            </span>
            <span className="text-sm font-serif font-bold text-white">
              {estimatedTotal.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* List Operations Action Bar */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={handleCreateNewList}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-gold hover:bg-gold/5 bg-white transition-all text-center"
          >
            <i className="fa-solid fa-file-circle-plus text-[11px] text-royal mb-1"></i>
            <span className="text-[7.5px] font-bold text-gold uppercase tracking-tighter">{t.crsCreateList}</span>
          </button>
          
          <button 
            onClick={() => setIsOldListsOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-gold hover:bg-gold/5 bg-white transition-all text-center"
          >
            <i className="fa-solid fa-history text-[11px] text-royal mb-1"></i>
            <span className="text-[7.5px] font-bold text-gold uppercase tracking-tighter">
              {lang === 'fr' ? 'Hist. Listes' : 'History'}
            </span>
          </button>

          <button 
            onClick={handleDeleteCurrentList}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-red-200 hover:bg-red-50/50 bg-white transition-all text-center"
          >
            <i className="fa-solid fa-trash-can text-[11px] text-red-500 mb-1"></i>
            <span className="text-[7.5px] font-bold text-red-500 uppercase tracking-tighter">{t.crsSupprList}</span>
          </button>
        </div>
      </div>

      {/* Courses Content */}
      <div className="flex-grow px-6 pb-10 overflow-y-auto no-scrollbar">
        <div className="space-y-6">
          {/* Add Item Section */}
          <div className="bg-white border border-gold p-4 rounded-3xl shadow-soft space-y-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={lang === 'fr' ? 'Nouvel article...' : 'New item (E.g: Bread)...'}
                className="flex-grow bg-bgGray border border-gold/10 rounded-xl px-4 py-3 text-[12px] outline-none focus:border-gold transition-all font-bold text-royal"
              />
              <button 
                onClick={() => {
                  if (newItemName) {
                    setShoppingItems([{ 
                      id: Date.now().toString(), 
                      name: newItemName, 
                      cat: '', 
                      unit: newItemUnit,
                      quantity: newItemQuantity,
                      price: newItemPrice,
                      checked: false 
                    }, ...shoppingItems]);
                    setNewItemName('');
                    setNewItemQuantity(1);
                    setNewItemPrice(0);
                  }
                }}
                className="w-12 h-12 bg-royal text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all font-bold shrink-0"
              >
                <i className="fa-solid fa-plus font-bold"></i>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase ml-1">Qté / Qty</span>
                <input 
                  type="number" 
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                  className="bg-bgGray border border-gold/10 rounded-lg px-3 py-2 text-[11px] outline-none font-bold text-royal"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase ml-1">{lang === 'fr' ? 'Unité' : 'Unit'}</span>
                <select 
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="bg-bgGray border border-gold/10 rounded-lg px-3 py-2 text-[11px] outline-none font-bold text-royal"
                >
                  {shoppingUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase ml-1">{lang === 'fr' ? 'Prix Est. (€)' : 'Est. Price (€)'}</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="bg-bgGray border border-gold/10 rounded-lg px-3 py-2 text-[11px] outline-none font-bold text-royal"
                />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {shoppingItems.map((item, idx) => (
              <div 
                key={item.id} 
                className={`bg-white border border-gold rounded-2xl shadow-soft flex items-center overflow-hidden transition-all ${item.checked ? 'opacity-40' : ''}`}
              >
                <div className={`w-1.5 h-full min-h-[70px] self-stretch ${item.checked ? 'bg-gray-200' : (idx % 2 === 0 ? 'bg-royal' : 'bg-gold')}`}></div>
                
                <div className="flex-grow p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-grow overflow-hidden">
                    <button 
                      onClick={() => setShoppingItems(shoppingItems.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))}
                      className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-gold border-gold' : 'border-gold/30'}`}
                    >
                      {item.checked && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </button>
                    
                    {editingItemId === item.id ? (
                      <div className="flex flex-col gap-2 flex-grow">
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => setShoppingItems(shoppingItems.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                          className="text-[12px] font-bold text-royal border-b-2 border-gold outline-none w-full"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col flex-grow overflow-hidden" onClick={() => setEditingItemId(item.id)}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[12px] font-bold text-royal leading-tight truncate ${item.checked ? 'line-through opacity-55' : ''}`}>
                            {translateShoppingItemName(item.name, lang)}
                          </span>
                          <span className="text-[11px] font-bold text-gold shrink-0">
                            {(item.price * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-400 font-bold">
                            {item.quantity}{item.unit} • {item.price.toFixed(2)}€/{item.unit}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button 
                      onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gold transition-colors"
                    >
                      <i className={`fa-solid ${editingItemId === item.id ? 'fa-check' : 'fa-pen'} text-[9px]`}></i>
                    </button>
                    <button 
                      onClick={() => setShoppingItems(shoppingItems.filter(i => i.id !== item.id))}
                      className="w-7 h-7 flex items-center justify-center text-gray-200 hover:text-red-400 transition-colors"
                    >
                      <i className="fa-solid fa-trash-can text-[9px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {shoppingItems.length === 0 && (
              <div className="text-center py-12">
                <i className="fa-solid fa-basket-shopping text-gold/10 text-5xl mb-3"></i>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{t.crsEmptyBasket}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Dialog Modal */}
      <AnimatePresence>
        {isOldListsOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-royal/40 backdrop-blur-sm flex items-end"
            onClick={() => setIsOldListsOpen(false)}
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-[40px] p-8 shadow-premium border-t-4 border-gold z-50 max-h-[80%] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6 shrink-0"></div>
              <div className="text-center mb-6 shrink-0">
                <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest mb-1">
                  {lang === 'fr' ? 'Anciennes Listes' : 'Shopping History'}
                </h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {lang === 'fr' ? 'Sélectionnez une liste pour la restaurer' : 'Restore a former list to current active list'}
                </p>
              </div>

              <div className="space-y-3 overflow-y-auto no-scrollbar flex-grow pb-4">
                {oldLists.map((list) => {
                  const displayName = list.name === 'Liste Principale' ? (lang === 'fr' ? 'Liste Principale' : 'Main Shopping List') : list.name;
                  return (
                    <div 
                      key={list.id}
                      onClick={() => handleRestoreOldList(list)}
                      className="p-4 bg-bgGray border border-gold/15 rounded-2xl hover:border-gold cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-royal uppercase tracking-wider">{displayName || list.date}</span>
                        <span className="text-[11px] font-serif font-bold text-gold">{list.total.toFixed(2)}€</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>{list.itemsCount} {lang === 'fr' ? 'articles' : 'items'}</span>
                          {list.name && list.name !== list.date && (
                            <span className="text-[8px] bg-gold/10 text-gold px-1.5 py-0.5 rounded-md font-bold">{list.date}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-royal/60 font-semibold text-[8px] uppercase tracking-wider flex items-center gap-1">
                            {t.crsRestore} <i className="fa-solid fa-chevron-right text-[7px]"></i>
                          </span>
                          <button 
                            onClick={(e) => handleDeleteOldList(list.id, e)}
                            className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <i className="fa-solid fa-trash-can text-[9px]"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {oldLists.length === 0 && (
                  <div className="text-center py-12 opacity-60">
                    <i className="fa-solid fa-clock-rotate-left text-3xl mb-2 text-royal"></i>
                    <p className="text-[9px] font-bold text-royal uppercase tracking-widest">{t.crsNoHist}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsOldListsOpen(false)} 
                className="w-full mt-2 py-4 border border-gold/30 text-[10px] font-bold text-royal uppercase tracking-widest rounded-2xl hover:bg-gold/5 shrink-0"
              >
                {t.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Naming List Modal */}
      <AnimatePresence>
        {isNamingModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-royal/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setIsNamingModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-premium border border-gold"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-serif font-bold text-royal mb-1">{t.crsSaveList}</h3>
              <p className="text-[10px] text-gray-400 mb-4 uppercase font-bold tracking-widest">
                {lang === 'fr' ? 'Donnez un titre mémorable à cette liste' : 'Give a memorable title to this list'}
              </p>
              
              <input 
                type="text"
                value={customListName}
                onChange={(e) => setCustomListName(e.target.value)}
                placeholder={lang === 'fr' ? "Ex: Courses du Samedi, Noël..." : "E.g: Saturday Groceries, Christmas..."}
                className="w-full bg-bgGray border border-gold/20 rounded-xl px-4 py-3 text-[12px] outline-none focus:border-gold transition-all font-bold text-royal mb-4"
              />

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsNamingModalOpen(false)}
                  className="py-3 border border-gold/20 rounded-xl text-[10px] font-bold text-royal uppercase tracking-widest hover:bg-gold/5"
                >
                  {t.finCancel}
                </button>
                <button 
                  onClick={handleConfirmCreateList}
                  className="py-3 bg-royal text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-royal/95"
                >
                  {lang === 'fr' ? 'Valider' : 'Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-royal/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-premium border border-red-200"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-serif font-bold text-red-500 mb-1">{t.crsDeleteConfirmTitle}</h3>
              <p className="text-[10px] text-gray-400 mb-4 uppercase font-bold tracking-widest">
                {t.crsDeleteConfirmDesc}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="py-3 border border-gold/20 rounded-xl text-[10px] font-bold text-royal uppercase tracking-widest hover:bg-gold/5"
                >
                  {t.crsKeepBtn}
                </button>
                <button 
                  onClick={handleConfirmDeleteCurrentList}
                  className="py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-red-600"
                >
                  {t.crsDeleteConfirmBtn}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MobileCourses;
