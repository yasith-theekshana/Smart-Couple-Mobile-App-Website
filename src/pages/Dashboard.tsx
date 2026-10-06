import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, ShoppingCart, Heart, Calendar } from 'lucide-react';
import { Expense, PlanningEvent, PlanningCategory, GroceryList } from '../types';

const Dashboard: React.FC = () => {
  // Utilitaire pour les dates cohérentes
  const getTodayStr = (day: number = 1) => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // 1. Récupération synchronisée des données
  const expenses: Expense[] = useMemo(() => {
    const saved = localStorage.getItem('smart_expenses');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', category: 'Logement', amount: 1200, date: getTodayStr(1), description: 'Loyer mensuel', partner: 'Jean & Monique', isRecurring: true, jeanAmount: 600, moniqueAmount: 600 },
      { id: '2', category: 'Alimentation', amount: 150, date: getTodayStr(5), description: 'Leclerc Hebdo', partner: 'Monique', isRecurring: false, jeanAmount: 75, moniqueAmount: 75 },
      { id: '3', category: 'Loisirs', amount: 60, date: getTodayStr(7), description: 'Dîner chandelles', partner: 'Jean', isRecurring: false, jeanAmount: 60, moniqueAmount: 0 },
      { id: '4', category: 'Transport', amount: 45, date: getTodayStr(10), description: 'Plein Essence', partner: 'Jean & Monique', isRecurring: false, jeanAmount: 22.5, moniqueAmount: 22.5 },
    ];
  }, []);

  const config = useMemo(() => {
    const saved = localStorage.getItem('smart_finance_config');
    if (saved) return JSON.parse(saved);
    return { 
      jeanSalary: 2800, 
      moniqueSalary: 2400, 
      targetBudget: 3500,
      jeanContribution: 1750,
      moniqueContribution: 1750,
      jeanContributionPercent: 50,
      moniqueContributionPercent: 50,
      jeanIsRecurring: true,
      moniqueIsRecurring: true,
      totalIsRecurring: true
    };
  }, []);

  const groceryLists: GroceryList[] = useMemo(() => {
    const saved = localStorage.getItem('smart_grocery_lists');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Liste Principale', items: [] }
    ];
  }, []);

  const events: PlanningEvent[] = useMemo(() => {
    const saved = localStorage.getItem('smart_events');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', title: 'Soirée Sushi & Film', date: new Date().toISOString().split('T')[0], type: 'MOMENTS ENSEMBLE', partner: 'Jean & Monique', description: 'Commander le plateau premium.' },
      { id: '2', title: 'Anniversaire de Monique', date: '2026-01-31', type: 'ANNIVERSAIRE', partner: 'Monique', description: 'Gâteau chocolat maison.' },
      { id: '3', title: 'Session Yoga Duo', date: '2026-01-15', type: 'MOMENTS ENSEMBLE', partner: 'Jean & Monique', description: 'Détente absolue.', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800' },
      { id: '4', title: 'Rendez-vous Banque', date: '2026-01-05', type: 'JOURS IMPORTANT', partner: 'Jean', description: 'Dossier immo.' },
    ];
  }, []);

  const categories: PlanningCategory[] = useMemo(() => {
    const saved = localStorage.getItem('smart_categories');
    let cats = [
      { id: 'c1', name: 'JOURS IMPORTANT', color: '#D4AF37' },
      { id: 'c2', name: 'MOMENTS ENSEMBLE', color: '#DA70D6' },
      { id: 'c3', name: 'FAMILLE', color: '#2ECC71' },
      { id: 'c4', name: 'TRAVAIL', color: '#666666' },
      { id: 'c5', name: 'PRIVÉ', color: '#E91E63' },
      { id: 'c6', name: 'ANNIVERSAIRE', color: '#FF9800' },
    ];
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Force migration for FAMILLE color if it's the old blue
      return parsed.map((c: any) => 
        (c.name === 'FAMILLE' && (c.color === '#1f4e79' || c.color === '#5DADE2')) 
        ? { ...c, color: '#2ECC71' } 
        : c
      );
    }
    return cats;
  }, []);

  // 2. Calculs Financiers
  const statsFinancieres = useMemo(() => {
    let total = 0;
    let jeanTotal = 0;
    let moniqueTotal = 0;

    expenses.forEach(e => {
      total += e.amount;
      jeanTotal += (e.jeanAmount !== undefined ? e.jeanAmount : (e.partner.includes('Jean') ? e.amount : 0));
      moniqueTotal += (e.moniqueAmount !== undefined ? e.moniqueAmount : (e.partner.includes('Monique') ? e.amount : 0));
    });

    const revenuTotal = config.jeanSalary + config.moniqueSalary;
    const capaciteEpargne = Math.max(0, revenuTotal - total);

    return {
      total,
      jeanTotal,
      moniqueTotal,
      revenuTotal,
      capaciteEpargne
    };
  }, [expenses, config]);

  // 3. Filtrage des Événements à Venir (à partir d'aujourd'hui)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
      .map(e => ({
        ...e,
        color: categories.find(c => c.name === e.type)?.color || '#2ECC71'
      }));
  }, [events, categories]);

  const activeGroceryList = useMemo(() => {
    return groceryLists[0] || { id: 'default', name: 'Liste Principale', items: [] };
  }, [groceryLists]);

  const totalForPercent = statsFinancieres.total || 1;
  const jeanPercentage = (statsFinancieres.jeanTotal / totalForPercent) * 100;
  const moniquePercentage = (statsFinancieres.moniqueTotal / totalForPercent) * 100;

  return (
    <div className="container mx-auto px-6 pb-24 max-w-6xl animate-fadeIn pt-10">
      {/* Header Bienvenue */}
      <header className="mb-16 text-center md:text-left">
        <h5 className="text-gold font-bold text-xs tracking-[0.3em] mb-3 uppercase">Tableau de Bord</h5>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-royal mb-6 uppercase tracking-tight">
          Bonjour, Jean
        </h1>
        <div className="h-1 w-20 bg-gold/30 mx-auto md:mx-0"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Colonne Gauche: Répartition Actuelle */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white p-10 rounded-sm shadow-premium border-2 border-gold transition-all hover:shadow-2xl relative overflow-hidden group">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-10 relative z-10">
              <div className="flex items-center gap-3">
                <PieChart className="w-5 h-5 text-gold" />
                <h4 className="text-sm font-bold text-royal/70 tracking-[0.3em] uppercase">Répartition du Budget</h4>
              </div>
              <Link to="/smart-depenses" className="text-xs font-bold text-gold hover:text-royal transition-colors uppercase tracking-widest">Voir Détails →</Link>
            </div>
            
            <div className="space-y-12 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#D4AF37" strokeOpacity="0.1" strokeWidth="2" />
                    {/* Segment Jean (Or) */}
                    <circle
                      cx="18" cy="18" r="15.915"
                      fill="transparent"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                      strokeDasharray={`${jeanPercentage} ${100 - jeanPercentage}`}
                    />
                    {/* Segment Monique (Bleu) */}
                    <circle
                      cx="18" cy="18" r="15.915"
                      fill="transparent"
                      stroke="#1F4E79"
                      strokeWidth="2.5"
                      strokeDasharray={`${moniquePercentage} ${100 - moniquePercentage}`}
                      strokeDashoffset={-jeanPercentage}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-royal/40 uppercase leading-none">Total</span>
                    <span className="text-xl font-serif font-bold text-royal">{statsFinancieres.total.toFixed(0)}€</span>
                  </div>
                </div>

                <div className="flex-grow w-full space-y-6">
                  {/* Jean */}
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gold"></div>
                      <span className="text-xs font-bold text-royal uppercase tracking-widest">Jean</span>
                    </div>
                    <span className="text-sm font-serif font-bold text-royal">{statsFinancieres.jeanTotal.toFixed(2)} €</span>
                  </div>
                  <div className="w-full h-1.5 bg-royal/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${jeanPercentage}%` }}></div>
                  </div>

                  {/* Monique */}
                  <div className="flex justify-between items-end pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-royal"></div>
                      <span className="text-xs font-bold text-royal uppercase tracking-widest">Monique</span>
                    </div>
                    <span className="text-sm font-serif font-bold text-royal">{statsFinancieres.moniqueTotal.toFixed(2)} €</span>
                  </div>
                  <div className="w-full h-1.5 bg-royal/10 rounded-full overflow-hidden">
                    <div className="h-full bg-royal" style={{ width: `${moniquePercentage}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-royal/5 rounded-sm flex flex-col md:flex-row justify-between items-center gap-4 border border-royal/10">
                 <p className="text-xs text-royal/50 italic">"La clarté financière est la base d'une confiance durable."</p>
                 <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-royal/40 uppercase tracking-widest">Capacité d'épargne</span>
                   <span className="text-sm font-bold text-gold uppercase tracking-[0.1em]">
                     {statsFinancieres.capaciteEpargne.toFixed(0)}€ / mois
                   </span>
                 </div>
              </div>
            </div>
          </section>

          {/* Citation / Inspiration */}
          <section className="bg-royal p-12 rounded-sm shadow-premium text-center relative overflow-hidden group border-2 border-gold/20">
            <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
              <Heart className="w-6 h-6 text-gold" />
              <div className="h-px w-12 bg-gold/30"></div>
            </div>
            <p className="text-xl font-serif italic text-white leading-relaxed relative z-10 px-4">
              "L'objectif de Smart Couple est de transformer la gestion quotidienne en une harmonie partagée"
            </p>
            <div className="mt-8 flex justify-center gap-3 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gold/50"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gold/20"></div>
            </div>
          </section>

          {/* NOUVELLE SECTION: Liste de Courses (Déplacée ici) */}
          <Link to="/smart-depenses?view=grocery" className="block bg-white p-10 rounded-sm shadow-premium border-2 border-gold transition-all hover:shadow-2xl group relative overflow-hidden">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-8 h-8 text-gold" />
                <h4 className="text-2xl font-bold text-royal tracking-[0.3em] uppercase">Liste de Courses</h4>
              </div>
              <span className="text-lg font-bold text-gold group-hover:text-royal transition-colors uppercase tracking-widest">Gérer →</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {activeGroceryList.items.length > 0 ? (
                activeGroceryList.items.slice(0, 6).map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${item.checked ? 'bg-gold border-gold' : 'border-gold/30'}`}>
                      {item.checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-tight ${item.checked ? 'text-royal/30 line-through' : 'text-royal/70'}`}>
                      {item.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center">
                  <p className="text-xs text-royal/30 font-bold uppercase tracking-widest">La liste est vide</p>
                </div>
              )}
            </div>
            
            {activeGroceryList.items.length > 6 && (
              <p className="text-xs text-royal/40 italic font-medium mt-6 text-right relative z-10">
                + {activeGroceryList.items.length - 6} articles...
              </p>
            )}
          </Link>
        </div>

        {/* Colonne Droite: Événements à Venir */}
        <div className="space-y-10">
          <section className="bg-royal p-10 rounded-sm shadow-premium border-2 border-gold h-full transition-all hover:shadow-2xl overflow-hidden relative group">
            <div className="flex flex-col gap-2 mb-10 relative z-10">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gold" />
                <h4 className="text-sm font-bold text-white/70 tracking-[0.3em] uppercase whitespace-nowrap">Prochainement</h4>
              </div>
              <Link to="/smart-jours" className="text-xs font-bold text-gold hover:text-white transition-colors uppercase tracking-widest whitespace-nowrap ml-8">Agenda →</Link>
            </div>

            <div className="space-y-8 relative z-10">
              {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
                const date = new Date(event.date);
                return (
                  <div key={event.id} className="flex gap-6 group/item cursor-pointer">
                    <div className="flex-shrink-0 w-12 text-center">
                      <p className="text-lg font-serif font-bold text-white leading-none mb-1 group-hover/item:text-gold transition-colors">{date.getDate()}</p>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{date.toLocaleString('fr-FR', { month: 'short' })}</p>
                    </div>
                    <div className="flex-grow pb-8 border-b-2 border-gold/30 group-last:border-none">
                      <span className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: event.color }}>{event.type}</span>
                      <h6 className="text-sm font-bold text-white uppercase tracking-tight group-hover/item:text-gold transition-colors">{event.title}</h6>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-10 text-center">
                   <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Aucun événement</p>
                </div>
              )}
            </div>

            <Link to="/smart-jours" className="relative z-10 block w-full mt-10 py-4 bg-white/10 text-white text-center text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all rounded-sm shadow-sm border border-white/10">
              AJOUTER UN MOMENT
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
