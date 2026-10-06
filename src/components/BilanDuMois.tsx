import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  ChevronRight, 
  ChevronLeft, 
  X,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Zap,
  Wifi,
  HeartPulse,
  Baby,
  Gamepad2,
  CreditCard,
  Wallet
} from 'lucide-react';
import { Expense, Objective, FinanceConfig } from '../types';

interface BilanDuMoisProps {
  expenses: Expense[];
  financeConfig: FinanceConfig;
  objectives: Objective[];
  onClose: () => void;
  selectedMonth: string; // The month to recap (usually previous month)
  currencySymbol: string;
}

const categoryIcons: Record<string, any> = {
  'Alimentation': Utensils,
  'Logement': Home,
  'Transport': Car,
  'Santé': HeartPulse,
  'Loisirs': Gamepad2,
  'Courses': ShoppingBag,
  'Electricité/Gaz': Zap,
  'Internet': Wifi,
  'Besoins des enfants': Baby,
  'Dettes': CreditCard,
  'Investissements': Wallet,
  'Toutes': ShoppingBag
};

const BilanDuMois: React.FC<BilanDuMoisProps> = ({ expenses, financeConfig, objectives, onClose, selectedMonth, currencySymbol }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse selectedMonth (YYYY-MM)
  const [year, month] = selectedMonth.split('-').map(Number);
  
  // Previous month for comparison
  const prevMonthDate = new Date(year, month - 2, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // 1. Victory Logic: Savings
  const victoryData = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      const expenseMonth = e.date.substring(0, 7);
      if (e.isRecurring) {
        const endMonth = e.endDate ? e.endDate.substring(0, 7) : '9999-12';
        return selectedMonth >= expenseMonth && selectedMonth <= endMonth;
      }
      return expenseMonth === selectedMonth;
    });
    const totalSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const combinedIncome = financeConfig.jeanSalary + financeConfig.moniqueSalary;
    const savings = combinedIncome - totalSpent;
    return { savings, totalSpent, combinedIncome };
  }, [expenses, financeConfig, selectedMonth]);

  // 2. Money Pit Logic: Top Category
  const moneyPitData = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      const expenseMonth = e.date.substring(0, 7);
      if (e.isRecurring) {
        const endMonth = e.endDate ? e.endDate.substring(0, 7) : '9999-12';
        return selectedMonth >= expenseMonth && selectedMonth <= endMonth;
      }
      return expenseMonth === selectedMonth;
    });

    const categories: Record<string, { total: number; topMerchant: string; merchantMax: number }> = {};
    const merchants: Record<string, Record<string, number>> = {};

    monthExpenses.forEach(e => {
      if (!categories[e.category]) categories[e.category] = { total: 0, topMerchant: '', merchantMax: 0 };
      categories[e.category].total += e.amount;

      if (!merchants[e.category]) merchants[e.category] = {};
      merchants[e.category][e.description] = (merchants[e.category][e.description] || 0) + e.amount;
      
      if (merchants[e.category][e.description] > categories[e.category].merchantMax) {
        categories[e.category].merchantMax = merchants[e.category][e.description];
        categories[e.category].topMerchant = e.description;
      }
    });

    let topCat = '';
    let maxAmt = 0;
    Object.entries(categories).forEach(([cat, data]) => {
      if (data.total > maxAmt) {
        maxAmt = data.total;
        topCat = cat;
      }
    });

    return { 
      category: topCat, 
      amount: maxAmt, 
      merchant: categories[topCat]?.topMerchant || 'N/A',
      icon: categoryIcons[topCat] || ShoppingBag
    };
  }, [expenses, selectedMonth]);

  // 3. Habit Tracker Logic: Comparison
  const habitData = useMemo(() => {
    const getMonthTotal = (m: string, cat: string) => {
      return expenses.filter(e => {
        const expenseMonth = e.date.substring(0, 7);
        const match = e.isRecurring 
          ? (m >= expenseMonth && (!e.endDate || m <= e.endDate.substring(0, 7)))
          : (expenseMonth === m);
        return match && e.category === cat;
      }).reduce((acc, curr) => acc + curr.amount, 0);
    };

    const targetCat = 'Alimentation'; // Choosing a non-fixed category
    const currentTotal = getMonthTotal(selectedMonth, targetCat);
    const prevTotal = getMonthTotal(prevMonthStr, targetCat);
    
    const diffPercent = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
    const decreased = currentTotal < prevTotal;

    return { category: targetCat, diffPercent: Math.abs(diffPercent), decreased, currentTotal, prevTotal };
  }, [expenses, selectedMonth, prevMonthStr]);

  // 4. Progress Tracker Logic: Goals
  const progressData = useMemo(() => {
    const activeGoal = objectives[0] || null;
    if (!activeGoal) return null;

    const percent = Math.min(100, (activeGoal.currentAmount / activeGoal.targetAmount) * 100);
    return { title: activeGoal.title, percent };
  }, [objectives]);

  const slides = [
    {
      id: 'victory',
      bg: 'bg-royal',
      accent: 'text-gold',
      icon: <Trophy className="w-24 h-24 text-gold mb-8" />,
      title: "Le Sanctuaire est fier de vous !",
      content: (
        <div className="space-y-6">
          <p className="text-xl text-white/80 leading-relaxed">
            Vous avez écrasé vos objectifs et économisé
          </p>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-7xl font-serif font-bold text-gold"
          >
            {(victoryData.savings || 0).toLocaleString()} {currencySymbol}
          </motion.div>
          <p className="text-lg text-white/60 italic">ce mois-ci ! 🥳</p>
        </div>
      )
    },
    {
      id: 'pit',
      bg: 'bg-royal',
      accent: 'text-gold',
      icon: React.createElement(moneyPitData.icon, { className: "w-24 h-24 text-gold mb-8" }),
      title: "Le Gouffre Financier",
      content: (
        <div className="space-y-6">
          <p className="text-xl text-white/80 leading-relaxed">
            Votre plus grosse dépense commune ce mois-ci était :
          </p>
          <div className="text-5xl font-serif font-bold text-gold uppercase tracking-tighter">
            {moneyPitData.category}
          </div>
          <div className="text-4xl font-bold text-white">
            {(moneyPitData.amount || 0).toLocaleString()} {currencySymbol}
          </div>
          <p className="text-sm text-white/50 uppercase tracking-[0.2em]">
            Surtout chez <span className="text-white font-bold">{moneyPitData.merchant}</span>
          </p>
        </div>
      )
    },
    {
      id: 'habit',
      bg: 'bg-royal',
      accent: 'text-gold',
      icon: habitData.decreased ? <TrendingDown className="w-24 h-24 text-emerald-400 mb-8" /> : <TrendingUp className="w-24 h-24 text-gold mb-8" />,
      title: "Analyse des Habitudes",
      content: (
        <div className="space-y-6">
          <p className="text-xl text-white/80 leading-relaxed">
            Factice fun :
          </p>
          <div className="text-4xl font-serif font-bold text-white">
            Vous avez dépensé <span className={habitData.decreased ? "text-emerald-400" : "text-gold"}>{habitData.diffPercent.toFixed(0)}%</span> de {habitData.decreased ? 'moins' : 'plus'} en {habitData.category}
          </div>
          <p className="text-lg text-white/60">
            qu'au mois dernier ! {habitData.decreased ? "Bien joué le travail d'équipe ! 💪" : "On fera mieux le mois prochain ! 🚀"}
          </p>
        </div>
      )
    },
    {
      id: 'progress',
      bg: 'bg-royal',
      accent: 'text-gold',
      icon: <Target className="w-24 h-24 text-gold mb-8" />,
      title: "Vers vos Rêves",
      content: (
        <div className="space-y-8 w-full max-w-sm mx-auto">
          <p className="text-xl text-white/80 leading-relaxed text-center">
            Félicitations ! Vos économies du mois vous rapprochent de :
          </p>
          <div className="text-3xl font-serif font-bold text-gold text-center uppercase">
            '{progressData?.title || 'Vos Objectifs'}'
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressData?.percent || 0}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.5)]"
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <span>Départ</span>
              <span>{progressData?.percent.toFixed(1)}% du but</span>
              <span>Arrivée</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    else onClose();
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-royal flex items-center justify-center overflow-hidden">
      {/* Progress Bars at top */}
      <div className="absolute top-6 left-6 right-6 flex gap-2 z-50">
        {slides.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: idx < currentSlide ? '100%' : idx === currentSlide ? '100%' : '0%' }}
              transition={{ duration: idx === currentSlide ? 5 : 0.3 }}
              className="h-full bg-gold"
              onAnimationComplete={() => {
                if (idx === currentSlide && currentSlide < slides.length - 1) {
                  // Auto-advance could be here, but let's stick to manual for now
                }
              }}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={onClose}
        className="absolute top-12 right-6 z-50 p-2 text-white/50 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full h-full flex flex-col items-center justify-center p-10 text-center"
        >
          {slides[currentSlide].icon}
          <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.5em] mb-8">
            {slides[currentSlide].title}
          </h2>
          {slides[currentSlide].content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Areas */}
      <div className="absolute inset-0 flex">
        <div 
          className="w-1/2 h-full cursor-pointer" 
          onClick={prevSlide}
        />
        <div 
          className="w-1/2 h-full cursor-pointer" 
          onClick={nextSlide}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-between px-10 z-50 pointer-events-none">
        <button 
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className={`p-4 rounded-full bg-white/5 text-white pointer-events-auto transition-opacity ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="p-4 rounded-full bg-gold text-royal pointer-events-auto shadow-premium"
        >
          {currentSlide === slides.length - 1 ? <X className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>
      </div>

      {/* Background Accents */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default BilanDuMois;
