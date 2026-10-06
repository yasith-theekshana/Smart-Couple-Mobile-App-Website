import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, History } from 'lucide-react';
import { Expense, Objective, FinanceConfig, BankAccount } from '../../types';

interface DashboardProps {
  expenses: Expense[];
  financeConfig: FinanceConfig;
  setFinanceConfig: (val: FinanceConfig) => void;
  objectives: Objective[];
  currencySymbol: string;
  isPremium: boolean;
  setShowPremiumPrompt: (show: boolean) => void;
}

const DashboardView: React.FC<DashboardProps> = ({ 
  expenses, 
  financeConfig, 
  setFinanceConfig, 
  objectives,
  currencySymbol,
  isPremium,
  setShowPremiumPrompt
}) => {
  const [configMode, setConfigMode] = useState<'salary' | 'contribution' | null>(null);
  const [tempConfig, setTempConfig] = useState<FinanceConfig>(financeConfig);

  if (!financeConfig) return null;

  const filteredExpenses = useMemo(() => {
    if (isPremium) return expenses;
    return expenses.filter(e => !e.isRecurring);
  }, [expenses, isPremium]);

  const revenuTotal = (financeConfig.jeanContribution || 0) + (financeConfig.moniqueContribution || 0);
  const revenuFoyerTotal = (financeConfig.jeanSalary || 0) + (financeConfig.moniqueSalary || 0);
  const depensesTotales = useMemo(() => filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0), [filteredExpenses]);
  const economieMensuelle = revenuTotal - depensesTotales;

  const dernieresDepenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  }, [filteredExpenses]);

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFinanceConfig(tempConfig);
    setConfigMode(null);
  };

  const Toggle = ({ active, onToggle, label, disabled }: { active: boolean, onToggle: () => void, label: string, disabled?: boolean }) => (
    <div className="flex items-center gap-3">
      <button 
        type="button"
        onClick={() => {
          if (disabled) {
            setShowPremiumPrompt(true);
            return;
          }
          onToggle();
        }}
        className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-gold shadow-sm' : 'bg-gray-200'} ${disabled ? 'opacity-50' : ''}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${active ? 'left-7' : 'left-1'}`}></div>
      </button>
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label} {disabled && '🔒'}</span>
    </div>
  );

  const ConfigModal = configMode ? createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md cursor-pointer animate-fadeIn"
      onClick={() => setConfigMode(null)}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-sm shadow-2xl border-t-8 border-gold p-12 border border-gold cursor-default transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-serif font-bold text-royal mb-10 text-center uppercase tracking-widest">
          {configMode === 'salary' ? 'Revenu du Foyer' : 'Budget Ciblé'}
        </h3>
        
        <form onSubmit={handleConfigSubmit} className="space-y-10 max-h-[70vh] overflow-y-auto px-2">
          {configMode === 'salary' && (
            <div className="space-y-6 pb-4">
              <h4 className="text-sm font-bold text-gold uppercase tracking-widest">Salaires Réels</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-royal uppercase tracking-widest ml-1">Salaire Jean ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={tempConfig.jeanSalary ?? 0} 
                    onChange={e => setTempConfig({...tempConfig, jeanSalary: parseFloat(e.target.value) || 0})}
                    className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-xl font-bold text-royal rounded-sm outline-none focus:ring-2 focus:ring-gold hover:border-gold/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-royal uppercase tracking-widest ml-1">Salaire Monique ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={tempConfig.moniqueSalary ?? 0} 
                    onChange={e => setTempConfig({...tempConfig, moniqueSalary: parseFloat(e.target.value) || 0})}
                    className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-xl font-bold text-royal rounded-sm outline-none focus:ring-2 focus:ring-gold hover:border-gold/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {configMode === 'contribution' && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gold uppercase tracking-widest">Planification des Contributions</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-royal uppercase tracking-widest ml-1">Contribution Jean ({currencySymbol})</label>
                  <Toggle 
                    active={tempConfig.jeanIsRecurring && isPremium} 
                    onToggle={() => setTempConfig({...tempConfig, jeanIsRecurring: !tempConfig.jeanIsRecurring})} 
                    label="Récurrent"
                    disabled={!isPremium}
                  />
                </div>
                <input 
                  type="number" 
                  value={tempConfig.jeanContribution ?? 0} 
                  onChange={e => setTempConfig({...tempConfig, jeanContribution: parseFloat(e.target.value) || 0})}
                  className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-xl font-bold text-royal rounded-sm outline-none focus:ring-2 focus:ring-gold hover:border-gold/50 transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-royal uppercase tracking-widest ml-1">Contribution Monique ({currencySymbol})</label>
                  <Toggle 
                    active={tempConfig.moniqueIsRecurring && isPremium} 
                    onToggle={() => setTempConfig({...tempConfig, moniqueIsRecurring: !tempConfig.moniqueIsRecurring})} 
                    label="Récurrent"
                    disabled={!isPremium}
                  />
                </div>
                <input 
                  type="number" 
                  value={tempConfig.moniqueContribution ?? 0} 
                  onChange={e => setTempConfig({...tempConfig, moniqueContribution: parseFloat(e.target.value) || 0})}
                  className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-xl font-bold text-royal rounded-sm outline-none focus:ring-2 focus:ring-gold hover:border-gold/50 transition-all"
                />
              </div>

              <div className="pt-8 border-t border-gold flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut global du foyer</span>
                  <span className="text-sm font-bold text-royal uppercase mt-1 tracking-tight">
                    {tempConfig.totalIsRecurring ? 'Revenu Stable' : 'Revenu Variable'}
                  </span>
                </div>
                <Toggle 
                  active={tempConfig.totalIsRecurring && isPremium} 
                  onToggle={() => setTempConfig({...tempConfig, totalIsRecurring: !tempConfig.totalIsRecurring})} 
                  label="Global Fixe"
                  disabled={!isPremium}
                />
              </div>
            </div>
          )}

          <div className="pt-6 flex flex-col gap-4">
            <button type="submit" className="w-full py-6 gold-gradient text-white font-bold uppercase tracking-[0.3em] shadow-xl rounded-sm active:scale-95 transition-transform text-sm">
              SAUVEGARDER
            </button>
            <button type="button" onClick={() => setConfigMode(null)} className="w-full py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-royal transition-colors">
              ANNULER
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="space-y-12 animate-fadeIn">
      {ConfigModal}

      {/* 1. Résumé (Top Stats) - Improved Visually */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenu Foyer */}
        <div className="bg-white p-6 rounded-sm shadow-soft border-l-4 border-royal flex flex-col justify-between transition-all hover:shadow-premium group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Revenu Foyer</p>
            <button 
              onClick={() => {
                setTempConfig(financeConfig);
                setConfigMode('salary');
              }} 
              className="text-gray-200 hover:text-gold transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
          </div>
          <h3 className="text-2xl font-serif font-bold text-royal">{revenuFoyerTotal.toFixed(0)} {currencySymbol}</h3>
        </div>

        {/* Budget Ciblé */}
        <div className="bg-white p-6 rounded-sm shadow-soft border-l-4 border-gold flex flex-col justify-between transition-all hover:shadow-premium group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Budget Ciblé</p>
            <button 
              onClick={() => {
                setTempConfig(financeConfig);
                setConfigMode('contribution');
              }} 
              className="text-gray-200 hover:text-gold transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
          </div>
          <h3 className="text-2xl font-serif font-bold text-royal">{revenuTotal.toFixed(0)} {currencySymbol}</h3>
        </div>

        {/* Dépenses Actuelles */}
        <div className="bg-white p-6 rounded-sm shadow-soft border-l-4 border-royal flex flex-col justify-between transition-all hover:shadow-premium">
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">Dépenses</p>
          <h3 className="text-2xl font-serif font-bold text-royal">{depensesTotales.toFixed(0)} {currencySymbol}</h3>
        </div>

        {/* Capacité d'Épargne */}
        <div className={`p-6 rounded-sm shadow-soft border-l-4 flex flex-col justify-between transition-all hover:shadow-premium ${economieMensuelle >= 0 ? 'bg-white border-green-500' : 'bg-red-50 border-red-500'}`}>
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">Épargne</p>
          <h3 className={`text-2xl font-serif font-bold ${economieMensuelle >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {economieMensuelle.toFixed(0)} {currencySymbol}
          </h3>
        </div>
      </div>
      
      {/* 2. Planification & Dernières Dépenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Planification des Revenus */}
        <div className="bg-white p-8 rounded-sm shadow-premium border border-gold/20 relative overflow-hidden group h-full">
          <h4 className="text-lg font-serif font-bold text-royal uppercase tracking-tight mb-6 border-b border-gold pb-3 relative z-10 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gold" />
            Planification
          </h4>
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-royal/70 uppercase tracking-widest">Jean</p>
                <p className="text-xl font-serif font-bold text-royal">{financeConfig.jeanContribution.toFixed(0)}{currencySymbol}</p>
              </div>
              <div className={`px-3 py-1 text-[9px] font-bold rounded-sm border ${financeConfig.jeanIsRecurring && isPremium ? 'bg-royal/10 border-royal/20 text-royal' : 'bg-gold/10 border-gold text-gold'}`}>
                {financeConfig.jeanIsRecurring && isPremium ? 'RÉCURRENT' : 'VARIABLE'}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-royal/70 uppercase tracking-widest">Monique</p>
                <p className="text-xl font-serif font-bold text-royal">{financeConfig.moniqueContribution.toFixed(0)}{currencySymbol}</p>
              </div>
              <div className={`px-3 py-1 text-[9px] font-bold rounded-sm border ${financeConfig.moniqueIsRecurring && isPremium ? 'bg-royal/10 border-royal/20 text-royal' : 'bg-gold/10 border-gold text-gold'}`}>
                {financeConfig.moniqueIsRecurring && isPremium ? 'RÉCURRENT' : 'VARIABLE'}
              </div>
            </div>
          </div>
        </div>

        {/* Dernières Dépenses */}
        <section className="bg-royal p-8 rounded-sm shadow-premium border border-royal/20 relative overflow-hidden group h-full">
          <h4 className="text-base font-serif font-bold text-white uppercase tracking-tight mb-6 border-b border-gold pb-2 relative z-10 flex items-center gap-3">
            <History className="w-5 h-5 text-gold" />
            Dernières Dépenses
          </h4>
          <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden divide-y divide-white/10 shadow-sm relative z-10">
            {dernieresDepenses.map(e => (
              <div key={e.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">{e.description}</p>
                  <p className="text-[10px] text-white/50 font-normal uppercase mt-1 tracking-tighter">{e.category} • {e.date}</p>
                </div>
                <div className="text-base font-serif font-bold text-gold">{e.amount.toFixed(0)} {currencySymbol}</div>
              </div>
            ))}
            {dernieresDepenses.length === 0 && <div className="p-8 text-center text-[10px] text-white/30 italic uppercase tracking-widest">Aucune dépense</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardView;
