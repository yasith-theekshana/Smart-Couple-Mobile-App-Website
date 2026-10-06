import React, { useState, useMemo } from 'react';
import { Debt } from '../../types';
import { X } from 'lucide-react';

interface DebtsProps {
  debts: Debt[];
  setDebts: React.Dispatch<React.SetStateAction<Debt[]>>;
  currencySymbol: string;
}

const DebtsView: React.FC<DebtsProps> = ({ debts, setDebts, currencySymbol }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isInternal, setIsInternal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    totalAmount: '',
    remainingAmount: '',
    monthlyPayment: '',
    endDate: '',
    type: 'Prêt' as 'Prêt' | 'Crédit' | 'Autre' | 'Équilibre',
    borrower: 'Jean',
    lender: 'Monique'
  });

  const totalDebt = useMemo(() => debts.filter(d => !d.isInternal).reduce((acc, curr) => acc + curr.remainingAmount, 0), [debts]);
  const totalMonthly = useMemo(() => debts.filter(d => !d.isInternal).reduce((acc, curr) => acc + curr.monthlyPayment, 0), [debts]);

  const internalDebts = useMemo(() => debts.filter(d => d.isInternal), [debts]);
  const externalDebts = useMemo(() => debts.filter(d => !d.isInternal), [debts]);

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const newDebt: Debt = {
      id: editingDebt?.id || Date.now().toString(),
      title: formData.title,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      remainingAmount: isInternal ? parseFloat(formData.totalAmount) : parseFloat(formData.remainingAmount),
      monthlyPayment: isInternal ? 0 : parseFloat(formData.monthlyPayment),
      endDate: isInternal ? '' : formData.endDate,
      type: isInternal ? 'Équilibre' : formData.type,
      isInternal: isInternal,
      borrower: isInternal ? formData.borrower : undefined,
      lender: isInternal ? formData.lender : undefined
    };

    if (editingDebt) {
      setDebts(prev => prev.map(d => d.id === editingDebt.id ? newDebt : d));
    } else {
      setDebts(prev => [...prev, newDebt]);
    }
    setIsModalOpen(false);
    setEditingDebt(null);
  };

  const handleDeleteDebt = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet engagement ?')) {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  const handlePayMonthly = (debt: Debt) => {
    const payment = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: debt.monthlyPayment
    };
    
    setDebts(prev => prev.map(d => {
      if (d.id === debt.id) {
        return {
          ...d,
          remainingAmount: Math.max(0, d.remainingAmount - d.monthlyPayment),
          payments: [...(d.payments || []), payment]
        };
      }
      return d;
    }));
  };

  const handleUndoPayment = (debt: Debt) => {
    if (!debt.payments || debt.payments.length === 0) return;
    
    const lastPayment = debt.payments[debt.payments.length - 1];
    setDebts(prev => prev.map(d => {
      if (d.id === debt.id) {
        return {
          ...d,
          remainingAmount: d.remainingAmount + lastPayment.amount,
          payments: d.payments?.slice(0, -1)
        };
      }
      return d;
    }));
  };

  const isPaidThisMonth = (debt: Debt) => {
    if (!debt.payments) return false;
    const now = new Date();
    return debt.payments.some(p => {
      const pDate = new Date(p.date);
      return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
    });
  };

  return (
    <div className="space-y-12 animate-fadeIn max-w-6xl mx-auto pb-20">
      {/* Notification Section */}
      <div className="bg-white p-8 rounded-sm shadow-soft border-l-4 border-gold space-y-4">
        <p className="text-xs font-bold text-royal leading-relaxed uppercase tracking-wider">
          CECI EST UN OUTIL POUR AIDER À GÉRER LES DÉPENSES INDIVIDUELLES. PARCE QUE NOUS VOULONS QUE VOUS RÉUSSISSIEZ DANS VOS FINANCES ET VOTRE GESTION DES DÉPENSES. CEPENDANT, LA RELATION ENTRE VOUS ET VOTRE PARTENAIRE A PLUS DE VALEUR QUE L'ARGENT. UNE BONNE RELATION DURABLE PEUT VOUS FAIRE VOUS SENTIR BEAUCOUP MIEUX QUE L'ARGENT. LES HUMAINS NE SONT PAS DES ÊTRES ÉCONOMIQUES. LES HUMAINS SONT DES ÊTRES SOCIAUX QUI AIMENT ET QUI ONT BESOIN D'ÊTRE AIMÉS.
        </p>
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
          PAS L'ARGENT, MAIS L'AMOUR EST ANCRÉ DANS NOTRE ADN !
        </p>
        <p className="text-xs font-bold text-royal leading-relaxed uppercase tracking-wider">
          PAR CONSÉQUENT, SOYEZ FLEXIBLE DANS LA GESTION DES DÉPENSES AVEC VOTRE PARTENAIRE. LA GESTION DE L'ARGENT EST INDISPENSABLE POUR GÉRER LA VIE DANS UN MONDE ÉCONOMIQUE, MAIS LA VIE EST BELLE AVEC L'AMOUR.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div>
          <h5 className="text-gold font-bold text-[11px] tracking-[0.4em] mb-2 uppercase">Gestion des Engagements</h5>
          <h2 className="text-3xl font-serif font-bold text-royal uppercase tracking-tight">Dettes & Crédits</h2>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { 
              setEditingDebt(null); 
              setIsInternal(true);
              setFormData({ title: '', totalAmount: '', remainingAmount: '', monthlyPayment: '', endDate: '', type: 'Équilibre', borrower: 'Jean', lender: 'Monique' }); 
              setIsModalOpen(true); 
            }} 
            className="gold-gradient px-12 py-5 rounded-sm text-white font-bold text-xs tracking-[0.25em] uppercase shadow-xl hover:scale-105 transition-all"
          >
            NOUVEL ÉQUILIBRE
          </button>
        </div>
      </div>

      {/* Internal Debts Section */}
      {internalDebts.length > 0 && (
        <section className="space-y-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Équilibres entre Partenaires</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internalDebts.map(debt => (
              <div key={debt.id} className="bg-white p-8 rounded-sm shadow-soft border-2 border-gray-50 hover:border-gold/20 transition-all flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{debt.borrower} doit à {debt.lender}</span>
                  </div>
                  <h4 className="text-xl font-serif font-bold text-royal uppercase tracking-tight">{debt.title}</h4>
                  <p className="text-2xl font-serif font-bold text-gold mt-2">{(debt.totalAmount || 0).toLocaleString()} {currencySymbol}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditingDebt(debt);
                    setIsInternal(true);
                    setFormData({
                      title: debt.title,
                      totalAmount: debt.totalAmount.toString(),
                      remainingAmount: '',
                      monthlyPayment: '',
                      endDate: '',
                      type: 'Équilibre',
                      borrower: debt.borrower || 'Jean',
                      lender: debt.lender || 'Monique'
                    });
                    setIsModalOpen(true);
                  }} className="p-3 text-gray-300 hover:text-gold transition-colors bg-bgGray rounded-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button onClick={() => handleDeleteDebt(debt.id)} className="p-3 text-gray-200 hover:text-red-500 transition-colors bg-bgGray rounded-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    {isModalOpen && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md animate-fadeIn" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-premium p-12 relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-300 hover:text-gold transition-colors"
            >
              <X size={24} />
            </button>
            {isInternal ? (
              <div className="space-y-10">
                <h3 className="text-3xl font-serif font-bold text-royal text-center uppercase tracking-widest">Enregistrer un nouvel équilibre</h3>
                <form onSubmit={handleSaveDebt} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Raison de la dette</label>
                      <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Sortie Cinéma" className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-base text-royal font-bold rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Montant ({currencySymbol})</label>
                      <input required type="number" step="0.01" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} placeholder="0.00" className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-2xl font-serif font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direction du paiement</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, borrower: 'Jean', lender: 'Monique'})}
                        className={`py-8 px-4 rounded-sm border-2 font-bold text-xs tracking-widest uppercase transition-all ${formData.borrower === 'Jean' ? 'bg-royal text-white border-royal shadow-lg' : 'bg-white text-royal border-gray-100 hover:border-gold/30'}`}
                      >
                        Jean doit à Monique
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, borrower: 'Monique', lender: 'Jean'})}
                        className={`py-8 px-4 rounded-sm border-2 font-bold text-xs tracking-widest uppercase transition-all ${formData.borrower === 'Monique' ? 'bg-royal text-white border-royal shadow-lg' : 'bg-white text-royal border-gray-100 hover:border-gold/30'}`}
                      >
                        Monique doit à Jean
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <button type="submit" className="w-full py-6 gold-gradient text-white font-bold uppercase tracking-[0.3em] shadow-xl rounded-sm active:scale-95 transition-transform text-sm">
                      ENREGISTRER LA DETTE
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-royal transition-colors">ANNULER</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <h3 className="text-2xl font-serif font-bold text-royal text-center uppercase tracking-widest">{editingDebt ? 'Modifier' : 'Nouvel engagement'}</h3>
                <form onSubmit={handleSaveDebt} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Titre</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-base text-royal font-bold rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-sm text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all">
                        <option>Prêt</option>
                        <option>Crédit</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fin prévue</label>
                      <input required type="month" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-sm text-royal rounded-sm outline-none focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Total Initial ({currencySymbol})</label>
                      <input required type="number" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-base font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Restant ({currencySymbol})</label>
                      <input required type="number" value={formData.remainingAmount} onChange={e => setFormData({...formData, remainingAmount: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-base font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mensualité ({currencySymbol})</label>
                    <input required type="number" value={formData.monthlyPayment} onChange={e => setFormData({...formData, monthlyPayment: e.target.value})} className="w-full px-6 py-4 bg-bgGray border border-gray-200 text-base font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold hover:border-gold/50 transition-all outline-none" />
                  </div>
                  <div className="pt-6 space-y-4">
                    <button type="submit" className="w-full py-5 gold-gradient text-white font-bold uppercase tracking-[0.3em] shadow-xl rounded-sm active:scale-95 transition-transform text-sm">SAUVEGARDER</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-royal transition-colors">ANNULER</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtsView;
