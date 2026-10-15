import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, FinanceCategory } from './MobileTypes';
import { translations, translateCategory, translateExpenseDesc } from './translations';

interface MobileFinancesProps {
  onBack: () => void;
  tab: 'dashboard' | 'expenses' | 'debts' | 'analysis';
  setTab: (tab: 'dashboard' | 'expenses' | 'debts' | 'analysis') => void;
  budget: number;
  setBudget: (val: number) => void;
  florianContribution: number;
  setFlorianContribution: (val: number) => void;
  shopieContribution: number;
  setShopieContribution: (val: number) => void;
  expenses: Expense[];
  setExpenses: (val: Expense[]) => void;
  financeCategories: FinanceCategory[];
  setFinanceCategories: (val: FinanceCategory[]) => void;
  lang?: 'fr' | 'en';
}

const MobileFinances: React.FC<MobileFinancesProps> = ({
  onBack,
  tab: financeTab,
  setTab: setFinanceTab,
  budget,
  setBudget,
  florianContribution,
  setFlorianContribution,
  shopieContribution,
  setShopieContribution,
  expenses,
  setExpenses,
  financeCategories,
  setFinanceCategories,
  lang = 'fr'
}) => {
  const t = translations[lang || 'fr'];
  const [hasAcceptedDettesDisclaimer, setHasAcceptedDettesDisclaimer] = useState(() => {
    return localStorage.getItem('hideDettesDisclaimer') === 'true';
  });
  
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseModalStep, setExpenseModalStep] = useState(1);
  
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpCat, setNewExpCat] = useState('Courses');
  const [newExpOwner, setNewExpOwner] = useState<'Florian' | 'Shopie' | 'Both'>('Florian');
  const [newExpAmtFlorian, setNewExpAmtFlorian] = useState(0);
  const [newExpAmtShopie, setNewExpAmtShopie] = useState(0);
  const [newExpIsRecurrent, setNewExpIsRecurrent] = useState(false);
  const [newExpDate, setNewExpDate] = useState(new Date().toISOString().split('T')[0]);

  const [isAddingFinanceCategory, setIsAddingFinanceCategory] = useState(false);
  const [newFinanceCatName, setNewFinanceCatName] = useState('');

  const [selectedFinanceMonth, setSelectedFinanceMonth] = useState(new Date().getMonth());
  const [financeSortBy, setFinanceSortBy] = useState<'date' | 'name'>('date');

  const FrenchMonths = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const EnglishMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonths = lang === 'fr' ? FrenchMonths : EnglishMonths;

  const [isAddingDebtBalance, setIsAddingDebtBalance] = useState(false);
  const [debtBalances, setDebtBalances] = useState([
    { id: 'debt-1', month: lang === 'fr' ? 'Avril' : 'April', florianOwes: 0, shopieOwes: 0, settled: true }
  ]);
  const [newDebt, setNewDebt] = useState({ month: currentMonths[new Date().getMonth()], florianOwes: 0, shopieOwes: 0 });

  // Calculations
  const filteredExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.date);
    const expMonth = expenseDate.getMonth();
    if (exp.rec) return expMonth <= selectedFinanceMonth;
    return expMonth === selectedFinanceMonth;
  });

  const groupedExpenses = useMemo(() => {
    const groups: { [key: string]: { desc: string, cat: string, date: string, rec: boolean, florianAmt: number, shopieAmt: number, entries: string[] } } = {};
    
    filteredExpenses.forEach(exp => {
      const key = `${exp.desc}-${exp.date}-${exp.cat}-${exp.rec}`;
      if (!groups[key]) {
        groups[key] = {
          desc: exp.desc,
          cat: exp.cat,
          date: exp.date,
          rec: exp.rec,
          florianAmt: 0,
          shopieAmt: 0,
          entries: []
        };
      }
      if (exp.owner === 'Florian') groups[key].florianAmt += exp.amt;
      if (exp.owner === 'Shopie') groups[key].shopieAmt += exp.amt;
      groups[key].entries.push(exp.id);
    });
    
    return Object.values(groups).sort((a, b) => {
      if (financeSortBy === 'name') return a.desc.localeCompare(b.desc);
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [filteredExpenses, financeSortBy]);

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amt, 0);
  
  const florianExpenses = filteredExpenses.filter(e => e.owner === 'Florian').reduce((sum, exp) => sum + exp.amt, 0);
  const shopieExpenses = filteredExpenses.filter(e => e.owner === 'Shopie').reduce((sum, exp) => sum + exp.amt, 0);
  const totalOwnerExpenses = florianExpenses + shopieExpenses;
  
  const florianExpPercent = totalOwnerExpenses > 0 ? Math.round((florianExpenses / totalOwnerExpenses) * 100) : 0;
  const shopieExpPercent = totalOwnerExpenses > 0 ? Math.round((shopieExpenses / totalOwnerExpenses) * 100) : 0;

  const florianSavings = florianContribution - florianExpenses;
  const shopieSavings = shopieContribution - shopieExpenses;
  const totalOwnerSavings = florianSavings + shopieSavings;

  const florianSavingsPercent = totalOwnerSavings > 0 ? Math.round((florianSavings / totalOwnerSavings) * 100) : 0;
  const shopieSavingsPercent = totalOwnerSavings > 0 ? Math.round((shopieSavings / totalOwnerSavings) * 100) : 0;

  return (
    <motion.div
      key={`finances-${financeTab}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col no-scrollbar"
    >
      {/* Finance Header */}
      <div className="px-6 pt-4 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="text-royal">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h1 className="text-2xl font-serif font-bold text-royal">{t.tabFinances}</h1>
        </div>

        {/* Finance Navigation */}
        <div className="flex justify-between border-b-2 border-gold/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'expenses', label: lang === 'fr' ? 'Dépenses' : 'Expenses' },
            { id: 'debts', label: lang === 'fr' ? 'Dettes' : 'Debts' },
            { id: 'analysis', label: lang === 'fr' ? 'Analyse' : 'Analysis' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFinanceTab(tab.id as any)}
              className={`pb-3 px-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                financeTab === tab.id ? 'border-gold text-gold font-extrabold' : 'border-transparent text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Finance Content */}
      <div className="flex-grow px-6 pb-8 overflow-y-auto no-scrollbar">
        {financeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Budget Ciblé */}
            <div className="bg-white border-2 border-gold p-6 rounded-2xl shadow-soft relative group">
              <button 
                onClick={() => setIsEditingBudget(!isEditingBudget)}
                className="absolute top-4 right-4 text-gray-300 hover:text-gold transition-colors"
              >
                <i className="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-bold text-royal uppercase tracking-widest">{t.finTargetBudget}</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                  <i className="fa-solid fa-repeat text-[8px] text-gold"></i>
                  <span className="text-[8px] font-bold text-gold uppercase tracking-widest">
                    {lang === 'fr' ? 'Récurrent' : 'Recurring'}
                  </span>
                </div>
              </div>
              {isEditingBudget ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={budget} 
                    onChange={(e) => setBudget(Number(e.target.value))}
                    onBlur={() => setIsEditingBudget(false)}
                    autoFocus
                    className="text-2xl font-serif font-bold text-royal border-b-2 border-gold outline-none w-32 lining-nums"
                  />
                  <span className="text-base font-bold text-gold">€</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-royal lining-nums">{budget}</span>
                  <span className="text-lg font-bold text-gold">€</span>
                </div>
              )}
            </div>

            {/* Repartition */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                {lang === 'fr' ? 'Répartition' : 'Allocation'}
              </h3>
              
              {/* Florian */}
              <div className="bg-white border-2 border-gold p-6 rounded-2xl shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-royal/10 flex items-center justify-center">
                      <i className="fa-solid fa-user text-royal text-xs"></i>
                    </div>
                    <span className="text-[12px] font-bold text-royal uppercase tracking-widest">Florian</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                    <i className="fa-solid fa-repeat text-[8px] text-gold"></i>
                    <span className="text-[8px] font-bold text-gold uppercase tracking-widest">
                      {lang === 'fr' ? 'Récurrent' : 'Recurring'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={florianContribution} 
                    onChange={(e) => setFlorianContribution(Number(e.target.value))}
                    className="text-2xl font-serif font-bold text-royal border-b-2 border-gold focus:border-gold outline-none w-24 transition-all lining-nums"
                  />
                  <span className="text-base font-bold text-gold">€</span>
                </div>
              </div>

              {/* Shopie */}
              <div className="bg-white border-2 border-gold p-6 rounded-2xl shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                      <i className="fa-solid fa-user text-gold text-xs"></i>
                    </div>
                    <span className="text-[12px] font-bold text-royal uppercase tracking-widest">Shopie</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                    <i className="fa-solid fa-repeat text-[8px] text-gold"></i>
                    <span className="text-[8px] font-bold text-gold uppercase tracking-widest">
                      {lang === 'fr' ? 'Récurrent' : 'Recurring'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={shopieContribution} 
                    onChange={(e) => setShopieContribution(Number(e.target.value))}
                    className="text-2xl font-serif font-bold text-royal border-b-2 border-gold focus:border-gold outline-none w-24 transition-all lining-nums"
                  />
                  <span className="text-base font-bold text-gold">€</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {financeTab === 'expenses' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {lang === 'fr' ? 'Filtres et Tris' : 'Filters & Sorting'}
                </h3>
                <button 
                  onClick={() => setIsAddingExpense(true)}
                  className="w-10 h-10 bg-royal text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <select 
                    value={selectedFinanceMonth}
                    onChange={(e) => setSelectedFinanceMonth(Number(e.target.value))}
                    className="w-full bg-white border-2 border-gold rounded-xl px-4 py-3 text-[10px] font-bold text-royal uppercase tracking-widest outline-none appearance-none"
                  >
                    {currentMonths.map((month, idx) => (
                      <option key={month} value={idx}>{month}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-gold pointer-events-none"></i>
                </div>
                <div className="flex-1 relative">
                  <select 
                    value={financeSortBy}
                    onChange={(e) => setFinanceSortBy(e.target.value as any)}
                    className="w-full bg-white border-2 border-gold rounded-xl px-4 py-3 text-[10px] font-bold text-royal uppercase tracking-widest outline-none appearance-none"
                  >
                    <option value="date">{lang === 'fr' ? 'Trier: Date' : 'Sort: Date'}</option>
                    <option value="name">{lang === 'fr' ? 'Trier: A-Z' : 'Sort: A-Z'}</option>
                  </select>
                  <i className="fa-solid fa-arrow-up-wide-short absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-gold pointer-events-none"></i>
                </div>
              </div>
            </div>

            <div className="space-y-0 border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-soft">
              {/* Header Row */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b-2 border-gray-200">
                <span className="text-[10px] font-bold text-royal uppercase tracking-widest flex-1">Transaction</span>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest w-20 text-right">Florian</span>
                  <span className="text-[10px] font-bold text-royal uppercase tracking-widest w-20 text-right">Shopie</span>
                  <div className="w-6"></div> {/* Spacer for trash icon */}
                </div>
              </div>

              {groupedExpenses.length > 0 ? (
                groupedExpenses.map((group, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <div className="flex flex-col flex-1 gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-royal leading-tight">
                          {translateExpenseDesc(group.desc, lang)}
                        </span>
                        {group.rec && <i className="fa-solid fa-repeat text-[8px] text-gold"></i>}
                      </div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest">
                        {translateCategory(group.cat, lang)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-1/2 justify-end">
                      <span className="text-[11px] font-bold text-gold w-20 text-right lining-nums">{group.florianAmt.toFixed(2)}€</span>
                      <span className="text-[11px] font-bold text-royal w-20 text-right lining-nums">{group.shopieAmt.toFixed(2)}€</span>
                      
                      <button 
                        onClick={() => setExpenses(expenses.filter(e => !group.entries.includes(e.id)))}
                        className="w-6 h-6 flex items-center justify-center text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-white">
                  <i className="fa-solid fa-receipt text-gray-100 text-4xl mb-4"></i>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {lang === 'fr' ? 'Aucune dépense pour ce mois' : 'No expenses for this month'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {financeTab === 'debts' && (
          <div className="h-full animate-fadeIn">
            {!hasAcceptedDettesDisclaimer ? (
              <div className="bg-white border-2 border-gold p-8 rounded-[40px] shadow-soft text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>
                <div className="w-16 h-16 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <i className="fa-solid fa-heart text-gold text-2xl animate-pulse"></i>
                </div>
                
                <div className="space-y-6 mb-10 text-center">
                  <p className="text-[11px] text-royal font-medium leading-relaxed uppercase tracking-wider text-justify px-2">
                    {lang === 'fr' 
                      ? "Notre objectif est de vous accompagner dans la gestion financière. Cependant, n'oubliez jamais que la relation avec votre partenaire a bien plus de valeur que l'argent. Par conséquent, soyez flexible dans la gestion des dettes avec votre partenaire."
                      : "Our goal is to support you in your financial management. However, never forget that your relationship with your partner has much more value than money. Therefore, be flexible when managing debts with your partner."}
                  </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => setHasAcceptedDettesDisclaimer(true)}
                    className="w-full py-5 bg-royal text-white font-bold uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:bg-gold transition-all text-[10px]"
                  >
                    {lang === 'fr' ? 'Continuer' : 'Continue'}
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.setItem('hideDettesDisclaimer', 'true');
                      setHasAcceptedDettesDisclaimer(true);
                    }}
                    className="w-full py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-gold transition-colors"
                  >
                    {lang === 'fr' ? 'Ne plus afficher ce message' : "Don't show this message again"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fadeIn">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gold/20">
                        <th className="py-4 text-[9px] font-bold text-gold uppercase tracking-widest">
                          {lang === 'fr' ? 'Mois' : 'Month'} <i className="fa-solid fa-chevron-down ml-1 text-[7px]"></i>
                        </th>
                        <th className="py-4 text-[9px] font-bold uppercase tracking-widest">
                          <span className="text-royal">Florian</span> <span className="text-gold">{lang === 'fr' ? 'doit' : 'owes'}</span> <span className="text-royal">Shopie</span>
                        </th>
                        <th className="py-4 text-[9px] font-bold uppercase tracking-widest">
                          <span className="text-royal">Shopie</span> <span className="text-gold">{lang === 'fr' ? 'doit' : 'owes'}</span> <span className="text-royal">Florian</span>
                        </th>
                        <th className="py-4 text-[9px] font-bold text-gold uppercase tracking-widest text-center">
                          {lang === 'fr' ? 'Réglement' : 'Settle'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {debtBalances.map(debt => (
                        <tr key={debt.id} className="border-b border-gold/10">
                          <td className="py-5 text-[11px] font-bold text-royal">
                            {debt.month === 'Avril' && lang === 'en' ? 'April' : debt.month}
                          </td>
                          <td className="py-5 text-[11px] font-bold text-royal lining-nums">{debt.florianOwes}€</td>
                          <td className="py-5 text-[11px] font-bold text-royal lining-nums">{debt.shopieOwes}€</td>
                          <td className="py-5 text-center">
                            <button 
                              onClick={() => setDebtBalances(debtBalances.map(d => d.id === debt.id ? { ...d, settled: !d.settled } : d))}
                              className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto shadow-sm transition-all ${debt.settled ? 'bg-royal' : 'bg-gold/10 border-2 border-gold/20'}`}
                            >
                              <i className={`fa-solid fa-check text-white text-[10px] ${debt.settled ? 'opacity-100' : 'opacity-0'}`}></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isAddingDebtBalance ? (
                  <div className="bg-bgGray p-6 rounded-2xl border-2 border-gold space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'fr' ? 'Mois' : 'Month'}</label>
                        <input 
                          type="text" 
                          value={newDebt.month}
                          onChange={e => setNewDebt({ ...newDebt, month: e.target.value })}
                          className="w-full bg-white border-2 border-gold/20 rounded-lg px-3 py-2 text-[11px] outline-none font-bold text-royal focus:border-gold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'fr' ? 'Florian doit' : 'Florian owes'}</label>
                        <input 
                          type="number" 
                          value={newDebt.florianOwes}
                          onChange={e => setNewDebt({ ...newDebt, florianOwes: Number(e.target.value) })}
                          className="w-full bg-white border-2 border-gold/20 rounded-lg px-3 py-2 text-[11px] outline-none font-bold text-royal focus:border-gold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'fr' ? 'Shopie doit' : 'Shopie owes'}</label>
                        <input 
                          type="number" 
                          value={newDebt.shopieOwes}
                          onChange={e => setNewDebt({ ...newDebt, shopieOwes: Number(e.target.value) })}
                          className="w-full bg-white border-2 border-gold/20 rounded-lg px-3 py-2 text-[11px] outline-none font-bold text-royal focus:border-gold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setIsAddingDebtBalance(false)}
                        className="flex-1 py-3 bg-white border-2 border-gold/20 text-royal/40 text-[10px] font-bold uppercase tracking-widest rounded-xl"
                      >
                        {t.finCancel}
                      </button>
                      <button 
                        onClick={() => {
                          setDebtBalances([...debtBalances, { ...newDebt, id: Date.now().toString(), settled: false }]);
                          setIsAddingDebtBalance(false);
                        }}
                        className="flex-1 py-3 bg-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-md"
                      >
                        {lang === 'fr' ? 'Ajouter' : 'Add'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingDebtBalance(true)}
                    className="w-full py-5 border-2 border-gold text-royal font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-gold/5 transition-all text-xs"
                  >
                    {lang === 'fr' ? 'Nouvel Equilibre +' : 'New Balance +'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {financeTab === 'analysis' && (
          <div key="analysis-view" className="space-y-12 animate-fadeIn pb-10">
            {/* Chart 1: Budget vs Dépenses */}
            <div className="space-y-6">
              <div className="bg-white border-2 border-gold p-6 rounded-3xl shadow-soft">
                <div className="h-56 relative mb-6 border-b-2 border-gold/20">
                  {/* Budget Bar */}
                  <div className="absolute bottom-0 left-[15%] w-16 flex flex-col items-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 160 }}
                      transition={{ duration: 1, ease: "backOut" }}
                      className="w-full bg-[#2ECC71] rounded-t-xl shadow-sm"
                    ></motion.div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-3">Budget</span>
                  </div>
                  {/* Expenses Bar */}
                  <div className="absolute bottom-0 right-[15%] w-16 flex flex-col items-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: Math.max(10, (totalExpenses / budget) * 160) }}
                      transition={{ duration: 1, ease: "backOut", delay: 0.2 }}
                      className="w-full bg-[#E74C3C] rounded-t-xl shadow-sm"
                    ></motion.div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-3">
                      {lang === 'fr' ? 'Dépenses' : 'Expenses'}
                    </span>
                  </div>
                </div>
                <h4 className="text-[11px] font-bold text-royal text-center uppercase tracking-widest mb-6 leading-tight">
                  {lang === 'fr' ? 'Budget Ciblé vs Dépenses mensuelles' : 'Target Budget vs Monthly Expenses'}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-bgGray p-3 rounded-xl text-center border-2 border-gold/10">
                    <span className="block text-[8px] font-bold text-gray-400 uppercase mb-1">
                      {lang === 'fr' ? 'Économie' : 'Savings'}
                    </span>
                    <span className="text-[12px] font-bold text-royal lining-nums">{(budget - totalExpenses).toLocaleString()}€</span>
                  </div>
                  <div className="bg-bgGray p-3 rounded-xl text-center border-2 border-gold/10">
                    <span className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Status</span>
                    <span className={`text-[12px] font-bold lining-nums ${budget - totalExpenses > 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
                      {Math.abs(Math.round(((budget - totalExpenses) / budget) * 100))}%
                    </span>
                  </div>
                  <div className="bg-bgGray p-3 rounded-xl text-center border-2 border-gold/10">
                    <span className="block text-[8px] font-bold text-gray-400 uppercase mb-1">
                      {lang === 'fr' ? 'Mois' : 'Month'}
                    </span>
                    <span className="text-[12px] font-bold text-royal">{currentMonths[selectedFinanceMonth]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Dépenses mensuelles breakdown */}
            <div className="space-y-6">
              <div className="bg-white border-2 border-gold p-6 rounded-3xl shadow-soft">
                <div className="h-56 relative mb-6 border-b-2 border-gold/20">
                  {/* Florian Bar */}
                  <div className="absolute bottom-0 left-[15%] w-16 flex flex-col items-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: Math.max(10, (florianExpenses / totalOwnerExpenses) * 160) }}
                      transition={{ duration: 1, ease: "backOut" }}
                      className="w-full bg-gold rounded-t-xl shadow-sm"
                    ></motion.div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-3">Florian</span>
                  </div>
                  {/* Shopie Bar */}
                  <div className="absolute bottom-0 right-[15%] w-16 flex flex-col items-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: Math.max(10, (shopieExpenses / totalOwnerExpenses) * 160) }}
                      transition={{ duration: 1, ease: "backOut", delay: 0.2 }}
                      className="w-full bg-royal rounded-t-xl shadow-sm"
                    ></motion.div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-3">Shopie</span>
                  </div>
                </div>
                <h4 className="text-[11px] font-bold text-royal text-center uppercase tracking-widest mb-6">
                  {lang === 'fr' ? 'Dépenses mensuelles' : 'Monthly Expenses'}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-bgGray border-2 border-gold/10 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-royal uppercase">Florian</span>
                    <div className="flex gap-4">
                      <span className="text-[10px] font-bold text-royal lining-nums">{florianExpenses.toLocaleString()}€</span>
                      <span className="text-[10px] font-bold text-gold lining-nums">{florianExpPercent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-bgGray border-2 border-gold/10 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-royal uppercase">Shopie</span>
                    <div className="flex gap-4">
                      <span className="text-[10px] font-bold text-royal lining-nums">{shopieExpenses.toLocaleString()}€</span>
                      <span className="text-[10px] font-bold text-royal/40 lining-nums">{shopieExpPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Économie mensuelles breakdown */}
            <div className="space-y-6">
              <div className="bg-white border-2 border-gold p-6 rounded-3xl shadow-soft">
                <div className="h-56 relative mb-6 border-b-2 border-gold/20">
                  {/* Florian Bar */}
                  <div className="absolute bottom-0 left-[15%] w-16 flex flex-col items-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: Math.max(10, (florianSavings / totalOwnerSavings) * 160) }}
                      transition={{ duration: 1, ease: "backOut" }}
                      className="w-full bg-gold rounded-t-xl shadow-sm"
                    ></motion.div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-3">Florian</span>
                  </div>
                  {/* Shopie Bar */}
                  <div className="absolute bottom-0 right-[15%] w-16 flex flex-col items-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: Math.max(10, (shopieSavings / totalOwnerSavings) * 160) }}
                      transition={{ duration: 1, ease: "backOut", delay: 0.2 }}
                      className="w-full bg-royal rounded-t-xl shadow-sm"
                    ></motion.div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-3">Shopie</span>
                  </div>
                </div>
                <h4 className="text-[11px] font-bold text-royal text-center uppercase tracking-widest mb-6">
                  {lang === 'fr' ? 'Économies mensuelles' : 'Monthly Savings'}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-bgGray border-2 border-gold/10 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-royal uppercase">Florian</span>
                    <div className="flex gap-4">
                      <span className="text-[10px] font-bold text-royal lining-nums">{florianSavings.toLocaleString()}€</span>
                      <span className="text-[10px] font-bold text-gold lining-nums">{florianSavingsPercent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-bgGray border-2 border-gold/10 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-royal uppercase">Shopie</span>
                    <div className="flex gap-4">
                      <span className="text-[10px] font-bold text-royal lining-nums">{shopieSavings.toLocaleString()}€</span>
                      <span className="text-[10px] font-bold text-royal/40 lining-nums">{shopieSavingsPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isAddingExpense && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[2000] bg-royal/40 backdrop-blur-sm flex items-end"
              onClick={() => { setIsAddingExpense(false); setExpenseModalStep(1); }}
            >
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="w-full bg-white rounded-t-[40px] p-8 shadow-premium border-t-4 border-gold"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
                {expenseModalStep === 1 ? (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest mb-2">
                        {lang === 'fr' ? 'Nouvelle Transaction' : 'New Transaction'}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {lang === 'fr' ? 'ÉTAPE 1: CATÉGORIE & NOM' : 'STEP 1: CATEGORY & NAME'}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {financeCategories.map(cat => (
                        <button key={cat.id} onClick={() => setNewExpCat(cat.name)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${newExpCat === cat.name ? 'bg-gold shadow-lg scale-105' : 'bg-bgGray border-2 border-transparent'}`}>
                          <div className={`w-8 h-8 rounded-lg ${newExpCat === cat.name ? 'bg-white text-gold' : cat.color + ' text-white'} flex items-center justify-center text-xs shadow-sm`}><i className={`fa-solid ${cat.icon}`}></i></div>
                          <span className={`text-[8px] font-bold uppercase tracking-tighter text-center ${newExpCat === cat.name ? 'text-white' : 'text-royal/60'}`}>
                            {translateCategory(cat.name, lang)}
                          </span>
                        </button>
                      ))}
                      <button onClick={() => setIsAddingFinanceCategory(true)} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-bgGray border-2 border-dashed border-gold hover:bg-gold/5 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs shadow-sm text-gold"><i className="fa-solid fa-plus"></i></div>
                        <span className="text-[8px] font-bold uppercase tracking-tighter text-center text-gold">
                          {lang === 'fr' ? 'Ajouter' : 'Add'}
                        </span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        {lang === 'fr' ? 'NOM DE LA TRANSACTION' : 'TRANSACTION NAME'}
                      </label>
                      <input type="text" value={newExpDesc} onChange={(e) => setNewExpDesc(e.target.value)} placeholder={lang === 'fr' ? "Ex: Courses Carrefour" : "E.g: Groceries"} className="w-full px-6 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-sm text-royal outline-none focus:border-gold transition-all font-bold"/>
                    </div>
                    <button onClick={() => setExpenseModalStep(2)} disabled={!newExpCat || !newExpDesc} className={`w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl ${(!newExpCat || !newExpDesc) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gold text-white hover:bg-royal'}`}>
                      {lang === 'fr' ? 'CONTINUER' : 'CONTINUE'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest mb-2">
                        {lang === 'fr' ? 'Paiement & Montant' : 'Payment & Amount'}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {lang === 'fr' ? 'ÉTAPE 2: QUI & COMBIEN' : 'STEP 2: WHO & HOW MUCH'}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        {lang === 'fr' ? 'DATE DE LA TRANSACTION' : 'TRANSACTION DATE'}
                      </label>
                      <input type="date" value={newExpDate} onChange={(e) => setNewExpDate(e.target.value)} className="w-full px-6 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-sm text-royal outline-none focus:border-gold transition-all font-bold"/>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        {lang === 'fr' ? 'RESPONSABLE' : 'RESPONSIBLE'}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Florian', 'Shopie', 'Both'].map((owner) => (
                          <button key={owner} onClick={() => setNewExpOwner(owner as any)} className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${newExpOwner === owner ? 'bg-royal text-white shadow-md' : 'bg-bgGray text-royal/40'}`}>
                            {owner === 'Both' ? (lang === 'fr' ? 'Les deux' : 'Both') : owner}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {(newExpOwner === 'Florian' || newExpOwner === 'Both') && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                            {lang === 'fr' ? 'MONTANT JEAN' : 'JEAN AMOUNT'}
                          </label>
                          <div className="relative">
                            <input type="number" value={newExpAmtFlorian || ''} onChange={(e) => setNewExpAmtFlorian(Number(e.target.value))} className="w-full px-4 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-xs text-royal outline-none font-bold"/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gold">€</span>
                          </div>
                        </div>
                      )}
                      {(newExpOwner === 'Shopie' || newExpOwner === 'Both') && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                            {lang === 'fr' ? 'MONTANT MONIQUE' : 'MONIQUE AMOUNT'}
                          </label>
                          <div className="relative">
                            <input type="number" value={newExpAmtShopie || ''} onChange={(e) => setNewExpAmtShopie(Number(e.target.value))} className="w-full px-4 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-xs text-royal outline-none font-bold"/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gold">€</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        {lang === 'fr' ? 'RÉCURRENCE' : 'RECURRENCE'}
                      </label>
                      <button onClick={() => setNewExpIsRecurrent(!newExpIsRecurrent)} className={`w-full py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${newExpIsRecurrent ? 'bg-gold text-white shadow-md' : 'bg-bgGray text-royal/40'}`}>
                        <i className="fa-solid fa-repeat"></i>
                        {newExpIsRecurrent ? (lang === 'fr' ? 'Chaque mois' : 'Monthly') : (lang === 'fr' ? 'Une seule fois' : 'One-time')}
                      </button>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button onClick={() => setExpenseModalStep(1)} className="flex-1 py-4 border-2 border-gold/20 text-royal/40 text-[10px] font-bold uppercase tracking-widest rounded-2xl">
                        {lang === 'fr' ? 'RETOUR' : 'BACK'}
                      </button>
                      <button onClick={() => {
                        if (newExpDesc && (newExpAmtFlorian > 0 || newExpAmtShopie > 0)) {
                          const id = Date.now().toString();
                          const newEntries: Expense[] = [];
                          if (newExpOwner === 'Florian' || newExpOwner === 'Both') {
                             if (newExpAmtFlorian > 0) newEntries.push({ id: id + '-j', desc: newExpDesc, cat: newExpCat, amt: newExpAmtFlorian, rec: newExpIsRecurrent, owner: 'Florian', date: newExpDate });
                          }
                          if (newExpOwner === 'Shopie' || newExpOwner === 'Both') {
                             if (newExpAmtShopie > 0) newEntries.push({ id: id + '-m', desc: newExpDesc, cat: newExpCat, amt: newExpAmtShopie, rec: newExpIsRecurrent, owner: 'Shopie', date: newExpDate });
                          }
                          setExpenses([...expenses, ...newEntries]);
                          setIsAddingExpense(false);
                          setExpenseModalStep(1);
                          setNewExpDesc('');
                        }
                      }} className="flex-1 py-4 bg-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl">
                        {lang === 'fr' ? 'VALIDER' : 'CONFIRM'}
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={() => { setIsAddingExpense(false); setExpenseModalStep(1); }} className="w-full mt-6 py-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-royal transition-colors text-center">
                  {t.finCancel}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAddingFinanceCategory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[4000] bg-royal/80 backdrop-blur-md flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl border-4 border-gold">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><i className="fa-solid fa-folder-plus text-gold text-2xl"></i></div>
                  <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest">
                    {lang === 'fr' ? 'Zone' : 'Category'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.tabFinances}</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      {lang === 'fr' ? 'NOM DE LA Zone' : 'CATEGORY NAME'}
                    </label>
                    <input type="text" value={newFinanceCatName} onChange={(e) => setNewFinanceCatName(e.target.value)} placeholder={lang === 'fr' ? "Ex: Santé, Mariage..." : "E.g: Health, Wedding..."} className="w-full px-6 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-sm text-royal outline-none focus:border-gold transition-all font-bold"/>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setIsAddingFinanceCategory(false)} className="flex-1 py-4 border-2 border-gold/20 text-royal/40 text-[10px] font-bold uppercase tracking-widest rounded-2xl">
                      {t.finCancel}
                    </button>
                    <button onClick={() => {
                        if (newFinanceCatName.trim()) {
                          const newCat: FinanceCategory = { id: Date.now().toString(), name: newFinanceCatName, icon: 'fa-tag', color: 'bg-gold' };
                          setFinanceCategories([...financeCategories, newCat]);
                          setNewFinanceCatName('');
                          setIsAddingFinanceCategory(false);
                        }
                    }} className="flex-1 py-4 bg-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-lg">
                      {lang === 'fr' ? 'AJOUTER' : 'ADD'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MobileFinances;
