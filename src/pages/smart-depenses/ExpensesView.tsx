import React, { useState, useMemo, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Expense } from '../../types';

interface ExpensesProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isPremium: boolean;
  setShowPremiumPrompt: (show: boolean) => void;
  currencySymbol: string;
}

const ExpensesView: React.FC<ExpensesProps> = ({ 
  expenses, 
  setExpenses, 
  selectedMonth, 
  setSelectedMonth,
  isPremium,
  setShowPremiumPrompt,
  currencySymbol
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Toutes');
  const [sortBy, setBy] = useState<'date' | 'title'>('date');

  // Generate months from 2026 to current month + 1 year
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
        // Stop if we reached far enough in the future
        if (year === endYear && month === now.getMonth() + 1) break;
      }
    }
    return options.reverse(); // Newest first
  }, []);

  const [formData, setFormData] = useState({ 
    description: '', 
    category: 'COURSES', 
    amount: '', 
    jeanAmount: '', 
    moniqueAmount: '', 
    date: new Date().toISOString().split('T')[0], 
    partner: 'Jean', 
    isRecurring: false 
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPayer, setScanPayer] = useState<'Both' | 'Jean' | 'Monique'>('Both');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      // 1. Read the image in French
      const result = await Tesseract.recognize(file, 'fra');
      const text = result.data.text;
      
      // 2. Clean the text to avoid picking up SIRET, SIREN, or long Note numbers
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      const cleanText = lines.filter(l => 
        !l.match(/SIRET|SIREN|APE|TVA|TEL|N°|NOTE|CLE|SERV|CAISSE/i) || 
        l.match(/TOTAL|TTC|MONTANT/i) // Keep lines that have both
      ).join('\n');

      // 3. Hunt for the total price (Looks for TOTAL/TTC and a number with a comma/dot)
      // We use multiple patterns in priority order
      const priorityPatterns = [
        /(?:TOTAL TTC|TTC|MONTANT DÛ|NET À PAYER|TOTAL À RÉGLER|À PAYER)[\s\S]{0,50}?(\d+)[.,](\d{2})/i,
        /(?:TOTAL|MONTANT|NET|SOMME)[\s\S]{0,50}?(\d+)[.,](\d{2})/i
      ];

      let extractedAmount = 0;
      let found = false;

      for (const pattern of priorityPatterns) {
        const match = cleanText.match(pattern);
        if (match) {
          extractedAmount = parseFloat(`${match[1]}.${match[2]}`);
          // Basic sanity check: totals are rarely > 5000 for groceries/restaurants
          if (extractedAmount > 0 && extractedAmount < 5000) {
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        // Fallback: Try to find the largest number that looks like a price, but ignore HT/TVA lines
        const priceLines = lines.filter(l => !l.match(/HT|TVA|TAXE/i) || l.match(/TOTAL|TTC/i));
        const allPrices: number[] = [];
        priceLines.forEach(line => {
          const matches = line.match(/\d+[.,]\d{2}/g);
          if (matches) {
            matches.forEach(m => {
              const val = parseFloat(m.replace(',', '.'));
              if (val < 5000) allPrices.push(val);
            });
          }
        });

        if (allPrices.length > 0) {
          extractedAmount = Math.max(...allPrices);
        }
      }

      // 4. Try to get the store name (usually the first line of the receipt)
      const firstLine = lines[0] || 'Ticket de caisse';

      // 5. Pre-fill the form based on selected payer
      let jeanAmount = '0';
      let moniqueAmount = '0';

      if (scanPayer === 'Both') {
        jeanAmount = (extractedAmount / 2).toFixed(2);
        moniqueAmount = (extractedAmount / 2).toFixed(2);
      } else if (scanPayer === 'Jean') {
        jeanAmount = extractedAmount.toFixed(2);
        moniqueAmount = '0';
      } else if (scanPayer === 'Monique') {
        jeanAmount = '0';
        moniqueAmount = extractedAmount.toFixed(2);
      }

      setFormData({
        description: firstLine.substring(0, 30),
        category: 'COURSES',
        amount: extractedAmount.toString(),
        jeanAmount: jeanAmount, // Keep as string for the input field
        moniqueAmount: moniqueAmount, // Keep as string for the input field
        date: new Date().toISOString().split('T')[0],
        partner: scanPayer === 'Both' ? 'Jean' : scanPayer,
        isRecurring: false
      });
      
      // 5. Open the modal so the user can review and save
      setIsModalOpen(true);

    } catch (error) {
      console.error("OCR Error:", error);
      alert("Erreur lors de la lecture du reçu. Assurez-vous que la photo est nette.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  const itemsPerPage = 10;

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
  
  const processedExpenses = useMemo(() => {
    let result = expenses.filter(e => {
      if (e.isRecurring && !isPremium) return false;
      
      const expenseMonth = e.date.substring(0, 7); // YYYY-MM
      if (e.isRecurring) {
        const startMonth = expenseMonth;
        const endMonth = e.endDate ? e.endDate.substring(0, 7) : '9999-12';
        return selectedMonth >= startMonth && selectedMonth <= endMonth;
      }
      return expenseMonth === selectedMonth;
    });

    if (filterCategory !== 'Toutes') result = result.filter(e => e.category === filterCategory);
    
    result.sort((a, b) => {
      if (a.isRecurring && !b.isRecurring) return -1;
      if (!a.isRecurring && b.isRecurring) return 1;
      
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return a.description.localeCompare(b.description);
      }
    });
    
    return result;
  }, [expenses, filterCategory, sortBy, selectedMonth]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const jeanAmt = parseFloat(formData.jeanAmount) || 0;
    const moniqueAmt = parseFloat(formData.moniqueAmount) || 0;
    const totalAmount = jeanAmt + moniqueAmt;

    const expenseData = {
      ...formData,
      amount: totalAmount,
      jeanAmount: jeanAmt,
      moniqueAmount: moniqueAmt
    };

    if (editingExpense) {
      // Logic for recurring history: If amount changed on a recurring expense, split it
      if (editingExpense.isRecurring && expenseData.isRecurring && editingExpense.amount !== totalAmount) {
        const [year, month] = selectedMonth.split('-').map(Number);
        const prevMonthDate = new Date(year, month - 2, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        
        setExpenses(prev => {
          const updated = prev.map(ex => 
            ex.id === editingExpense.id 
              ? { ...ex, endDate: prevMonthStr } 
              : ex
          );
          return [...updated, { id: Date.now().toString(), ...expenseData, date: selectedMonth + '-01' }];
        });
      } else {
        setExpenses(prev => prev.map(ex => ex.id === editingExpense.id ? { ...ex, ...expenseData } : ex));
      }
    } else {
      setExpenses(prev => [...prev, { id: Date.now().toString(), ...expenseData }]);
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const totalPages = Math.ceil(processedExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedExpenses.slice(start, start + itemsPerPage);
  }, [processedExpenses, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleRecurring = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, isRecurring: !e.isRecurring } : e));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-sm shadow-soft border border-gray-100">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-tight">Journal des Transactions</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gérez vos dépenses partagées</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          {/* Payer Selector for Scanner */}
          <div className="flex bg-bgGray p-1 rounded-sm border border-gray-100 w-full md:w-auto">
            <button 
              onClick={() => setScanPayer('Both')}
              className={`flex-1 md:flex-none px-4 py-2 text-[8px] font-bold rounded-sm transition-all uppercase tracking-widest ${scanPayer === 'Both' ? 'bg-royal text-white shadow-sm' : 'text-gray-400 hover:text-royal'}`}
            >
              Les Deux
            </button>
            <button 
              onClick={() => setScanPayer('Jean')}
              className={`flex-1 md:flex-none px-4 py-2 text-[8px] font-bold rounded-sm transition-all uppercase tracking-widest ${scanPayer === 'Jean' ? 'bg-royal text-white shadow-sm' : 'text-gray-400 hover:text-royal'}`}
            >
              Jean
            </button>
            <button 
              onClick={() => setScanPayer('Monique')}
              className={`flex-1 md:flex-none px-4 py-2 text-[8px] font-bold rounded-sm transition-all uppercase tracking-widest ${scanPayer === 'Monique' ? 'bg-royal text-white shadow-sm' : 'text-gray-400 hover:text-royal'}`}
            >
              Monique
            </button>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              onChange={handleScanReceipt} 
              className="hidden" 
            />
            
            {/* New Scan Button */}
            <div className="relative group w-full md:w-auto">
              <button 
                onClick={() => {
                  if (!isPremium) {
                    setShowPremiumPrompt(true);
                    return;
                  }
                  fileInputRef.current?.click();
                }} 
                disabled={isScanning}
                className={`w-full md:w-auto px-8 py-5 rounded-sm font-bold text-xs tracking-[0.25em] uppercase shadow-lg transition-all border-2 border-gold flex items-center justify-center gap-3 ${isScanning ? 'bg-bgGray text-gray-400 border-gray-300' : 'bg-white text-gold hover:bg-gold hover:text-white'} ${!isPremium ? 'opacity-80' : ''}`}
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    SCAN EN COURS...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    SCANNER UN REÇU {!isPremium && '🔒'}
                  </>
                )}
              </button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-royal text-white text-[9px] font-bold uppercase tracking-widest rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                Photo nette et verticale recommandée
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-royal"></div>
              </div>
            </div>

            <button onClick={() => {
              setEditingExpense(null);
              setFormData({ description: '', category: 'COURSES', amount: '', jeanAmount: '', moniqueAmount: '', date: new Date().toISOString().split('T')[0], partner: 'Jean', isRecurring: false });
              setIsModalOpen(true);
            }} className="w-full md:w-auto gold-gradient px-12 py-5 rounded-sm text-white font-bold text-xs tracking-[0.25em] uppercase shadow-lg hover:scale-105 transition-all">
              AJOUTER UNE LIGNE
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 bg-bgGray/50 p-6 rounded-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mois :</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
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

      <div className="hidden md:block bg-white rounded-sm shadow-soft overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-6 text-[11px] font-bold tracking-widest text-slate-400 uppercase">TRANSACTION</th>
              {isPremium && <th className="px-8 py-6 text-[11px] font-bold tracking-widest text-slate-400 uppercase text-center">RÉCURRENT</th>}
              <th className="px-8 py-6 text-[11px] font-bold tracking-widest text-slate-400 uppercase text-right">JEAN ({currencySymbol})</th>
              <th className="px-8 py-6 text-[11px] font-bold tracking-widest text-slate-400 uppercase text-right">MONIQUE ({currencySymbol})</th>
              <th className="px-8 py-6 text-[11px] font-bold tracking-widest text-slate-400 uppercase text-right">TOTAL ({currencySymbol})</th>
              <th className="px-8 py-6 text-[11px] font-bold tracking-widest text-slate-400 uppercase text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedExpenses.map(e => (
              <tr key={e.id} className={`transition-colors group ${e.isRecurring ? 'bg-slate-50/80' : 'bg-white hover:bg-slate-50/30'}`}>
                <td className="px-8 py-6 text-base font-bold text-royal">
                  {e.description}
                  <p className="text-[11px] text-gold font-normal uppercase mt-1 tracking-tight">{e.category} • {e.date}</p>
                </td>
                {isPremium && (
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => {
                        if (!isPremium) {
                          setShowPremiumPrompt(true);
                          return;
                        }
                        toggleRecurring(e.id);
                      }}
                      className={`p-2 rounded-full transition-all ${e.isRecurring ? 'bg-royal text-white' : 'bg-bgGray text-gray-300'} ${!isPremium ? 'opacity-50' : ''}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </td>
                )}
                <td className="px-8 py-6 text-base font-bold text-right text-royal">{(e.jeanAmount ?? 0).toFixed(2)}</td>
                <td className="px-8 py-6 text-base font-bold text-right text-royal">{(e.moniqueAmount ?? 0).toFixed(2)}</td>
                <td className="px-8 py-6 text-base font-bold text-right text-royal">{e.amount.toFixed(2)}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { 
                      setEditingExpense(e); 
                      setFormData({
                        description: e.description,
                        category: e.category,
                        amount: e.amount.toString(),
                        jeanAmount: (e.jeanAmount ?? 0).toString(),
                        moniqueAmount: (e.moniqueAmount ?? 0).toString(),
                        date: e.date,
                        partner: e.partner,
                        isRecurring: e.isRecurring ?? false
                      }); 
                      setIsModalOpen(true); 
                    }} className="text-gray-400 hover:text-gold p-2 bg-bgGray rounded-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))} className="text-gray-300 hover:text-red-500 p-2 bg-bgGray rounded-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {paginatedExpenses.map(e => (
          <div key={e.id} className={`p-6 rounded-sm border shadow-soft flex flex-col gap-4 ${e.isRecurring ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-bold text-royal">{e.description}</h4>
                <p className="text-[10px] text-gold uppercase tracking-widest mt-1">{e.category} • {e.date}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-royal">{e.amount.toFixed(2)} {currencySymbol}</p>
                <div className="flex justify-end gap-2 mt-2">
                   <button onClick={() => { 
                      setEditingExpense(e); 
                      setFormData({
                        description: e.description,
                        category: e.category,
                        amount: e.amount.toString(),
                        jeanAmount: (e.jeanAmount ?? 0).toString(),
                        moniqueAmount: (e.moniqueAmount ?? 0).toString(),
                        date: e.date,
                        partner: e.partner,
                        isRecurring: e.isRecurring ?? false
                      }); 
                      setIsModalOpen(true); 
                    }} className="text-gray-400 p-2 bg-bgGray rounded-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-royal/10 backdrop-blur-sm animate-fadeIn" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-sm shadow-premium p-10 border-t-8 border-gold" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-serif font-bold text-royal mb-8 text-center uppercase tracking-widest">{editingExpense ? 'Modifier' : 'Ajouter'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Titre</label>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-base text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jean ({currencySymbol})</label>
                  <input type="number" step="0.01" value={formData.jeanAmount} onChange={e => setFormData({...formData, jeanAmount: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-lg font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monique ({currencySymbol})</label>
                  <input type="number" step="0.01" value={formData.moniqueAmount} onChange={e => setFormData({...formData, moniqueAmount: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-lg font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Catégorie</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-sm text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all">
                    {categories.filter(c => c !== 'Toutes').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-sm text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all" />
                </div>
              </div>

              {/* Récurrent Toggle */}
              <div className="flex items-center justify-between p-4 bg-bgGray rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-royal uppercase tracking-widest">Dépense Récurrente</span>
                  {!isPremium && <span className="text-gold text-xs">🔒</span>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPremium) {
                      setShowPremiumPrompt(true);
                      return;
                    }
                    setFormData({ ...formData, isRecurring: !formData.isRecurring });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    formData.isRecurring ? 'bg-royal' : 'bg-gray-200'
                  } ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`${
                      formData.isRecurring ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>

              <div className="pt-6 space-y-4">
                <button type="submit" className="w-full py-5 gold-gradient text-white font-bold uppercase tracking-[0.3em] shadow-lg rounded-sm active:scale-95 transition-transform text-sm">
                  ENREGISTRER
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-royal transition-colors">
                  ANNULER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
