import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BankAccount, Objective } from '../types';
import { Plus, Trash2, Pencil, Check, X, RefreshCw } from 'lucide-react';

type ThemeType = 'royal' | 'pink';

const Settings: React.FC = () => {
  const [foyerName, setFoyerName] = useState("Foyer de Jean & Monique");
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('smart_currency') || 'EUR';
  });
  const [notifications, setNotifications] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem('smart_app_theme') as ThemeType) || 'royal';
  });
  const [currentTier, setCurrentTier] = useState<'freemium' | 'premium'>(() => {
    return (localStorage.getItem('smart_tier') as 'freemium' | 'premium') || 'premium';
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('smart_bank_accounts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all accounts have a balance property and update defaults if necessary
      return parsed.map((acc: any) => {
        const updatedAcc = { ...acc, balance: acc.balance ?? 0 };
        if (acc.id === 'main' && (acc.bankName === 'Banque Principale' || !acc.bankName)) {
          updatedAcc.bankName = 'BNP Paribas';
          updatedAcc.syncWithSavings = true;
        }
        if (acc.id === 'saving' && (acc.bankName === 'Banque Épargne' || !acc.bankName)) {
          updatedAcc.bankName = 'Revolut';
          updatedAcc.syncWithSavings = true;
        }
        return updatedAcc;
      });
    }
    return [
      { id: 'main', name: 'Compte Principal', bankName: 'BNP Paribas', balance: 0, isDefault: true, syncWithSavings: true },
      { id: 'saving', name: 'Compte Épargne', bankName: 'Revolut', balance: 0, isDefault: true, syncWithSavings: true }
    ];
  });

  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [editingBankName, setEditingBankName] = useState('');
  const [editingBankBankName, setEditingBankBankName] = useState('');
  const [editingBankBalance, setEditingBankBalance] = useState<number>(0);
  const [editingBankSyncWithSavings, setEditingBankSyncWithSavings] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankBankName, setNewBankBankName] = useState('');
  const [newBankBalance, setNewBankBalance] = useState<number>(0);
  const [newBankSyncWithSavings, setNewBankSyncWithSavings] = useState(false);

  const [objectives] = useState<Objective[]>(() => {
    const saved = localStorage.getItem('smart_objectives');
    return saved ? JSON.parse(saved) : [];
  });

  const savingsByAccount = useMemo(() => {
    const data: { [key: string]: number } = {};
    objectives.forEach(obj => {
      const accountId = obj.bankAccountId || 'unknown';
      data[accountId] = (data[accountId] || 0) + obj.currentAmount;
    });
    return data;
  }, [objectives]);

  const couplingCode = "SMART-882-XQ";

  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const triggerSavedMessage = () => {
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  // Sauvegarder la devise
  useEffect(() => {
    const old = localStorage.getItem('smart_currency');
    if (old !== currency) {
      localStorage.setItem('smart_currency', currency);
      window.dispatchEvent(new Event('currencyChange'));
      triggerSavedMessage();
    }
  }, [currency]);

  // Appliquer le thème au chargement et au changement
  useEffect(() => {
    const root = document.documentElement;
    const old = localStorage.getItem('smart_app_theme');
    
    if (currentTheme === 'pink') {
      root.style.setProperty('--color-royal', '#be185d'); // Rose profond
      root.style.setProperty('--color-gold', '#fb7185');  // Rose-or
    } else {
      root.style.setProperty('--color-royal', '#1f4e79'); // Bleu Royal
      root.style.setProperty('--color-gold', '#D4AF37');  // Or
    }

    if (old !== currentTheme) {
      localStorage.setItem('smart_app_theme', currentTheme);
      triggerSavedMessage();
    }
  }, [currentTheme]);

  // Sauvegarder le tier
  useEffect(() => {
    const old = localStorage.getItem('smart_tier');
    if (old !== currentTier) {
      localStorage.setItem('smart_tier', currentTier);
      window.dispatchEvent(new Event('tierChange'));
      triggerSavedMessage();
    }
  }, [currentTier]);

  // Sauvegarder le nom du foyer
  useEffect(() => {
    const old = localStorage.getItem('smart_foyer_name');
    if (old !== foyerName) {
      localStorage.setItem('smart_foyer_name', foyerName);
      triggerSavedMessage();
    }
  }, [foyerName]);

  // Sauvegarder les comptes bancaires
  useEffect(() => {
    localStorage.setItem('smart_bank_accounts', JSON.stringify(bankAccounts));
    // Also update FinanceConfig if it exists
    const savedFinance = localStorage.getItem('smart_finance_config');
    if (savedFinance) {
      const config = JSON.parse(savedFinance);
      config.bankAccounts = bankAccounts;
      localStorage.setItem('smart_finance_config', JSON.stringify(config));
    }
  }, [bankAccounts]);

  const handleAddBank = () => {
    if (bankAccounts.length >= 5) {
      alert("Vous ne pouvez pas avoir plus de 5 comptes bancaires.");
      return;
    }
    if (!newBankName.trim()) return;
    
    const newBank: BankAccount = {
      id: Date.now().toString(),
      name: newBankName.trim(),
      bankName: newBankBankName.trim() || undefined,
      balance: newBankSyncWithSavings ? (savingsByAccount[Date.now().toString()] || 0) : newBankBalance,
      isDefault: false,
      syncWithSavings: newBankSyncWithSavings
    };
    
    setBankAccounts([...bankAccounts, newBank]);
    setNewBankName('');
    setNewBankBankName('');
    setNewBankBalance(0);
    setNewBankSyncWithSavings(false);
    setIsAddingBank(false);
    triggerSavedMessage();
  };

  const handleUpdateBank = (id: string) => {
    if (!editingBankName.trim()) return;
    setBankAccounts(bankAccounts.map(b => b.id === id ? { 
      ...b, 
      name: editingBankName.trim(),
      bankName: editingBankBankName.trim() || undefined,
      balance: editingBankSyncWithSavings ? (savingsByAccount[id] || 0) : editingBankBalance,
      syncWithSavings: editingBankSyncWithSavings
    } : b));
    setEditingBankId(null);
    setEditingBankName('');
    setEditingBankBankName('');
    setEditingBankBalance(0);
    setEditingBankSyncWithSavings(false);
    triggerSavedMessage();
  };

  const handleDeleteBank = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce compte ?")) {
      setBankAccounts(bankAccounts.filter(b => b.id !== id));
      triggerSavedMessage();
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=Rejoins-moi sur Smart Couple ! Voici mon code de couplage : ${couplingCode}`,
    gmail: `mailto:?subject=Notre Code de Couplage Smart Couple&body=Bonjour ! Voici notre code pour synchroniser nos comptes sur Smart Couple : ${couplingCode}`,
    sms: `sms:?body=Rejoins-moi sur Smart Couple ! Voici mon code : ${couplingCode}`
  };

  return (
    <div className="container mx-auto px-6 max-w-4xl pb-32 animate-fadeIn pt-10 relative">
      {/* Floating Status Message */}
      {showSavedMessage && (
        <div className="fixed top-32 right-10 z-[5000] bg-royal text-white px-8 py-4 rounded-sm shadow-premium border-l-4 border-gold animate-slideInRight flex items-center gap-3">
          <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Préférences synchronisées</span>
        </div>
      )}

      <header className="mb-16 text-center md:text-left">
        <h5 className="text-gold font-bold text-xs tracking-[0.4em] mb-4 uppercase">Configuration Globale</h5>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-royal mb-4 uppercase tracking-tight">
          Paramètres
        </h1>
        <p className="text-gray-500 max-w-xl leading-relaxed text-base font-light">
          Personnalisez l'expérience Smart Couple pour votre foyer et gérez vos préférences de synchronisation.
        </p>
      </header>

      <div className="space-y-10">
        
        {/* Section Apparence & Thème */}
        <section className="bg-white p-10 rounded-sm shadow-soft border border-gray-50">
          <h4 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-8 border-b border-gray-50 pb-4">Apparence & Thème</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setCurrentTheme('royal')}
              className={`flex items-center gap-6 p-6 rounded-sm border transition-all ${
                currentTheme === 'royal' ? 'border-royal bg-royal/5 shadow-md' : 'border-gray-100 hover:border-royal/30'
              }`}
            >
              <div className="flex gap-1">
                <div className="w-8 h-8 rounded-full bg-[#1f4e79]"></div>
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]"></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-royal uppercase tracking-widest">Classique Royal</p>
                <p className="text-[10px] text-gray-400 uppercase">Bleu Profond & Or</p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentTheme('pink')}
              className={`flex items-center gap-6 p-6 rounded-sm border transition-all ${
                currentTheme === 'pink' ? 'border-royal bg-royal/5 shadow-md' : 'border-gray-100 hover:border-royal/30'
              }`}
            >
              <div className="flex gap-1">
                <div className="w-8 h-8 rounded-full bg-[#be185d]"></div>
                <div className="w-8 h-8 rounded-full bg-[#fb7185]"></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-royal uppercase tracking-widest">Rose Quartz</p>
                <p className="text-[10px] text-gray-400 uppercase">Rose Passion & Champagne</p>
              </div>
            </button>
          </div>
        </section>

        {/* Section Abonnement */}
        <section className="bg-white p-10 rounded-sm shadow-soft border border-gray-50">
          <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
            <h4 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Niveau d'Abonnement</h4>
            <Link to="/subscription" className="text-[8px] font-bold text-gold hover:text-royal uppercase tracking-widest transition-colors">Voir les avantages →</Link>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <button 
              onClick={() => setCurrentTier('freemium')}
              className={`flex-1 p-6 rounded-sm border transition-all text-center ${
                currentTier === 'freemium' ? 'border-royal bg-royal/5 shadow-md' : 'border-gray-100 hover:border-royal/30'
              }`}
            >
              <p className="text-sm font-bold text-royal uppercase tracking-widest mb-1">Freemium</p>
              <p className="text-[10px] text-gray-400 uppercase">L'essentiel gratuit</p>
            </button>

            <button 
              onClick={() => setCurrentTier('premium')}
              className={`flex-1 p-6 rounded-sm border transition-all text-center relative overflow-hidden ${
                currentTier === 'premium' ? 'border-gold bg-gold/5 shadow-md' : 'border-gray-100 hover:border-gold/30'
              }`}
            >
              {currentTier === 'premium' && (
                <div className="absolute top-0 right-0 gold-gradient px-2 py-0.5 text-[6px] font-bold text-white tracking-widest uppercase transform rotate-45 translate-x-4 translate-y-1">
                  ACTIF
                </div>
              )}
              <p className="text-sm font-bold text-royal uppercase tracking-widest mb-1">Premium</p>
              <p className="text-[10px] text-gold uppercase">Expérience complète</p>
            </button>
          </div>
        </section>

        {/* Section Profil Foyer */}
        <section className="bg-white p-10 rounded-sm shadow-soft border border-gray-50">
          <h4 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-8 border-b border-gray-50 pb-4">Profil du Foyer</h4>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-royal uppercase tracking-widest block ml-1">Nom du foyer</label>
              <input 
                type="text" 
                value={foyerName}
                onChange={(e) => setFoyerName(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-none text-base text-royal rounded-sm focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-royal uppercase tracking-widest block ml-1">Devise par défaut</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-none text-base text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="CHF">Franc Suisse (CHF)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-royal uppercase tracking-widest block ml-1">Notifications</label>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-full px-6 py-4 rounded-sm font-bold text-xs uppercase tracking-[0.2em] transition-all border ${
                    notifications ? 'bg-royal text-white border-royal shadow-md' : 'bg-gray-50 text-gray-400 border-transparent'
                  }`}
                >
                  {notifications ? 'ACTIVÉES' : 'DÉSACTIVÉES'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section Comptes Bancaires */}
        <section className="bg-white p-10 rounded-sm shadow-soft border border-gray-50">
          <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
            <h4 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Comptes Bancaires</h4>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{bankAccounts.length} / 5</span>
          </div>
          
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div key={account.id} className="p-4 bg-gray-50 rounded-sm group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100">
                {editingBankId === account.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Nom du compte</label>
                        <input 
                          type="text" 
                          value={editingBankName}
                          onChange={(e) => setEditingBankName(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gold text-sm text-royal rounded-sm outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Nom de la banque</label>
                        <input 
                          type="text" 
                          value={editingBankBankName}
                          onChange={(e) => setEditingBankBankName(e.target.value)}
                          placeholder="Ex: BNP, Revolut..."
                          className="w-full px-4 py-2 bg-white border border-gold text-sm text-royal rounded-sm outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-sm">
                        <button 
                          type="button"
                          onClick={() => setEditingBankSyncWithSavings(!editingBankSyncWithSavings)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${editingBankSyncWithSavings ? 'bg-gold' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${editingBankSyncWithSavings ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-royal uppercase tracking-widest">Gérer via l'épargne</span>
                          <span className="text-[8px] text-gray-400 font-medium">Le solde sera égal au total des objectifs d'épargne liés.</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          {editingBankSyncWithSavings ? 'Solde calculé (Épargne)' : `Solde actuel (${currency})`}
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={editingBankSyncWithSavings ? (savingsByAccount[account.id] || 0) : editingBankBalance}
                            onChange={(e) => setEditingBankBalance(parseFloat(e.target.value) || 0)}
                            disabled={editingBankSyncWithSavings}
                            className={`w-full px-4 py-2 bg-white border border-gold text-sm text-royal rounded-sm outline-none font-bold ${editingBankSyncWithSavings ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                          />
                          {editingBankSyncWithSavings && (
                            <RefreshCw className="w-3 h-3 text-gold absolute right-3 top-1/2 -translate-y-1/2 animate-spin-slow" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => setEditingBankId(null)} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-royal">
                        Annuler
                      </button>
                      <button onClick={() => handleUpdateBank(account.id)} className="px-6 py-2 bg-royal text-white text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer flex-grow" onClick={() => {
                      setEditingBankId(account.id);
                      setEditingBankName(account.name);
                      setEditingBankBankName(account.bankName || '');
                      setEditingBankBalance(account.balance);
                      setEditingBankSyncWithSavings(!!account.syncWithSavings);
                    }}>
                      <div className={`w-3 h-3 rounded-full ${account.isDefault ? 'bg-gold' : 'bg-royal'} shadow-sm`}></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-royal uppercase tracking-widest">{account.name}</span>
                          {account.isDefault && <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded-full">Par défaut</span>}
                          {account.syncWithSavings && <span className="text-[8px] text-gold font-bold uppercase tracking-tighter bg-gold/5 border border-gold/20 px-1.5 py-0.5 rounded-full flex items-center gap-1"><RefreshCw className="w-2 h-2" /> Synchro Épargne</span>}
                        </div>
                        <div className="flex flex-col mt-1">
                          <div className="flex items-center gap-3">
                            {account.bankName && <span className="text-[10px] text-gray-400 font-medium italic">{account.bankName}</span>}
                            <span className="text-xs font-bold text-gold">
                              {account.syncWithSavings 
                                ? (savingsByAccount[account.id] || 0).toLocaleString() 
                                : (account.balance || 0).toLocaleString()} {currency}
                            </span>
                          </div>
                          {account.syncWithSavings && (
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Basé sur vos objectifs d'épargne</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingBankId(account.id);
                          setEditingBankName(account.name);
                          setEditingBankBankName(account.bankName || '');
                          setEditingBankBalance(account.balance);
                        }}
                        className="p-2 text-gray-400 hover:text-gold transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!account.isDefault && (
                        <button 
                          onClick={() => handleDeleteBank(account.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isAddingBank ? (
              <div className="p-6 bg-gold/5 border border-gold/20 rounded-sm space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Nom du compte</label>
                    <input 
                      type="text" 
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      placeholder="Ex: Compte Courant"
                      className="w-full px-4 py-2 bg-white border border-gold text-sm text-royal rounded-sm outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Nom de la banque</label>
                    <input 
                      type="text" 
                      value={newBankBankName}
                      onChange={(e) => setNewBankBankName(e.target.value)}
                      placeholder="Ex: BNP, Revolut..."
                      className="w-full px-4 py-2 bg-white border border-gold text-sm text-royal rounded-sm outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-sm">
                    <button 
                      type="button"
                      onClick={() => setNewBankSyncWithSavings(!newBankSyncWithSavings)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${newBankSyncWithSavings ? 'bg-gold' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${newBankSyncWithSavings ? 'left-5.5' : 'left-0.5'}`}></div>
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-royal uppercase tracking-widest">Gérer via l'épargne</span>
                      <span className="text-[8px] text-gray-400 font-medium">Le solde sera égal au total des objectifs d'épargne liés.</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                      {newBankSyncWithSavings ? 'Solde calculé (Épargne)' : `Solde initial (${currency})`}
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={newBankSyncWithSavings ? 0 : newBankBalance}
                        onChange={(e) => setNewBankBalance(parseFloat(e.target.value) || 0)}
                        disabled={newBankSyncWithSavings}
                        className={`w-full px-4 py-2 bg-white border border-gold text-sm text-royal rounded-sm outline-none font-bold ${newBankSyncWithSavings ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      />
                      {newBankSyncWithSavings && (
                        <RefreshCw className="w-3 h-3 text-gold absolute right-3 top-1/2 -translate-y-1/2 animate-spin-slow" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setIsAddingBank(false)} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-royal">
                    Annuler
                  </button>
                  <button onClick={handleAddBank} className="px-6 py-2 bg-royal text-white text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                    Ajouter
                  </button>
                </div>
              </div>
            ) : (
              bankAccounts.length < 5 && (
                <button 
                  onClick={() => setIsAddingBank(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 hover:border-gold hover:text-gold transition-all flex items-center justify-center gap-2 rounded-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter un compte</span>
                </button>
              )
            )}
          </div>
          <p className="mt-4 text-[9px] text-gray-400 italic">Vous pouvez gérer jusqu'à 5 comptes bancaires au total.</p>
        </section>

        {/* Section Sécurité & Partage */}
        <section className="bg-white p-10 rounded-sm shadow-soft border border-gray-50">
          <h4 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-8 border-b border-gray-50 pb-4">Partage & Synchronisation</h4>
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-2 flex-grow">
              <p className="text-sm font-bold text-royal uppercase tracking-tight">Code de couplage actif</p>
              <p className="text-3xl font-serif font-bold text-gold tracking-widest">{couplingCode}</p>
              <p className="text-xs text-gray-400 italic">Ce code permet à votre partenaire de rejoindre votre foyer.</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">Partager via</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <i className="fa-brands fa-whatsapp text-xl"></i>
                </a>
                <a href={shareLinks.gmail} className="w-12 h-12 rounded-full bg-royal text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <i className="fa-solid fa-envelope text-xl"></i>
                </a>
                <a href={shareLinks.sms} className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <i className="fa-solid fa-comment-sms text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-50 text-center">
            <button className="text-[10px] font-bold text-royal hover:text-gold uppercase tracking-widest transition-colors">
              GÉNÉRER UN NOUVEAU CODE
            </button>
          </div>
        </section>

        {/* Section Danger Zone */}
        <section className="bg-red-50/30 p-10 rounded-sm border border-red-100">
          <h4 className="text-[10px] font-bold text-red-400 tracking-[0.2em] uppercase mb-6">Zone de Danger</h4>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-500 max-w-md">La suppression de votre compte ou de votre foyer est définitive. Toutes vos données financières et souvenirs seront effacés.</p>
            <button className="px-8 py-4 border-2 border-red-200 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-sm">
              SUPPRIMER LE FOYER
            </button>
          </div>
        </section>
      </div>

      <div className="mt-16 text-center space-y-6">
        <button 
          onClick={() => {
            if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible et l'application sera rechargée avec les données de démonstration d'origine.")) {
              localStorage.clear();
              // Force reload from server to clear any memory cache
              window.location.href = window.location.origin + '/settings';
            }
          }}
          className="bg-white border-2 border-gold text-gold px-12 py-4 font-bold tracking-[0.2em] uppercase shadow-md hover:bg-gold hover:text-white transition-all text-[10px] rounded-sm"
        >
          Réinitialiser les données par défaut
        </button>
        <p className="text-[9px] text-gray-400 uppercase tracking-widest">Les modifications sont enregistrées automatiquement</p>
      </div>
    </div>
  );
};

export default Settings;
