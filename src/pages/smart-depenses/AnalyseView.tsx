import React, { useState, useMemo } from 'react';
import { Expense, Objective, FinanceConfig } from '../../types';
import { BarChart3, TrendingUp, Search, FileText, Sparkles } from 'lucide-react';
import BilanDuMois from '../../components/BilanDuMois';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

interface AnalyseProps {
  expenses: Expense[];
  financeConfig: FinanceConfig;
  objectives: Objective[];
  selectedMonth: string;
  setSelectedMonth?: (month: string) => void;
  isPremium: boolean;
  setShowPremiumPrompt: (show: boolean) => void;
  currencySymbol: string;
  filterCategory?: string;
  sortBy?: 'date' | 'title';
}

type TabType = 'charts' | 'leaks' | 'report';

const DataChartsComponent: React.FC<AnalyseProps> = ({ expenses, financeConfig, objectives, selectedMonth, currencySymbol, filterCategory, sortBy }) => {
  // Filtrage pour le mois sélectionné (incluant les récurrents)
  const analyzedExpenses = useMemo(() => {
    const safeMonth = selectedMonth || new Date().toISOString().substring(0, 7);
    let result = expenses.filter(e => {
      const expenseMonth = e.date.substring(0, 7);
      if (e.isRecurring) {
        const endMonth = e.endDate ? e.endDate.substring(0, 7) : '9999-12';
        return safeMonth >= expenseMonth && safeMonth <= endMonth;
      }
      return expenseMonth === safeMonth;
    });

    if (filterCategory && filterCategory !== 'Toutes') {
      result = result.filter(e => e.category === filterCategory);
    }

    if (sortBy) {
      result.sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
          return a.description.localeCompare(b.description);
        }
      });
    }

    return result;
  }, [expenses, selectedMonth, filterCategory, sortBy]);

  const totalSpent = useMemo(() => analyzedExpenses.reduce((acc, curr) => acc + curr.amount, 0), [analyzedExpenses]);
  const revenuTotal = financeConfig.jeanContribution + financeConfig.moniqueContribution;
  const revenuFoyerTotal = (financeConfig.jeanSalary || 0) + (financeConfig.moniqueSalary || 0);
  const economieMensuelle = revenuTotal - totalSpent;
  
  // Calcul des pourcentages d'économie
  const economyFoyerPercent = revenuFoyerTotal > 0 ? Math.round(((revenuFoyerTotal - totalSpent) / revenuFoyerTotal) * 100) : 0;
  const economyIncomePercent = revenuTotal > 0 ? Math.round(((revenuTotal - totalSpent) / revenuTotal) * 100) : 0;

  // Calculs pour le graphique circulaire de contribution
  const jeanPercent = revenuTotal > 0 ? (financeConfig.jeanContribution / revenuTotal) * 100 : 50;
  const moniquePercent = 100 - jeanPercent;

  // Hauteurs relatives pour les graphiques à barres (max 100%)
  const maxHeight = 160; 
  const getFoyerBarHeights = () => {
    const maxVal = Math.max(revenuFoyerTotal, totalSpent, 1);
    return {
      foyer: (revenuFoyerTotal / maxVal) * maxHeight,
      spent: (totalSpent / maxVal) * maxHeight
    };
  };

  const getIncomeBarHeights = () => {
    const maxVal = Math.max(revenuTotal, totalSpent, 1);
    return {
      income: (revenuTotal / maxVal) * maxHeight,
      spent: (totalSpent / maxVal) * maxHeight
    };
  };

  const foyerBars = getFoyerBarHeights();
  const incomeBars = getIncomeBarHeights();

  return (
    <div className="space-y-16 animate-fadeIn pb-12">
      
      {/* 0. SECTION PERFORMANCE DU MOIS */}
      <section>
        <h3 className="text-xl font-bold text-royal tracking-widest uppercase mb-8 flex items-center gap-4">
          Performance du Mois
          <span className={`w-3 h-3 rounded-full ${economieMensuelle >= 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-sm shadow-soft border-b-8 border-royal transition-transform hover:scale-[1.02]">
            <p className="text-sm font-bold text-gold uppercase tracking-[0.3em] mb-4">BUDGET CIBLÉ</p>
            <p className="text-6xl font-serif font-bold text-gold">{revenuTotal.toFixed(0)}{currencySymbol}</p>
          </div>
          <div className="bg-white p-10 rounded-sm shadow-soft border-b-8 border-gold transition-transform hover:scale-[1.02]">
            <p className="text-sm font-bold text-gold uppercase tracking-[0.3em] mb-4">DÉPENSES MENSUELLES</p>
            <p className="text-6xl font-serif font-bold text-gold">{totalSpent.toFixed(0)}{currencySymbol}</p>
          </div>
          <div className="bg-white p-10 rounded-sm shadow-soft border-b-8 border-royal transition-transform hover:scale-[1.02]">
            <p className="text-sm font-bold text-gold uppercase tracking-[0.3em] mb-4">ÉCONOMIES</p>
            <p className="text-6xl font-serif font-bold text-gold">{economieMensuelle.toFixed(0)}{currencySymbol}</p>
          </div>
        </div>
      </section>

      {/* 1. SECTION GRAPHIQUES DE PERFORMANCE */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Graphique 1: REVENU DE FOYER VS DÉPENSES */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-8 md:p-10 rounded-sm shadow-premium border border-gray-100 w-full flex flex-col items-center">
            <div className="flex items-end justify-center gap-8 h-[200px] w-full border-b-2 border-royal/10 mb-8 px-4">
              <div className="flex flex-col items-center gap-2 group">
                <div 
                  className="w-14 md:w-16 bg-[#D4AF37] rounded-t-sm shadow-lg transition-all duration-1000 group-hover:brightness-110" 
                  style={{ height: `${foyerBars.foyer}px` }}
                ></div>
                <span className="text-[9px] font-bold text-gold uppercase tracking-tighter">{revenuFoyerTotal.toFixed(0)}{currencySymbol}</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div 
                  className="w-14 md:w-16 bg-[#ef4444] rounded-t-sm shadow-lg transition-all duration-1000 group-hover:brightness-110" 
                  style={{ height: `${foyerBars.spent}px` }}
                ></div>
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">{totalSpent.toFixed(0)}{currencySymbol}</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="border-2 border-gold p-3 text-center bg-gold/5">
                <h5 className="text-[10px] md:text-[11px] font-bold text-royal uppercase tracking-widest">
                  REVENU DE FOYER VS DÉPENSES MENSUELLES
                </h5>
              </div>
              <div className="border-2 border-gold p-2 w-3/4 mx-auto text-center">
                <h6 className="text-[12px] md:text-[14px] font-bold text-royal uppercase tracking-tight">
                  ÉCONOMIE <span className="text-gold font-serif italic text-lg ml-2">{economyFoyerPercent}%</span>
                </h6>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique 2: BUDGET CIBLÉ VS DÉPENSES */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-8 md:p-10 rounded-sm shadow-premium border border-gray-100 w-full flex flex-col items-center">
            <div className="flex items-end justify-center gap-8 h-[200px] w-full border-b-2 border-royal/10 mb-8 px-4">
              <div className="flex flex-col items-center gap-2 group">
                <div 
                  className="w-14 md:w-16 bg-[#1f4e79] rounded-t-sm shadow-lg transition-all duration-1000 group-hover:brightness-110" 
                  style={{ height: `${incomeBars.income}px` }}
                ></div>
                <span className="text-[9px] font-bold text-royal uppercase tracking-tighter">{revenuTotal.toFixed(0)}{currencySymbol}</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div 
                  className="w-14 md:w-16 bg-[#ef4444] rounded-t-sm shadow-lg transition-all duration-1000 group-hover:brightness-110" 
                  style={{ height: `${incomeBars.spent}px` }}
                ></div>
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">{totalSpent.toFixed(0)}{currencySymbol}</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="border-2 border-gold p-3 text-center bg-gold/5">
                <h5 className="text-[10px] md:text-[11px] font-bold text-royal uppercase tracking-widest">
                  BUDGET CIBLÉ VS DÉPENSES MENSUELLES
                </h5>
              </div>
              <div className="border-2 border-gold p-2 w-3/4 mx-auto text-center">
                <h6 className="text-[12px] md:text-[14px] font-bold text-royal uppercase tracking-tight">
                  ÉCONOMIE <span className="text-gold font-serif italic text-lg ml-2">{economyIncomePercent}%</span>
                </h6>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION CONTRIBUTION */}
      <section className="bg-white p-10 md:p-12 rounded-sm shadow-premium border border-gray-100">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Graphique Donut */}
          <div className="relative w-64 h-64 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.915"
                fill="transparent"
                stroke="#D4AF37"
                strokeWidth="4"
                strokeDasharray={`${jeanPercent} ${100 - jeanPercent}`}
                className="transition-all duration-1000"
              />
              <circle
                cx="18" cy="18" r="15.915"
                fill="transparent"
                stroke="#1f4e79"
                strokeWidth="4"
                strokeDasharray={`${moniquePercent} ${100 - moniquePercent}`}
                strokeDashoffset={-jeanPercent}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">REVENU TOTAL</span>
              <span className="text-2xl font-serif font-bold text-royal mt-1">{revenuTotal.toFixed(0)}{currencySymbol}</span>
            </div>
          </div>

          {/* Légende et Détails Contribution */}
          <div className="flex-grow space-y-8 w-full">
            <div>
              <p className="text-xl font-serif font-bold text-royal uppercase tracking-tight mb-1">Répartition des revenus mensuels planifiés</p>
              <p className="text-sm text-gray-500 font-light italic">Pour le foyer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-bgGray rounded-sm border-l-4 border-gold shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-royal uppercase tracking-widest">Jean</span>
                  <span className="text-lg font-serif font-bold text-royal">{financeConfig.jeanContribution.toFixed(0)}{currencySymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Part du budget</span>
                  <span className="text-sm font-bold text-gold">{jeanPercent.toFixed(0)}%</span>
                </div>
              </div>

              <div className="p-6 bg-bgGray rounded-sm border-l-4 border-royal shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-royal uppercase tracking-widest">Monique</span>
                  <span className="text-lg font-serif font-bold text-royal">{financeConfig.moniqueContribution.toFixed(0)}{currencySymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Part du budget</span>
                  <span className="text-sm font-bold text-royal">{moniquePercent.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ANALYSE DÉTAILLÉE PAR CATÉGORIE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 bg-white p-10 rounded-sm shadow-premium border border-gray-100">
          <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-10 border-b border-gray-50 pb-4">Poids des catégories de dépenses</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(Object.entries(
              analyzedExpenses.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
              }, {} as Record<string, number>)
            ) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([cat, val]) => (
              <div key={cat} className="p-5 bg-bgGray/50 rounded-sm border border-gray-100 hover:border-gold/30 transition-colors group">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-2 group-hover:text-gold">{cat}</span>
                <span className="text-lg font-bold text-royal">{val.toFixed(0)}{currencySymbol}</span>
                <div className="w-full h-1 bg-gray-200 mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-gold/50" style={{ width: `${(val / (totalSpent || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-royal p-10 rounded-sm shadow-premium flex flex-col justify-center text-center">
          <h4 className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase mb-6">Épargne Globale</h4>
          <div className="text-5xl font-serif font-bold text-gold mb-6">
            {(revenuTotal - totalSpent).toFixed(0)}{currencySymbol}
          </div>
          <p className="text-sm text-white/70 italic leading-relaxed px-4">
            "Chaque euro économisé ensemble est une brique posée sur l'édifice de vos futurs projets."
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gold/50"></div>
          </div>
        </section>
      </div>

    </div>
  );
};


const LeaksComponent: React.FC<{ expenses: Expense[]; selectedMonth: string; currencySymbol: string; filterCategory?: string }> = ({ expenses, selectedMonth, currencySymbol, filterCategory }) => {
  const alerts = useMemo(() => {
    const safeMonth = selectedMonth || new Date().toISOString().substring(0, 7);
    const [year, month] = safeMonth.split('-').map(Number);
    const currentDate = new Date(year, month - 1);
    
    // Helper to get month string YYYY-MM
    const getMonthStr = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const prevMonthDate = new Date(year, month - 2);
    const prevMonthStr = getMonthStr(prevMonthDate);
    
    const last3MonthsDates = [
      new Date(year, month - 2),
      new Date(year, month - 3),
      new Date(year, month - 4)
    ];
    const last3MonthsStrs = last3MonthsDates.map(getMonthStr);

    const filterByMonth = (monthStr: string) => {
      let result = expenses.filter(e => {
        const expenseMonth = e.date.substring(0, 7);
        if (e.isRecurring) {
          const endMonth = e.endDate ? e.endDate.substring(0, 7) : '9999-12';
          return monthStr >= expenseMonth && monthStr <= endMonth;
        }
        return expenseMonth === monthStr;
      });

      if (filterCategory && filterCategory !== 'Toutes') {
        result = result.filter(e => e.category === filterCategory);
      }
      return result;
    };

    const currentMonthExpenses = filterByMonth(safeMonth);
    const prevMonthExpenses = filterByMonth(prevMonthStr);
    const last3MonthsExpenses = expenses.filter(e => {
      const expenseMonth = e.date.substring(0, 7);
      return last3MonthsStrs.some(m => {
        if (e.isRecurring) {
          const endMonth = e.endDate ? e.endDate.substring(0, 7) : '9999-12';
          return m >= expenseMonth && m <= endMonth;
        }
        return expenseMonth === m;
      });
    });

    const foundAlerts: { type: 'creep' | 'spike'; title: string; description: string; amount: number; diff: number; category?: string }[] = [];

    // 1. Price Creep on Subscriptions
    const currentRecurring = currentMonthExpenses.filter(e => e.isRecurring);
    const prevRecurring = prevMonthExpenses.filter(e => e.isRecurring);

    currentRecurring.forEach(curr => {
      const prev = prevRecurring.find(p => p.description === curr.description && p.category === curr.category);
      if (prev && curr.amount > prev.amount) {
        foundAlerts.push({
          type: 'creep',
          title: `Augmentation : ${curr.description}`,
          description: `Votre abonnement a augmenté de ${(curr.amount - prev.amount).toFixed(2)}${currencySymbol} par rapport au mois dernier.`,
          amount: curr.amount,
          diff: curr.amount - prev.amount
        });
      }
    });

    // 2. Category Spike Detection
    const categories = [...new Set(expenses.map(e => e.category))];
    const now = new Date();
    const isCurrentMonth = safeMonth === getMonthStr(now);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = now.getDate();

    categories.forEach(cat => {
      if (!cat) return;
      const catCurrent = currentMonthExpenses.filter(e => e.category === cat && !e.isRecurring);
      const catLast3 = last3MonthsExpenses.filter(e => e.category === cat && !e.isRecurring);

      const currentTotal = catCurrent.reduce((acc, curr) => acc + curr.amount, 0);
      const avgLast3 = catLast3.reduce((acc, curr) => acc + curr.amount, 0) / 3;

      if (avgLast3 > 0) {
        let projected = currentTotal;
        if (isCurrentMonth && today < daysInMonth) {
          projected = (currentTotal / today) * daysInMonth;
        }

        const increasePercent = ((projected - avgLast3) / avgLast3) * 100;
        if (increasePercent > 15) {
          foundAlerts.push({
            type: 'spike',
            title: `Pic de dépense : ${cat}`,
            description: `Les dépenses en ${cat} sont ${increasePercent.toFixed(0)}% plus élevées que votre moyenne habituelle.`,
            amount: projected,
            diff: increasePercent,
            category: cat as string
          });
        }
      }
    });

    return foundAlerts;
  }, [expenses, selectedMonth]);

  return (
    <div className="space-y-10 animate-fadeIn max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-serif font-bold text-royal uppercase tracking-tight">Détection des Fuites Financières</h3>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto italic">
          Notre algorithme analyse vos habitudes pour identifier les augmentations de prix et les comportements de dépenses inhabituels.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white p-16 rounded-sm shadow-soft border border-dashed border-gray-200 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-emerald-500" />
          </div>
          <h4 className="text-xl font-serif font-bold text-royal mb-2 uppercase tracking-tight">Aucune fuite détectée</h4>
          <p className="text-gray-400">Félicitations ! Vos dépenses sont stables et conformes à vos habitudes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((alert, idx) => (
            <div key={idx} className="bg-white p-8 rounded-sm shadow-premium border-l-4 border-red-500 flex gap-6 items-start group hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 bg-red-50 rounded-full flex-shrink-0 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${alert.type === 'creep' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                    {alert.type === 'creep' ? 'ABONNEMENT' : 'ALERTE CATÉGORIE'}
                  </span>
                </div>
                <h4 className="text-lg font-serif font-bold text-royal uppercase tracking-tight">{alert.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{alert.description}</p>
                <div className="pt-4 flex items-center gap-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Impact :</div>
                  <div className="text-lg font-bold text-red-500">
                    {alert.type === 'creep' ? `+${alert.diff.toFixed(2)}${currencySymbol}` : `+${alert.diff.toFixed(0)}%`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-royal p-10 rounded-sm shadow-premium text-center">
        <h5 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.4em] mb-4">Conseil d'Expert</h5>
        <p className="text-white/80 text-lg font-serif italic max-w-2xl mx-auto">
          "Pensez à réviser vos abonnements tous les 6 mois. Une petite augmentation de 5${currencySymbol} peut sembler négligeable, mais cumulée sur plusieurs services, elle peut représenter des centaines de ${currencySymbol === '€' ? 'd\'euros' : currencySymbol} par an."
        </p>
      </div>
    </div>
  );
};

const AnalyseView: React.FC<AnalyseProps> = ({ 
  expenses, 
  financeConfig, 
  objectives, 
  selectedMonth,
  setSelectedMonth,
  isPremium,
  setShowPremiumPrompt,
  currencySymbol
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('charts');
  const [showBilan, setShowBilan] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Toutes');
  const [sortBy, setBy] = useState<'date' | 'title'>('date');

  const categories = [
    'Toutes', 
    'LOYER', 
    'ELECTRICITÉ/GAZ', 
    'ESSENCE', 
    'EAU', 
    'INTERNET', 
    'ABBONNEMENTS', 
    'COURSES', 
    'SANTÉ', 
    'TRANSPORT', 
    'BESOIN DES ENFANTS', 
    'PRÊTS', 
    'INVESTISSEMENTS', 
    'DIVERTISSEMENT'
  ];

  const monthOptions = useMemo(() => {
    const options = [];
    const startYear = 2026;
    const now = new Date();
    const endYear = now.getFullYear() + 1;

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const value = `${year}-${String(month).padStart(2, '0')}`;
        const label = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        options.push({ value, label });
        if (year === endYear && month === now.getMonth() + 1) break;
      }
    }
    return options.reverse();
  }, []);

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-10 bg-white rounded-sm shadow-premium border border-gray-100 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-8">
          <BarChart3 className="w-10 h-10 text-gold" />
        </div>
        <h3 className="text-3xl font-serif font-bold text-royal mb-4 uppercase tracking-tight">Analyse Premium</h3>
        <p className="text-gray-400 max-w-md leading-relaxed mb-10 italic">
          Visualisez vos habitudes de dépenses et vos bilans mensuels avec nos outils d'analyse avancés.
        </p>
        <button 
          onClick={() => setShowPremiumPrompt(true)}
          className="px-12 py-4 bg-royal text-white font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all duration-500 shadow-xl flex items-center gap-3"
        >
          <span>DÉCOUVRIR PREMIUM</span>
          <Sparkles className="w-4 h-4 text-gold" />
        </button>
        <p className="mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Cette section est réservée aux membres Premium.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'charts', label: 'Graphiques de Données', icon: BarChart3 },
    { id: 'leaks', label: 'Détection des Fuites', icon: Search },
    { id: 'report', label: 'Le Bilan du Mois', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'charts':
        return <DataChartsComponent expenses={expenses} financeConfig={financeConfig} objectives={objectives} selectedMonth={selectedMonth} isPremium={isPremium} setShowPremiumPrompt={setShowPremiumPrompt} currencySymbol={currencySymbol} filterCategory={filterCategory} sortBy={sortBy} />;
      case 'leaks':
        return <LeaksComponent expenses={expenses} selectedMonth={selectedMonth} currencySymbol={currencySymbol} filterCategory={filterCategory} />;
      case 'report':
        return (
          <div className="flex flex-col items-center justify-center py-20 px-10 bg-royal rounded-sm shadow-premium text-center text-white">
            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
              <Sparkles className="w-10 h-10 text-gold" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-gold mb-4 uppercase tracking-widest">Votre Bilan Privé</h3>
            <p className="text-white/60 max-w-md leading-relaxed mb-10 italic">
              Découvrez votre mois en chiffres avec une expérience immersive conçue exclusivement pour les membres du Sanctuaire.
            </p>
            <button 
              onClick={() => setShowBilan(true)}
              className="px-12 py-4 bg-gold text-royal font-bold uppercase tracking-[0.3em] hover:bg-white transition-all duration-500 shadow-soft"
            >
              Lancer l'Expérience
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {showBilan && (
        <BilanDuMois 
          expenses={expenses} 
          financeConfig={financeConfig} 
          objectives={objectives} 
          selectedMonth={selectedMonth}
          currencySymbol={currencySymbol}
          onClose={() => setShowBilan(false)} 
        />
      )}
      {/* Month, Filter and Sort Section */}
      <div className="flex flex-wrap items-center gap-6 bg-bgGray/50 p-6 rounded-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mois :</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth?.(e.target.value)} 
            className="bg-white border border-gray-100 text-[11px] font-bold text-royal px-4 py-2 rounded-sm outline-none shadow-sm focus:ring-1 focus:ring-gold"
          >
            {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filtrer :</span>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white border border-gray-100 text-[11px] font-bold text-royal px-4 py-2 rounded-sm outline-none shadow-sm focus:ring-1 focus:ring-gold">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trier :</span>
          <div className="flex bg-white rounded-sm shadow-sm p-1 border border-gray-100">
            <button onClick={() => setBy('date')} className={`px-5 py-2 text-[10px] font-bold rounded-sm transition-colors ${sortBy === 'date' ? 'bg-royal text-white shadow-sm' : 'text-gray-400'}`}>DATE</button>
            <button onClick={() => setBy('title')} className={`px-5 py-2 text-[10px] font-bold rounded-sm transition-colors ${sortBy === 'title' ? 'bg-royal text-white shadow-sm' : 'text-gray-400'}`}>A-Z</button>
          </div>
        </div>
      </div>

      {/* Sleek Navigation Menu */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 border-b border-gray-100 pb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? 'bg-royal text-white shadow-lg scale-105'
                  : 'bg-white text-gray-400 hover:text-royal hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-gray-300'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Render Area */}
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AnalyseView;
