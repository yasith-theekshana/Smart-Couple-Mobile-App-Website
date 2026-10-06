import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardView from './DashboardView';
import ExpensesView from './ExpensesView';
import SavingsView from './SavingsView';
import GroceryView from './GroceryView';
import DebtsView from './DebtsView';
import AnalyseView from './AnalyseView';
import { Expense, Objective, Debt, FinanceConfig, GroceryList, BankAccount } from '../../types';

import { LayoutDashboard, ReceiptEuro, PiggyBank, ShoppingBasket, Landmark, PieChart } from 'lucide-react';
import { usePremium } from '../../context/PremiumContext';

const SmartDepenses: React.FC = () => {
  const location = useLocation();
  const { isPremium, setShowPremiumPrompt } = usePremium();
  const [currency, setCurrency] = useState(() => localStorage.getItem('smart_currency') || 'EUR');

  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrency(localStorage.getItem('smart_currency') || 'EUR');
    };
    window.addEventListener('currencyChange', handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'USD': return '$';
      case 'CHF': return 'CHF';
      default: return '€';
    }
  };

  const currencySymbol = getCurrencySymbol(currency);
  
  // Mock Data Initialization
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('smart_expenses');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: '2026-03-10', description: 'Courses Carrefour', amount: 85.50, category: 'COURSES', isRecurring: false, partner: 'Jean & Monique', jeanAmount: 42.75, moniqueAmount: 42.75 },
      { id: '2', date: '2026-03-01', description: 'Loyer', amount: 1200, category: 'LOYER', isRecurring: true, partner: 'Jean & Monique', jeanAmount: 600, moniqueAmount: 600 },
      { id: '3', date: '2026-03-12', description: 'Plein Essence', amount: 65, category: 'ESSENCE', isRecurring: false, partner: 'Jean', jeanAmount: 65, moniqueAmount: 0 },
      { id: '4', date: '2026-03-05', description: 'Facture EDF', amount: 95, category: 'ELECTRICITÉ/GAZ', isRecurring: true, partner: 'Jean & Monique', jeanAmount: 47.5, moniqueAmount: 47.5 },
      { id: '5', date: '2026-03-08', description: 'Facture Eau', amount: 40, category: 'EAU', isRecurring: true, partner: 'Jean & Monique', jeanAmount: 20, moniqueAmount: 20 },
      { id: '6', date: '2026-03-02', description: 'Abonnement Fibre', amount: 39.99, category: 'INTERNET', isRecurring: true, partner: 'Jean & Monique', jeanAmount: 20, moniqueAmount: 19.99 },
      { id: '7', date: '2026-03-15', description: 'Netflix & Spotify', amount: 25, category: 'ABBONNEMENTS', isRecurring: true, partner: 'Jean & Monique', jeanAmount: 12.5, moniqueAmount: 12.5 },
      { id: '8', date: '2026-03-18', description: 'Pharmacie', amount: 35, category: 'SANTÉ', isRecurring: false, partner: 'Monique', jeanAmount: 0, moniqueAmount: 35 },
      { id: '9', date: '2026-03-20', description: 'Pass Navigo', amount: 84.10, category: 'TRANSPORT', isRecurring: true, partner: 'Jean', jeanAmount: 84.10, moniqueAmount: 0 },
      { id: '10', date: '2026-03-22', description: 'Couches & Lait Bébé', amount: 120, category: 'BESOIN DES ENFANTS', isRecurring: false, partner: 'Jean & Monique', jeanAmount: 60, moniqueAmount: 60 },
      { id: '11', date: '2026-03-25', description: 'PEA Mensuel', amount: 200, category: 'INVESTISSEMENTS', isRecurring: true, partner: 'Jean', jeanAmount: 200, moniqueAmount: 0 },
      { id: '12', date: '2026-03-28', description: 'Cinéma & Popcorn', amount: 45, category: 'DIVERTISSEMENT', isRecurring: false, partner: 'Jean & Monique', jeanAmount: 22.5, moniqueAmount: 22.5 },
    ];
  });

  const [objectives, setObjectives] = useState<Objective[]>(() => {
    const saved = localStorage.getItem('smart_objectives');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Voyage Japon', targetAmount: 5000, currentAmount: 1200, jeanAmount: 600, moniqueAmount: 600, startDate: '2024-01', endDate: '2025-06', partner: 'Jean & Monique' },
      { id: '2', title: 'Nouvelle Voiture', targetAmount: 15000, currentAmount: 3000, jeanAmount: 3000, moniqueAmount: 0, startDate: '2023-10', endDate: '2026-12', partner: 'Jean' },
    ];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('smart_debts');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Prêt Immobilier', totalAmount: 250000, remainingAmount: 185000, monthlyPayment: 1100, endDate: '2038-12', type: 'Prêt' },
      { id: '2', title: 'Crédit Auto', totalAmount: 20000, remainingAmount: 8500, monthlyPayment: 350, endDate: '2026-05', type: 'Crédit' },
    ];
  });

  const [financeConfig, setFinanceConfig] = useState<FinanceConfig>(() => {
    const saved = localStorage.getItem('smart_finance_config');
    return saved ? JSON.parse(saved) : {
      jeanSalary: 2800,
      moniqueSalary: 2400,
      targetBudget: 3500,
      jeanContributionPercent: 50,
      moniqueContributionPercent: 50,
      jeanContribution: 1750,
      moniqueContribution: 1750,
      jeanIsRecurring: true,
      moniqueIsRecurring: true,
      totalIsRecurring: true,
      bankAccounts: [
        { id: 'main', name: 'Compte Principal', bankName: 'BNP Paribas', balance: 0, isDefault: true, syncWithSavings: true },
        { id: 'saving', name: 'Compte Épargne', bankName: 'Revolut', balance: 0, isDefault: true, syncWithSavings: true }
      ]
    };
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('smart_bank_accounts');
    if (saved) {
      const parsed = JSON.parse(saved);
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
    return financeConfig.bankAccounts?.map((acc: any) => ({
      ...acc,
      balance: acc.balance ?? 0
    })) || [
      { id: 'main', name: 'Compte Principal', bankName: 'BNP Paribas', balance: 0, isDefault: true, syncWithSavings: true },
      { id: 'saving', name: 'Compte Épargne', bankName: 'Revolut', balance: 0, isDefault: true, syncWithSavings: true }
    ];
  });

  const [groceryLists, setGroceryLists] = useState<GroceryList[]>(() => {
    const saved = localStorage.getItem('smart_grocery_lists');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Hebdomadaire', items: [
        { id: '1', name: 'Lait', price: 1.20, unit: 'L', quantity: 2, checked: false },
        { id: '2', name: 'Pain', price: 1.10, unit: 'unité', quantity: 1, checked: true },
      ]}
    ];
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Sync Bank Account Balances with Savings
  useEffect(() => {
    const savingsByAccount: { [key: string]: number } = {};
    objectives.forEach(obj => {
      const accountId = obj.bankAccountId || 'unknown';
      savingsByAccount[accountId] = (savingsByAccount[accountId] || 0) + obj.currentAmount;
    });

    setBankAccounts(prev => {
      let changed = false;
      const updated = prev.map(acc => {
        if (acc.syncWithSavings) {
          const newBalance = savingsByAccount[acc.id] || 0;
          if (acc.balance !== newBalance) {
            changed = true;
            return { ...acc, balance: newBalance };
          }
        }
        return acc;
      });
      return changed ? updated : prev;
    });
  }, [objectives]);

  // Persistence
  useEffect(() => localStorage.setItem('smart_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('smart_objectives', JSON.stringify(objectives)), [objectives]);
  useEffect(() => localStorage.setItem('smart_debts', JSON.stringify(debts)), [debts]);
  useEffect(() => localStorage.setItem('smart_finance_config', JSON.stringify(financeConfig)), [financeConfig]);
  useEffect(() => localStorage.setItem('smart_bank_accounts', JSON.stringify(bankAccounts)), [bankAccounts]);
  useEffect(() => localStorage.setItem('smart_grocery_lists', JSON.stringify(groceryLists)), [groceryLists]);

  // Sync Debts with Expenses
  useEffect(() => {
    const externalDebts = debts.filter(d => !d.isInternal);
    
    setExpenses(prev => {
      let updated = [...prev];
      let changed = false;

      // 1. Add or Update expenses for each external debt
      externalDebts.forEach(debt => {
        const existingIndex = updated.findIndex(e => e.debtId === debt.id);
        const expenseData = {
          description: `Remboursement: ${debt.title}`,
          amount: debt.monthlyPayment,
          category: 'Dettes',
          isRecurring: true,
          partner: 'Jean & Monique',
          jeanAmount: debt.monthlyPayment / 2,
          moniqueAmount: debt.monthlyPayment / 2,
          debtId: debt.id
        };

        if (existingIndex >= 0) {
          const existing = updated[existingIndex];
          if (existing.amount !== expenseData.amount || existing.description !== expenseData.description) {
            updated[existingIndex] = { ...existing, ...expenseData };
            changed = true;
          }
        } else {
          updated.push({
            id: `debt-${debt.id}`,
            date: new Date().toISOString().split('T')[0],
            ...expenseData
          });
          changed = true;
        }
      });

      // 2. Remove expenses whose debt no longer exists
      const debtIds = new Set(debts.map(d => d.id));
      const filtered = updated.filter(e => !e.debtId || debtIds.has(e.debtId));
      if (filtered.length !== updated.length) {
        updated = filtered;
        changed = true;
      }

      return changed ? updated : prev;
    });
  }, [debts]);

  // Sync Recurring Objectives with Expenses
  useEffect(() => {
    const recurringObjectives = objectives.filter(o => o.isRecurring);
    
    setExpenses(prev => {
      let updated = [...prev];
      let changed = false;

      // 1. Add or Update expenses for each recurring objective
      recurringObjectives.forEach(obj => {
        const existingIndex = updated.findIndex(e => e.objectiveId === obj.id);
        
        // Calculate monthly target
        const d1 = new Date(obj.startDate + "-01");
        const d2 = new Date(obj.endDate + "-01");
        const months = Math.max(1, (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()) + 1);
        const monthlyAmount = obj.targetAmount / months;

        let jeanAmount = 0;
        let moniqueAmount = 0;
        if (obj.partner === 'Jean') jeanAmount = monthlyAmount;
        else if (obj.partner === 'Monique') moniqueAmount = monthlyAmount;
        else {
          jeanAmount = monthlyAmount / 2;
          moniqueAmount = monthlyAmount / 2;
        }

        const expenseData = {
          description: `Épargne: ${obj.title}`,
          amount: monthlyAmount,
          category: 'Épargne',
          isRecurring: true,
          partner: obj.partner,
          jeanAmount,
          moniqueAmount,
          objectiveId: obj.id,
          endDate: obj.endDate
        };

        if (existingIndex >= 0) {
          const existing = updated[existingIndex];
          if (
            existing.amount !== expenseData.amount || 
            existing.description !== expenseData.description ||
            existing.endDate !== expenseData.endDate
          ) {
            updated[existingIndex] = { ...existing, ...expenseData };
            changed = true;
          }
        } else {
          updated.push({
            id: `obj-${obj.id}`,
            date: obj.startDate + "-01",
            ...expenseData
          });
          changed = true;
        }
      });

      // 2. Remove expenses whose objective no longer exists or is no longer recurring
      const objIds = new Set(recurringObjectives.map(o => o.id));
      const filtered = updated.filter(e => !e.objectiveId || objIds.has(e.objectiveId));
      if (filtered.length !== updated.length) {
        updated = filtered;
        changed = true;
      }

      return changed ? updated : prev;
    });
  }, [objectives]);

  // Sync Expenses deletion or update back to Debts
  useEffect(() => {
    const expenseDebtIds = new Set(expenses.filter(e => e.debtId).map(e => e.debtId));
    
    setDebts(prev => {
      let changed = false;
      const updated = prev.filter(d => d.isInternal || expenseDebtIds.has(d.id)).map(debt => {
        const linkedExpense = expenses.find(e => e.debtId === debt.id);
        if (linkedExpense && linkedExpense.amount !== debt.monthlyPayment) {
          changed = true;
          return { ...debt, monthlyPayment: linkedExpense.amount };
        }
        return debt;
      });

      return changed || updated.length !== prev.length ? updated : prev;
    });
  }, [expenses]);

  const navLinks = [
    { path: '/smart-depenses', label: 'Tableau de Bord', icon: LayoutDashboard, exact: true },
    { path: '/smart-depenses/expenses', label: 'Dépenses', icon: ReceiptEuro },
    { path: '/smart-depenses/savings', label: 'Épargne', icon: PiggyBank },
    { path: '/smart-depenses/grocery', label: 'Courses', icon: ShoppingBasket },
    { path: '/smart-depenses/debts', label: 'Dettes', icon: Landmark },
    { path: '/smart-depenses/analyse', label: 'Analyse', icon: PieChart, isPremiumOnly: true },
  ];

  return (
    <div className="min-h-screen bg-bgGray pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Sub-navigation */}
        <nav className="flex flex-wrap justify-center gap-4 mb-16">
          {navLinks.map(link => {
            const isActive = link.exact 
              ? location.pathname === link.path 
              : location.pathname.startsWith(link.path) && (link.path !== '/smart-depenses' || location.pathname === '/smart-depenses');
            
            const Icon = link.icon;

            const handleClick = (e: React.MouseEvent) => {
              if (link.isPremiumOnly && !isPremium) {
                e.preventDefault();
                e.stopPropagation();
                setShowPremiumPrompt(true);
              }
            };

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleClick}
                className={`flex items-center gap-3 px-6 py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-xl border-2 ${
                  isActive 
                    ? 'bg-royal text-white border-royal shadow-premium scale-105' 
                    : (link.isPremiumOnly && !isPremium)
                      ? 'bg-white text-gray-300 border-gray-100 opacity-70 cursor-not-allowed'
                      : 'bg-white text-gold border-white hover:border-gold/30 hover:text-royal shadow-soft'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-gray-300'}`} />
                  {link.isPremiumOnly && !isPremium && (
                    <div className="absolute -top-2 -right-2 text-[8px] bg-gold text-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm">🔒</div>
                  )}
                </div>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Views */}
        <Routes>
          <Route index element={
            <DashboardView 
              expenses={expenses} 
              objectives={objectives} 
              financeConfig={financeConfig} 
              setFinanceConfig={setFinanceConfig} 
              currencySymbol={currencySymbol}
              isPremium={isPremium}
              setShowPremiumPrompt={setShowPremiumPrompt}
            />
          } />
          <Route path="expenses" element={
            <ExpensesView 
              expenses={expenses} 
              setExpenses={setExpenses} 
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              isPremium={isPremium}
              setShowPremiumPrompt={setShowPremiumPrompt}
              currencySymbol={currencySymbol}
            />
          } />
          <Route path="savings" element={
            <SavingsView 
              objectives={objectives} 
              setObjectives={setObjectives} 
              expenses={expenses}
              revenuTotal={financeConfig.jeanSalary + financeConfig.moniqueSalary}
              isPremium={isPremium}
              setShowPremiumPrompt={setShowPremiumPrompt}
              currencySymbol={currencySymbol}
              bankAccounts={bankAccounts}
            />
          } />
          <Route path="grocery" element={
            <GroceryView 
              lists={groceryLists} 
              setLists={setGroceryLists} 
              isPremium={isPremium}
              setShowPremiumPrompt={setShowPremiumPrompt}
              currencySymbol={currencySymbol}
            />
          } />
          <Route path="debts" element={
            <DebtsView 
              debts={debts} 
              setDebts={setDebts} 
              currencySymbol={currencySymbol}
            />
          } />
          <Route path="analyse" element={
            <AnalyseView 
              expenses={expenses} 
              financeConfig={financeConfig} 
              objectives={objectives} 
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              isPremium={isPremium}
              setShowPremiumPrompt={setShowPremiumPrompt}
              currencySymbol={currencySymbol}
            />
          } />
        </Routes>
      </div>
    </div>
  );
};

export default SmartDepenses;
