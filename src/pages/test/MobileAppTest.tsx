/** @jsxRuntime classic */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Expense, ShoppingItem, FinanceCategory, Article, ArchivedShoppingList } from './MobileTypes';
import { ARTICLES } from '../smart-union/ArticleData';
import MobileHome from './MobileHome';
import MobileFinances from './MobileFinances';
import MobileCourses from './MobileCourses';
import MobileMenages from './MobileMenages';
import MobileCalendar from './MobileCalendar';
import MobileArticles from './MobileArticles';
import { translations } from './translations';

const MobileAppTest: React.FC = () => {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'finances' | 'courses' | 'menages' | 'calendar'>('menu');
  const [financeTab, setFinanceTab] = useState<'dashboard' | 'expenses' | 'debts' | 'analysis'>('dashboard');
  const [menagesTab, setMenagesTab] = useState<'dashboard' | 'upcoming' | 'completed'>('dashboard');

  // Global State (shared across components)
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'task-1', name: 'Préparer le petit-déjeuner', category: 'Cuisine', assignedTo: 'Jean', date: '2026-04-06', status: 'À faire', isRecurrent: true },
    { id: 'task-2', name: 'Préparer le dîner', category: 'Cuisine', assignedTo: 'Monique', date: '2026-04-06', status: 'À faire', isRecurrent: true },
    { id: 'task-3', name: 'Lessive', category: 'Vêtements', assignedTo: 'Jean', date: '2026-04-07', status: 'Terminé', isRecurrent: false },
    { id: 'task-4', name: 'Repasser les vêtements', category: 'Vêtements', assignedTo: 'Monique', date: '2026-04-08', status: 'Terminé', isRecurrent: false },
    { id: 'task-5', name: 'Tondre la pelouse', category: 'Jardin', assignedTo: 'Jean', date: '2026-04-11', status: 'À faire', isRecurrent: false },
    { id: 'task-6', name: 'Nettoyer la salle de bain', category: 'Salle de bain', assignedTo: 'Monique', date: '2026-04-11', status: 'À faire', isRecurrent: true },
    { id: 'task-7', name: 'Faire les courses', category: 'Autres', assignedTo: 'Jean & Monique', date: '2026-04-11', status: 'À faire', isRecurrent: true },
  ]);

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    { id: 'shop-1', name: 'Pain', cat: 'Alim', unit: 'u', quantity: 2, price: 1.20, checked: false },
    { id: 'shop-2', name: 'Lait', cat: 'Alim', unit: 'L', quantity: 1, price: 0.95, checked: true },
    { id: 'shop-3', name: 'Lessive', cat: 'Ménage', unit: 'u', quantity: 1, price: 12.50, checked: false },
    { id: 'shop-4', name: 'Pommes', cat: 'Fruits', unit: 'kg', quantity: 1.5, price: 2.40, checked: false },
  ]);

  const [oldLists, setOldLists] = useState<ArchivedShoppingList[]>([
    {
      id: 'old-1',
      name: 'Semaine du 18/05/2026',
      date: '18/05/2026',
      itemsCount: 4,
      total: 13.40,
      items: [
        { id: 'h-1', name: 'Lait demi-écrémé', cat: '', unit: 'L', quantity: 2, price: 1.25, checked: true },
        { id: 'h-2', name: 'Pain de campagne', cat: '', unit: 'u', quantity: 1, price: 1.80, checked: true },
        { id: 'h-3', name: 'Pâtisserie fraise', cat: '', unit: 'u', quantity: 1, price: 4.50, checked: true },
        { id: 'h-4', name: 'Ananas entier', cat: '', unit: 'u', quantity: 2, price: 2.30, checked: true }
      ]
    },
    {
      id: 'old-2',
      name: 'Semaine du 11/05/2026',
      date: '11/05/2026',
      itemsCount: 3,
      total: 8.90,
      items: [
        { id: 'h-5', name: 'Café Arabica', cat: '', unit: 'paq', quantity: 1, price: 3.40, checked: true },
        { id: 'h-6', name: 'Beurre doux', cat: '', unit: 'g', quantity: 1, price: 2.50, checked: true },
        { id: 'h-7', name: 'Pommes royales', cat: '', unit: 'kg', quantity: 1, price: 3.00, checked: true }
      ]
    }
  ]);

  const [budget, setBudget] = useState(5800);
  const [jeanContribution, setJeanContribution] = useState(3000);
  const [moniqueContribution, setMoniqueContribution] = useState(2800);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'exp-1', desc: 'Loyer Avril', cat: 'Loyer', amt: 1250, rec: true, owner: 'Jean', date: '2026-04-01' },
    { id: 'exp-2', desc: 'Courses Bio', cat: 'Courses', amt: 84.50, rec: false, owner: 'Monique', date: '2026-04-05' },
    { id: 'exp-3', desc: 'Netflix', cat: 'Abos', amt: 17.99, rec: true, owner: 'Jean', date: '2026-04-10' },
    { id: 'exp-4', desc: 'Plein Essence', cat: 'Essence', amt: 75.00, rec: false, owner: 'Jean', date: '2026-04-12' },
  ]);

  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([
    { id: 'loyer', name: 'Loyer', icon: 'fa-house', color: 'bg-blue-500' },
    { id: 'courses', name: 'Courses', icon: 'fa-cart-shopping', color: 'bg-orange-500' },
    { id: 'abos', name: 'Abos', icon: 'fa-tv', color: 'bg-purple-500' },
    { id: 'essence', name: 'Essence', icon: 'fa-gas-pump', color: 'bg-cyan-500' },
    { id: 'loisirs', name: 'Loisirs', icon: 'fa-gamepad', color: 'bg-green-500' },
    { id: 'autre', name: 'Autre', icon: 'fa-ellipsis', color: 'bg-gray-500' },
  ]);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('https://images.pexels.com/photos/29099979/pexels-photo-29099979/free-photo-of-silhouette-d-un-couple-s-embrassant-au-coucher-du-soleil.jpeg?auto=format&fit=crop&q=80&w=200');

  // Articles State
  const [isViewingArticles, setIsViewingArticles] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const displayedArticles = ARTICLES.slice(0, 4);

  const couplePhotos = [
    'https://images.unsplash.com/photo-1516589174184-c685266e430c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1522673607200-1648832cee98?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=80&w=400',
    'https://images.pexels.com/photos/29099979/pexels-photo-29099979/free-photo-of-silhouette-d-un-couple-s-embrassant-au-coucher-du-soleil.jpeg?auto=format&fit=crop&q=80&w=200',
  ];

  useEffect(() => {
    // Hide global navbar
    const navbar = document.querySelector('nav');
    if (navbar) navbar.style.display = 'none';
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => {
      clearTimeout(timer);
      if (navbar) navbar.style.display = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-bgGray flex items-center justify-center py-10 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-[375px] h-[812px] bg-white rounded-[50px] shadow-[0_30px_70px_rgba(0,0,0,0.2)] border-[10px] border-royal overflow-hidden flex flex-col"
      >
        {/* Status Bar */}
        <div className="h-12 w-full flex justify-between items-center px-8 pt-6 z-20 shrink-0 bg-[#FFF9E5]">
          <span className="text-[12px] font-bold text-royal">09:41</span>
          <div className="flex gap-2 items-center">
            <i className="fa-solid fa-signal text-[10px] text-royal"></i>
            <i className="fa-solid fa-wifi text-[10px] text-royal"></i>
            <i className="fa-solid fa-battery-full text-[12px] text-royal"></i>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-grow relative overflow-hidden bg-white">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50 px-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <img src={`${import.meta.env.BASE_URL}img/smartcouple-icon.png`} alt="Logo" className="w-16 h-16 mb-4 filter drop-shadow-lg object-contain" />
                  <span className="text-3xl font-serif font-bold tracking-tighter text-gold uppercase mb-2">
                    SMART<span className="text-royal">COUPLE</span>
                  </span>
                  <div className="w-12 h-1 bg-gold rounded-full mb-6"></div>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] leading-relaxed">
                    {lang === 'fr' ? 'Élégance & Sérénité partagée' : 'Shared Elegance & Serenity'}
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              <div className="h-full w-full">
                {activeTab === 'menu' && (
                  <MobileHome 
                    setActiveTab={setActiveTab} 
                    setIsProfileMenuOpen={setIsProfileMenuOpen} 
                    profilePhoto={profilePhoto}
                    onViewAllArticles={() => setIsViewingArticles(true)}
                    onSelectArticle={(id) => {
                      setSelectedArticleId(id);
                      setIsViewingArticles(true);
                    }}
                    featuredArticle={ARTICLES.find(a => a.id === 'ecoute-active') || ARTICLES[0]}
                    lang={lang}
                  />
                )}
                {activeTab === 'finances' && (
                  <MobileFinances 
                    onBack={() => setActiveTab('menu')} tab={financeTab} setTab={setFinanceTab}
                    budget={budget} setBudget={setBudget}
                    jeanContribution={jeanContribution} setJeanContribution={setJeanContribution}
                    moniqueContribution={moniqueContribution} setMoniqueContribution={setMoniqueContribution}
                    expenses={expenses} setExpenses={setExpenses}
                    financeCategories={financeCategories} setFinanceCategories={setFinanceCategories}
                    lang={lang}
                  />
                )}
                {activeTab === 'courses' && (
                  <MobileCourses 
                    onBack={() => setActiveTab('menu')} 
                    shoppingItems={shoppingItems} 
                    setShoppingItems={setShoppingItems} 
                    oldLists={oldLists}
                    setOldLists={setOldLists}
                    lang={lang}
                  />
                )}
                {activeTab === 'menages' && (
                  <MobileMenages onBack={() => setActiveTab('menu')} initialView={menagesTab} tasks={tasks} setTasks={setTasks} lang={lang} />
                )}
                {activeTab === 'calendar' && (
                  <MobileCalendar onBack={() => setActiveTab('menu')} expenses={expenses} tasks={tasks} lang={lang} />
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Navigation Bar */}
        {!loading && (
          <nav className="h-24 w-full bg-[#FFF9E5] border-t border-gold/10 px-6 flex items-center justify-around shrink-0 relative z-20">
            {[
              { id: 'menu', icon: 'fa-house', label: lang === 'fr' ? 'Accueil' : 'Home' },
              { id: 'finances', icon: 'fa-wallet', label: lang === 'fr' ? 'Finances' : 'Finance' },
              { id: 'courses', icon: 'fa-cart-shopping', label: lang === 'fr' ? 'Shopping' : 'Shop' },
              { id: 'calendar', icon: 'fa-calendar-days', label: lang === 'fr' ? 'Agenda' : 'Agenda' },
              { id: 'menages', icon: 'fa-broom', label: lang === 'fr' ? 'Ménages' : 'Tasks' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                   setActiveTab(item.id as any);
                   if (item.id === 'finances') setFinanceTab('dashboard');
                   if (item.id === 'menages') setMenagesTab('dashboard');
                }}
                className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative ${activeTab === item.id ? 'text-[#1F4E79] scale-110' : 'text-[#D4AF37]'}`}
              >
                <div className={`p-2.5 rounded-xl transition-colors ${activeTab === item.id ? 'bg-[#1F4E79]/10' : ''}`}>
                  <i className={`fa-solid ${item.icon} text-lg`}></i>
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <motion.div layoutId="nav-dot" className="absolute -bottom-4 w-1 h-1 bg-[#1F4E79] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        )}

        {/* Profile Overlay */}
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-royal/40 backdrop-blur-md flex items-end"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="w-full bg-white rounded-t-[40px] p-8 shadow-premium border-t-2 border-gold max-h-[90%] overflow-y-auto no-scrollbar"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1 bg-gold/20 rounded-full mx-auto mb-6 shrink-0"></div>
                
                <div className="flex flex-col items-center mb-6 text-center">
                  <div className="relative mb-3 group cursor-pointer" onClick={() => {
                    const nextPhoto = couplePhotos[Math.floor(Math.random() * couplePhotos.length)];
                    setProfilePhoto(nextPhoto);
                  }}>
                    <img src={profilePhoto} className="w-20 h-20 rounded-full border-4 border-gold shadow-lg object-cover" />
                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <i className="fa-solid fa-camera text-white"></i>
                    </div>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-royal mb-0.5">Jean & Monique</h3>
                  <span className="px-2.5 py-0.5 bg-gold/10 text-gold text-[8px] font-bold uppercase tracking-widest rounded-full">Couple Premium v.25</span>
                </div>
                
                {/* Language Toggler in params */}
                <div className="bg-bgGray rounded-2xl p-4 mb-4 border border-gold/10 text-center">
                  <span className="text-[9px] font-black tracking-widest text-[#1F4E79] uppercase block mb-3">
                    {lang === 'fr' ? 'Langue / Language' : 'Language / Langue'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setLang('fr')}
                      className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                        lang === 'fr' 
                          ? 'bg-royal text-white shadow-md' 
                          : 'bg-white text-royal border border-gold/10 hover:bg-gold/5'
                      }`}
                    >
                      Français (FR)
                    </button>
                    <button 
                      onClick={() => setLang('en')}
                      className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                        lang === 'en' 
                          ? 'bg-royal text-white shadow-md' 
                          : 'bg-white text-royal border border-gold/10 hover:bg-gold/5'
                      }`}
                    >
                      English (EN)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <button onClick={() => {
                    const currentId = couplePhotos.indexOf(profilePhoto);
                    let nextId = (currentId + 1) % couplePhotos.length;
                    setProfilePhoto(couplePhotos[nextId]);
                  }} className="w-full py-3 bg-bgGray rounded-2xl flex items-center justify-center gap-3 text-royal font-bold text-[9px] uppercase tracking-widest active:bg-gold/10 transition-colors">
                    <i className="fa-solid fa-image-polaroid text-gold"></i> {lang === 'fr' ? 'Changer la photo' : 'Change Photo'}
                  </button>
                  <button className="w-full py-3 bg-bgGray rounded-2xl flex items-center justify-center gap-3 text-royal/40 font-bold text-[9px] uppercase tracking-widest cursor-not-allowed">
                     {lang === 'fr' ? 'Mon Profil (Prochainement)' : 'My Profile (Coming Soon)'}
                  </button>
                  <button onClick={() => setIsProfileMenuOpen(false)} className="w-full py-3 text-royal/40 font-bold text-[9px] uppercase tracking-widest mt-2 block text-center">
                    {lang === 'fr' ? 'Fermer' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Articles Overlay */}
        <AnimatePresence>
          {isViewingArticles && (
            <MobileArticles 
              articles={displayedArticles}
              selectedArticleId={selectedArticleId}
              onSelectArticle={setSelectedArticleId}
              onClose={() => {
                setIsViewingArticles(false);
                setSelectedArticleId(null);
              }}
              lang={lang}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MobileAppTest;
