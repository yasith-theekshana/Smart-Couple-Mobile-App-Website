import React, { useState, useMemo, useEffect } from 'react';
import { Objective, Expense, BankAccount } from '../../types';

type SortObjectiveBy = 'date' | 'savings_low' | 'savings_high' | 'title';

interface SavingsProps {
  objectives: Objective[];
  setObjectives: React.Dispatch<React.SetStateAction<Objective[]>>;
  expenses: Expense[];
  revenuTotal: number;
  isPremium: boolean;
  setShowPremiumPrompt: (show: boolean) => void;
  currencySymbol: string;
  bankAccounts: BankAccount[];
}

import { Trash2, Pencil, Plus, Minus } from 'lucide-react';

const SavingsView: React.FC<SavingsProps> = ({ 
  objectives, 
  setObjectives, 
  expenses, 
  revenuTotal,
  isPremium,
  setShowPremiumPrompt,
  currencySymbol,
  bankAccounts
}) => {
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  
  const [contributionTarget, setContributionTarget] = useState<Objective | null>(null);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [sortByObjective, setSortByObjective] = useState<SortObjectiveBy>('date');
  
  const [customContributionJean, setCustomContributionJean] = useState('');
  const [customContributionMonique, setCustomContributionMonique] = useState('');
  const [customWithdrawalJean, setCustomWithdrawalJean] = useState('');
  const [customWithdrawalMonique, setCustomWithdrawalMonique] = useState('');

  const [objError, setObjError] = useState('');
  const [objFormData, setObjFormData] = useState({
    title: '', 
    partner: 'Jean & Monique', 
    targetAmount: '', 
    targetJeanMonthly: '',
    targetMoniqueMonthly: '',
    startDate: new Date().toISOString().slice(0, 7), 
    endDate: '',
    bankAccountId: '',
    isRecurring: false
  });

  // Sync monthly targets when total target or dates change
  useEffect(() => {
    const total = parseFloat(objFormData.targetAmount) || 0;
    const months = getMonthDiff(objFormData.startDate, objFormData.endDate);
    const monthlyTotal = total / months;
    
    if (monthlyTotal > 0) {
      // If targets are empty, initialize them 50/50
      if (!objFormData.targetJeanMonthly && !objFormData.targetMoniqueMonthly) {
        setObjFormData(prev => ({
          ...prev,
          targetJeanMonthly: (monthlyTotal / 2).toFixed(0),
          targetMoniqueMonthly: (monthlyTotal / 2).toFixed(0)
        }));
      } else {
        // If they are already set, we might want to re-validate or re-adjust
        // For now, let's just clear the error if the new total allows the current values
        const j = parseFloat(objFormData.targetJeanMonthly) || 0;
        const m = parseFloat(objFormData.targetMoniqueMonthly) || 0;
        if (j + m !== monthlyTotal) {
          // Re-adjust Monique to match the new total if Jean is set
          setObjFormData(prev => ({
            ...prev,
            targetMoniqueMonthly: Math.max(0, monthlyTotal - j).toFixed(0)
          }));
        }
        setObjError('');
      }
    }
  }, [objFormData.targetAmount, objFormData.startDate, objFormData.endDate]);

  const processedObjectives = useMemo(() => {
    let result = [...objectives];
    result.sort((a, b) => {
      switch (sortByObjective) {
        case 'date': return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'savings_low': return a.currentAmount - b.currentAmount;
        case 'savings_high': return b.currentAmount - a.currentAmount;
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });
    return result;
  }, [objectives, sortByObjective]);

  const getMonthDiff = (start: string, end: string) => {
    if (!start || !end) return 1;
    const d1 = new Date(start + "-01");
    const d2 = new Date(end + "-01");
    const months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()) + 1;
    return months <= 0 ? 1 : months;
  };

  const handleUpdateObjectiveAmount = (id: string, deltaJean: number, deltaMonique: number, reset: boolean = false) => {
    setObjectives(prev => prev.map(o => {
      if (o.id === id) {
        if (reset) return { ...o, currentAmount: 0, jeanAmount: 0, moniqueAmount: 0, realJeanMonthly: 0, realMoniqueMonthly: 0 };
        
        const currentJean = o.jeanAmount || 0;
        const currentMonique = o.moniqueAmount || 0;
        const currentRealJean = o.realJeanMonthly || 0;
        const currentRealMonique = o.realMoniqueMonthly || 0;
        
        const nextJean = Math.max(0, currentJean + deltaJean);
        const nextMonique = Math.max(0, currentMonique + deltaMonique);
        const nextTotal = Math.min(o.targetAmount, nextJean + nextMonique);

        const nextRealJean = Math.max(0, currentRealJean + deltaJean);
        const nextRealMonique = Math.max(0, currentRealMonique + deltaMonique);
        
        return { 
          ...o, 
          currentAmount: nextTotal, 
          jeanAmount: nextJean, 
          moniqueAmount: nextMonique,
          realJeanMonthly: nextRealJean,
          realMoniqueMonthly: nextRealMonique
        };
      }
      return o;
    }));
    setIsContributionModalOpen(false);
    setIsWithdrawalModalOpen(false);
    setContributionTarget(null);
    setCustomContributionJean('');
    setCustomContributionMonique('');
    setCustomWithdrawalJean('');
    setCustomWithdrawalMonique('');
  };

  const handleSaveObjective = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(objFormData.targetAmount);
    const targetJeanM = parseFloat(objFormData.targetJeanMonthly) || 0;
    const targetMoniqueM = parseFloat(objFormData.targetMoniqueMonthly) || 0;

    const newObjectiveData = {
      ...objFormData,
      targetAmount: target,
      targetJeanMonthly: targetJeanM,
      targetMoniqueMonthly: targetMoniqueM,
      bankAccountId: objFormData.bankAccountId || (bankAccounts.length > 0 ? bankAccounts[0].id : ''),
      isRecurring: objFormData.isRecurring
    };

    if (editingObjective) {
      setObjectives(prev => prev.map(o => o.id === editingObjective.id ? { 
        ...o, 
        ...newObjectiveData
      } : o));
    } else {
      setObjectives(prev => [...prev, { 
        id: Date.now().toString(), 
        currentAmount: 0, 
        jeanAmount: 0, 
        moniqueAmount: 0, 
        realJeanMonthly: 0,
        realMoniqueMonthly: 0,
        ...newObjectiveData
      }]);
    }
    setIsObjectiveModalOpen(false);
    setEditingObjective(null);
  };

  const handleDeleteObjective = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet objectif ?')) {
      setObjectives(prev => prev.filter(o => o.id !== id));
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-gray-100 pb-10">
          <div>
            <h5 className="text-gold font-bold text-[11px] tracking-[0.4em] mb-2 uppercase">Planification Future</h5>
            <h2 className="text-3xl font-serif font-bold text-royal uppercase tracking-tight">Objectifs d'Épargne</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trier :</span>
              <select value={sortByObjective} onChange={(e) => setSortByObjective(e.target.value as SortObjectiveBy)} className="bg-white border border-gray-100 text-[11px] font-bold text-royal px-5 py-2.5 rounded-sm outline-none shadow-sm focus:ring-1 focus:ring-gold">
                <option value="date">DATE</option>
                <option value="savings_low">MONTANT (↑)</option>
                <option value="savings_high">MONTANT (↓)</option>
                <option value="title">A-Z</option>
              </select>
            </div>
            {!isPremium && objectives.length >= 2 ? (
              <button 
                onClick={() => setShowPremiumPrompt(true)} 
                className="gold-gradient px-10 py-5 rounded-sm text-white font-bold text-xs tracking-[0.25em] uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                🔒 DÉBLOQUER PLUS D'OBJECTIFS (PREMIUM)
              </button>
            ) : (
              <button 
                onClick={() => { 
                  setEditingObjective(null); 
                  setObjError('');
                  setObjFormData({ 
                    title: '', 
                    partner: 'Jean & Monique', 
                    targetAmount: '', 
                    targetJeanMonthly: '', 
                    targetMoniqueMonthly: '', 
                    startDate: new Date().toISOString().slice(0, 7), 
                    endDate: '',
                    bankAccountId: bankAccounts.length > 0 ? bankAccounts[0].id : '',
                    isRecurring: false
                  }); 
                  setIsObjectiveModalOpen(true); 
                }} 
                className="gold-gradient px-10 py-5 rounded-sm text-white font-bold text-xs tracking-[0.25em] uppercase shadow-xl hover:scale-105 transition-all"
              >
                NOUVEL OBJECTIF
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {processedObjectives.map(o => {
            const progress = (o.currentAmount / o.targetAmount) * 100;
            const months = getMonthDiff(o.startDate, o.endDate);
            const remaining = o.targetAmount - o.currentAmount;
            const perMonth = remaining / months;
            const isFinished = o.currentAmount >= o.targetAmount;
            const isPaidThisMonth = ((o.realJeanMonthly || 0) + (o.realMoniqueMonthly || 0)) > 0;

            // Use stored target monthly amounts if available, otherwise fallback to calculation
            const totalMonthlyTarget = o.targetAmount / months;
            let targetJeanM = o.targetJeanMonthly ?? 0;
            let targetMoniqueM = o.targetMoniqueMonthly ?? 0;
            
            // Fallback for older data where these fields might be missing or both zero
            if (targetJeanM === 0 && targetMoniqueM === 0) {
              if (o.partner === 'Jean') {
                targetJeanM = totalMonthlyTarget;
              } else if (o.partner === 'Monique') {
                targetMoniqueM = totalMonthlyTarget;
              } else {
                targetJeanM = totalMonthlyTarget / 2;
                targetMoniqueM = totalMonthlyTarget / 2;
              }
            }

            return (
              <div key={o.id} className={`group bg-white p-10 rounded-sm shadow-soft border-2 transition-all relative overflow-hidden ${isFinished ? 'border-royal shadow-premium' : isPaidThisMonth ? 'border-green-500 shadow-premium' : 'border-gray-100 hover:border-gold/30'}`}>
                {isFinished ? (
                  <div className="absolute top-0 right-0 bg-royal text-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest rounded-bl-sm">
                    Complété
                  </div>
                ) : isPaidThisMonth ? (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest rounded-bl-sm">
                    Payé ce mois
                  </div>
                ) : null}
                
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-bgGray text-[10px] font-bold text-royal uppercase tracking-widest rounded-full border border-gray-100">{o.partner}</span>
                      {o.isRecurring && (
                        <span className="px-3 py-1 bg-royal/10 text-royal text-[9px] font-bold uppercase tracking-widest rounded-sm border border-royal/10 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          Récurrent
                        </span>
                      )}
                    </div>
                    <h4 className="text-3xl font-serif font-bold text-royal mt-2 uppercase tracking-tight">{o.title}</h4>
                    {o.bankAccountId && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {bankAccounts.find(b => b.id === o.bankAccountId)?.name || 'Compte Inconnu'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (o.isRecurring && !isPremium) {
                        setShowPremiumPrompt(true);
                        return;
                      }
                      setEditingObjective(o);
                      setObjError('');
                      setObjFormData({ 
                        title: o.title, 
                        partner: o.partner, 
                        targetAmount: o.targetAmount.toString(), 
                        targetJeanMonthly: (o.targetJeanMonthly || 0).toString(),
                        targetMoniqueMonthly: (o.targetMoniqueMonthly || 0).toString(),
                        startDate: o.startDate, 
                        endDate: o.endDate,
                        bankAccountId: o.bankAccountId || '',
                        isRecurring: o.isRecurring || false
                      });
                      setIsObjectiveModalOpen(true);
                    }} className={`text-gray-400 hover:text-gold p-2 transition-colors bg-bgGray rounded-sm ${o.isRecurring && !isPremium ? 'opacity-50' : ''}`}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => {
                      if (o.isRecurring && !isPremium) {
                        setShowPremiumPrompt(true);
                        return;
                      }
                      handleDeleteObjective(o.id);
                    }} className={`text-gray-400 hover:text-red-500 p-2 transition-colors bg-bgGray rounded-sm ${o.isRecurring && !isPremium ? 'opacity-50' : ''}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-widest">
                    <span>Progression Actuelle</span>
                    <span>{o.currentAmount.toFixed(0)}{currencySymbol} / {o.targetAmount.toFixed(0)}{currencySymbol}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-royal uppercase mb-2 tracking-widest">
                    <span>Jean: {o.jeanAmount?.toFixed(0) || 0}{currencySymbol}</span>
                    <span>Monique: {o.moniqueAmount?.toFixed(0) || 0}{currencySymbol}</span>
                  </div>
                  <div className="w-full h-3 bg-bgGray rounded-full overflow-hidden border border-gray-100 shadow-inner">
                    <div className={`h-full transition-all duration-1000 ${isFinished ? 'bg-royal' : 'gold-gradient'}`} style={{ width: `${Math.min(100, progress)}%` }}></div>
                  </div>
                </div>

                {/* Monthly Breakdown Table */}
                <div className="border border-gray-100 rounded-sm overflow-hidden mb-8">
                  <div className="bg-bgGray/50 py-2 border-b border-gray-100 text-center">
                    <span className="text-[10px] font-bold text-royal uppercase tracking-widest">Montant Mensuel</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="border-r border-gray-100">
                      <div className="p-4 text-center border-b border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montant Ciblé (M)</p>
                        <p className="text-xl font-serif font-bold text-royal">{totalMonthlyTarget.toFixed(0)}{currencySymbol}</p>
                      </div>
                      <div className="grid grid-cols-2 text-center p-2">
                        <div>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Jean</p>
                          <p className="text-[11px] font-bold text-royal">{targetJeanM.toFixed(0)}{currencySymbol}</p>
                        </div>
                        <div className="border-l border-gray-50">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Monique</p>
                          <p className="text-[11px] font-bold text-royal">{targetMoniqueM.toFixed(0)}{currencySymbol}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="p-4 text-center border-b border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montant Réel (M)</p>
                        <p className="text-xl font-serif font-bold text-royal">{( (o.realJeanMonthly || 0) + (o.realMoniqueMonthly || 0) ).toFixed(0)}{currencySymbol}</p>
                      </div>
                      <div className="grid grid-cols-2 text-center p-2">
                        <div>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Jean</p>
                          <p className="text-[11px] font-bold text-royal">{o.realJeanMonthly?.toFixed(0) || 0}{currencySymbol}</p>
                        </div>
                        <div className="border-l border-gray-50">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Monique</p>
                          <p className="text-[11px] font-bold text-royal">{o.realMoniqueMonthly?.toFixed(0) || 0}{currencySymbol}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-bgGray/80 p-6 rounded-sm border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Date Échéance</p>
                    <p className="text-lg font-serif font-bold text-royal uppercase tracking-tight">{o.endDate}</p>
                  </div>
                  <div className="bg-bgGray/80 p-6 rounded-sm border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Épargne Requise / Mois</p>
                    <p className="text-lg font-serif font-bold text-royal uppercase tracking-tight">{isFinished ? 'ATTEINT' : `${perMonth.toFixed(2)} ${currencySymbol}`}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => { setContributionTarget(o); setIsWithdrawalModalOpen(true); }} className="flex-1 py-4 border-2 border-gray-200 text-xs font-bold text-gray-400 hover:bg-bgGray rounded-sm transition-all uppercase tracking-[0.2em]">RETIRER / RESET</button>
                  <button 
                    onClick={() => { setContributionTarget(o); setIsContributionModalOpen(true); }} 
                    className={`flex-1 py-4 text-xs font-bold tracking-[0.2em] uppercase shadow-lg rounded-sm transition-all ${isPaidThisMonth ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-royal text-white hover:bg-gold'}`}
                  >
                    CONTRIBUER RÉEL
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {isWithdrawalModalOpen && contributionTarget && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md animate-fadeIn" onClick={() => setIsWithdrawalModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-sm shadow-premium border-t-8 border-red-500 p-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-serif font-bold text-royal mb-8 uppercase text-center tracking-widest">Retirer</h3>
            <div className="space-y-6">
              <button onClick={() => handleUpdateObjectiveAmount(contributionTarget.id, 0, 0, true)} className="w-full py-4 border-2 border-red-100 text-red-600 text-xs font-bold tracking-[0.2em] uppercase hover:bg-red-50 rounded-sm transition-all">REMETTRE À ZÉRO</button>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={customWithdrawalJean} onChange={e => setCustomWithdrawalJean(e.target.value)} placeholder={`Jean (${currencySymbol})`} className="w-full px-4 py-3 bg-bgGray border border-gray-200 text-sm font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                <input type="number" value={customWithdrawalMonique} onChange={e => setCustomWithdrawalMonique(e.target.value)} placeholder={`Monique (${currencySymbol})`} className="w-full px-4 py-3 bg-bgGray border border-gray-200 text-sm font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
              </div>
              <button onClick={() => handleUpdateObjectiveAmount(contributionTarget.id, -parseFloat(customWithdrawalJean || '0'), -parseFloat(customWithdrawalMonique || '0'))} className="w-full py-4 bg-red-500 text-white text-xs font-bold uppercase rounded-sm shadow-md tracking-widest">VALIDER</button>
              <button onClick={() => setIsWithdrawalModalOpen(false)} className="w-full py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-royal transition-colors">ANNULER</button>
            </div>
          </div>
        </div>
      )}

      {isContributionModalOpen && contributionTarget && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md animate-fadeIn" onClick={() => setIsContributionModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-sm shadow-premium border-t-8 border-gold p-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-serif font-bold text-royal mb-8 uppercase text-center tracking-widest">Contribuer</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={customContributionJean} onChange={e => setCustomContributionJean(e.target.value)} placeholder={`Jean (${currencySymbol})`} className="w-full px-4 py-3 bg-bgGray border border-gray-200 text-sm font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                <input type="number" value={customContributionMonique} onChange={e => setCustomContributionMonique(e.target.value)} placeholder={`Monique (${currencySymbol})`} className="w-full px-4 py-3 bg-bgGray border border-gray-200 text-sm font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
              </div>
              <button onClick={() => handleUpdateObjectiveAmount(contributionTarget.id, parseFloat(customContributionJean || '0'), parseFloat(customContributionMonique || '0'))} className="w-full py-4 gold-gradient text-white text-xs font-bold uppercase rounded-sm shadow-md tracking-widest">VALIDER</button>
              <button onClick={() => setIsContributionModalOpen(false)} className="w-full py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-royal transition-colors">ANNULER</button>
            </div>
          </div>
        </div>
      )}

      {isObjectiveModalOpen && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md animate-fadeIn" onClick={() => setIsObjectiveModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-sm shadow-premium border-t-8 border-gold p-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-serif font-bold text-royal mb-8 text-center uppercase tracking-widest">{editingObjective ? 'Modifier' : 'Nouvel objectif'}</h3>
            <form onSubmit={handleSaveObjective} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Titre</label>
                <input required type="text" value={objFormData.title} onChange={e => setObjFormData({...objFormData, title: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-base text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cible Totale ({currencySymbol})</label>
                  <input required type="number" value={objFormData.targetAmount} onChange={e => setObjFormData({...objFormData, targetAmount: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-base font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Partenaire</label>
                  <select value={objFormData.partner} onChange={e => setObjFormData({...objFormData, partner: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-sm text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all">
                    <option>Jean</option>
                    <option>Monique</option>
                    <option>Jean & Monique</option>
                  </select>
                </div>
              </div>

              {/* Monthly Target Split */}
              <div className="bg-bgGray/50 p-6 rounded-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-[10px] font-bold text-royal uppercase tracking-widest">Répartition Mensuelle</span>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
                    Cible: {(parseFloat(objFormData.targetAmount) / getMonthDiff(objFormData.startDate, objFormData.endDate) || 0).toFixed(0)}{currencySymbol}/mois
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jean ({currencySymbol})</label>
                    <input 
                      type="number" 
                      value={objFormData.targetJeanMonthly} 
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        const total = parseFloat(objFormData.targetAmount) / getMonthDiff(objFormData.startDate, objFormData.endDate) || 0;
                        if (val > total && total > 0) {
                          setObjError(`Le montant ne peut pas dépasser la cible mensuelle de ${total.toFixed(0)}${currencySymbol}`);
                          return;
                        }
                        setObjError('');
                        setObjFormData({
                          ...objFormData, 
                          targetJeanMonthly: e.target.value,
                          targetMoniqueMonthly: total > 0 ? Math.max(0, total - val).toFixed(0) : objFormData.targetMoniqueMonthly
                        });
                      }} 
                      className={`w-full px-4 py-3 bg-white border ${objError ? 'border-red-500' : 'border-gray-100'} text-sm font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold outline-none`} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monique ({currencySymbol})</label>
                    <input 
                      type="number" 
                      value={objFormData.targetMoniqueMonthly} 
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        const total = parseFloat(objFormData.targetAmount) / getMonthDiff(objFormData.startDate, objFormData.endDate) || 0;
                        if (val > total && total > 0) {
                          setObjError(`Le montant ne peut pas dépasser la cible mensuelle de ${total.toFixed(0)}${currencySymbol}`);
                          return;
                        }
                        setObjError('');
                        setObjFormData({
                          ...objFormData, 
                          targetMoniqueMonthly: e.target.value,
                          targetJeanMonthly: total > 0 ? Math.max(0, total - val).toFixed(0) : objFormData.targetJeanMonthly
                        });
                      }} 
                      className={`w-full px-4 py-3 bg-white border ${objError ? 'border-red-500' : 'border-gray-100'} text-sm font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold outline-none`} 
                    />
                  </div>
                </div>
                {objError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight text-center">{objError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Début</label>
                  <input required type="month" value={objFormData.startDate} onChange={e => setObjFormData({...objFormData, startDate: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-sm text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fin</label>
                  <input required type="month" value={objFormData.endDate} onChange={e => setObjFormData({...objFormData, endDate: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-sm text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Compte Bancaire Associé</label>
                <select 
                  value={objFormData.bankAccountId} 
                  onChange={e => setObjFormData({...objFormData, bankAccountId: e.target.value})} 
                  className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-sm text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all"
                >
                  <option value="">Sélectionner un compte...</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between p-4 bg-bgGray rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-royal uppercase tracking-widest">Épargne Récurrente</span>
                  {!isPremium && <span className="text-gold text-xs">🔒</span>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPremium) {
                      setShowPremiumPrompt(true);
                      return;
                    }
                    setObjFormData({ ...objFormData, isRecurring: !objFormData.isRecurring });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    objFormData.isRecurring ? 'bg-royal' : 'bg-gray-200'
                  } ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`${
                      objFormData.isRecurring ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              <div className="pt-6 space-y-4">
                <button type="submit" className="w-full py-5 gold-gradient text-white font-bold uppercase tracking-[0.3em] shadow-xl rounded-sm active:scale-95 transition-transform text-sm">SAUVEGARDER</button>
                <button type="button" onClick={() => setIsObjectiveModalOpen(false)} className="w-full py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-royal transition-colors">ANNULER</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsView;
