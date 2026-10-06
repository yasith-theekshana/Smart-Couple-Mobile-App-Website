import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import CalendarHomeView from './CalendarHomeView';
import TodoView from './TodoView';
import MomentsView from './MomentsView';
import SlideshowView from './SlideshowView';
import ImportantDaysView from './ImportantDaysView';
import SettingsView from './SettingsView';
import { PlanningEvent, PlanningCategory } from '../../types';
import { useSubscription } from '../../hooks/useSubscription';
import { 
  Calendar, 
  CheckSquare, 
  Heart, 
  Star, 
  Settings as SettingsIcon,
  Plus,
  X
} from 'lucide-react';

export interface PlanningSettings {
  firstDayOfWeek: 'sun' | 'mon';
  notificationLeadTime: string;
}

const SmartJours: React.FC = () => {
  const { isPremium } = useSubscription();
  const location = useLocation();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [settings, setSettings] = useState<PlanningSettings>(() => {
    const saved = localStorage.getItem('smart_planning_settings');
    return saved ? JSON.parse(saved) : {
      firstDayOfWeek: 'mon',
      notificationLeadTime: '1_day_before'
    };
  });

  const [events, setEvents] = useState<PlanningEvent[]>(() => {
    const saved = localStorage.getItem('smart_events');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Anniversaire de Jean', date: '2026-04-06', type: 'ANNIVERSAIRE', partner: 'Jean', description: 'Fête surprise prévue.' },
      { id: '3', title: 'Obtenez le certificat de master', date: '2026-06-06', type: 'JOURS IMPORTANT', partner: 'Jean', description: 'Cérémonie de remise des diplômes.' },
      { id: '4', title: 'Mettez à jour votre visa à l\'ambassade', date: '2026-03-20', type: 'PRIVÉ', partner: 'Jean', description: 'Prendre tous les documents nécessaires.' },
      { id: '5', title: 'Salon de l\'emploi', date: '2026-05-05', type: 'TRAVAIL', partner: 'Jean', description: 'Préparer les CV.' },
      { 
        id: 'm1', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Cuisine Italienne', 
        date: '2024-03-10', 
        partner: 'Jean & Monique',
        description: 'Préparation de pâtes fraîches maison.',
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm2', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Balade au Couchersol', 
        date: '2024-03-15', 
        partner: 'Jean & Monique',
        description: 'Promenade romantique sur la plage.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm3', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Atelier Peinture Duo', 
        date: '2024-03-20', 
        partner: 'Jean & Monique',
        description: 'Expression artistique à deux.',
        imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm4', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Soirée Cinéma Cocon', 
        date: '2024-03-25', 
        partner: 'Jean & Monique',
        description: 'Film et pop-corn sous un plaid.',
        imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm5', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Séance de Yoga Matinale', 
        date: '2024-03-28', 
        partner: 'Jean & Monique',
        description: 'Réveil en douceur et sérénité.',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm6', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Dîner aux Chandelles', 
        date: '2024-04-02', 
        partner: 'Jean & Monique',
        description: 'Soirée gastronomique intime.',
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm7', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Weekend en Nature', 
        date: '2024-04-05', 
        partner: 'Jean & Monique',
        description: 'Évasion au grand air.',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm9', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Découverte Culinaire', 
        date: '2024-04-15', 
        partner: 'Jean & Monique',
        description: 'Nouveaux goûts et saveurs.',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm10', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Randonnée Panoramique', 
        date: '2024-04-20', 
        partner: 'Jean & Monique',
        description: 'Vue imprenable et effort partagé.',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000'
      },
      { 
        id: 'm11', 
        type: 'MOMENTS ENSEMBLE', 
        title: 'Séance Photo Complice', 
        date: '2024-04-25', 
        partner: 'Jean & Monique',
        description: 'Capturer nos plus beaux sourires.',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=2000'
      },
    ];
  });

  const [categories, setCategories] = useState<PlanningCategory[]>(() => {
    const saved = localStorage.getItem('smart_categories');
    const defaultCats = [
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
    return defaultCats;
  });

  const [eventForm, setEventForm] = useState<{
    title: string;
    type: string;
    date: string;
    description: string;
    partner: string;
    imageUrl?: string;
    isSurprise: boolean;
  }>({
    title: '',
    type: categories[0]?.name || '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    partner: 'Jean & Monique',
    isSurprise: false
  });

  useEffect(() => localStorage.setItem('smart_events', JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem('smart_categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('smart_planning_settings', JSON.stringify(settings)), [settings]);

  const navLinks = [
    { path: '/smart-jours', label: 'Accueil', icon: Calendar, exact: true },
    { path: '/smart-jours/todo', label: 'À-Faire', icon: CheckSquare },
    { path: '/smart-jours/moments', label: 'Moments Ensemble', icon: Heart, premium: true },
    { path: '/smart-jours/jours-importants', label: 'Jours Importants', icon: Star },
    { path: '/smart-jours/settings', label: 'Paramètres', icon: SettingsIcon },
  ];

  const handleOpenAdd = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      type: categories[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      partner: 'Jean & Monique',
      imageUrl: undefined,
      isSurprise: false
    });
    setIsAddEventOpen(true);
  };

  const handleQuickAdd = (categoryName: string) => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      type: categoryName,
      date: new Date().toISOString().split('T')[0],
      description: '',
      partner: 'Jean & Monique',
      imageUrl: undefined,
      isSurprise: false
    });
    setIsAddEventOpen(true);
  };

  const handleOpenEdit = (event: PlanningEvent) => {
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      type: event.type,
      date: event.date,
      description: event.description || '',
      partner: event.partner || 'Jean & Monique',
      imageUrl: event.imageUrl,
      isSurprise: event.isSurprise || false
    });
    setIsAddEventOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.type) return;
    
    if (editingEventId) {
      setEvents(prev => prev.map(ev => ev.id === editingEventId ? { ...ev, ...eventForm } : ev));
    } else {
      const event: PlanningEvent = {
        id: Date.now().toString(),
        ...eventForm
      };
      setEvents(prev => [...prev, event]);
    }
    
    setIsAddEventOpen(false);
    setEditingEventId(null);
  };

  return (
    <div className="min-h-screen bg-bgGray pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-10 mb-12">
            <div className="text-center md:text-left">
              <h5 className="text-gold font-bold text-sm tracking-[0.4em] mb-4 uppercase">Chronologie du Couple</h5>
              <h1 className="text-3xl md:text-5xl 2xl:text-6xl font-serif font-bold text-royal uppercase tracking-tight">Smart Jours</h1>
            </div>
            <button 
              onClick={handleOpenAdd}
              className="w-full md:w-auto gold-gradient px-12 py-5 rounded-sm text-white font-bold text-xs tracking-[0.25em] uppercase shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-4"
            >
              <span>AJOUTER UN ÉVÉNEMENT</span>
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Sub-navigation matching Smart Depenses style */}
          <nav className="flex flex-wrap justify-center gap-4">
            {navLinks.map(link => {
              const isActive = link.exact 
                ? location.pathname === link.path 
                : location.pathname.startsWith(link.path) && (link.path !== '/smart-jours' || location.pathname === '/smart-jours');
              
              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.premium && !isPremium ? location.pathname : link.path}
                  onClick={(e) => {
                    if (link.premium && !isPremium) {
                      e.preventDefault();
                      setShowPremiumPrompt(true);
                    }
                  }}
                  className={`flex items-center gap-3 px-6 py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-xl border-2 ${
                    isActive 
                      ? 'bg-royal text-white border-royal shadow-premium scale-105' 
                      : (link.premium && !isPremium)
                        ? 'bg-white text-gray-300 border-white cursor-not-allowed opacity-60'
                        : 'bg-white text-gold border-white hover:border-gold/30 hover:text-royal shadow-soft'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-gray-300'}`} />
                  {link.label}
                  {link.premium && !isPremium && <span className="ml-2 text-[8px] bg-gold/10 text-gold px-1.5 py-0.5 rounded-sm">PREMIUM</span>}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="min-h-[60vh]">
          <Routes>
            <Route index element={
              <CalendarHomeView 
                events={events} 
                setEvents={setEvents}
                onEditEvent={handleOpenEdit}
                categories={categories}
                settings={settings}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
              />
            } />
            <Route path="todo" element={
              <TodoView 
                events={events} 
                setEvents={setEvents}
                categories={categories} 
                onEditEvent={handleOpenEdit}
                onQuickAdd={handleQuickAdd}
                settings={settings}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
              />
            } />
            <Route path="moments" element={
              <MomentsView 
                events={events}
                onEditEvent={handleOpenEdit}
                categories={categories}
              />
            } />
            <Route path="slideshow" element={
              <SlideshowView 
                events={events}
              />
            } />
            <Route path="jours-importants" element={
              <ImportantDaysView 
                events={events}
                onEditEvent={handleOpenEdit}
              />
            } />
            <Route path="settings" element={
              <SettingsView 
                settings={settings}
                setSettings={setSettings}
                categories={categories}
                setCategories={setCategories}
                events={events}
              />
            } />
          </Routes>
        </div>
      </div>

      {showPremiumPrompt && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-royal/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-sm shadow-premium border-t-8 border-gold p-12 text-center">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Star className="w-10 h-10 text-gold" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-royal mb-4 uppercase tracking-widest">Fonctionnalité Premium</h3>
            <p className="text-gray-500 mb-10 leading-relaxed">
              La vue "Moments Ensemble" est réservée à nos membres Premium. Immortalisez vos souvenirs et planifiez vos moments privilégiés en toute sérénité.
            </p>
            <div className="space-y-4">
              <Link 
                to="/subscription" 
                className="block w-full py-5 bg-gold text-white font-bold uppercase tracking-[0.2em] shadow-xl rounded-sm hover:scale-105 transition-all text-sm"
              >
                DEVENIR PREMIUM
              </Link>
              <button 
                onClick={() => setShowPremiumPrompt(false)}
                className="w-full py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-royal transition-colors"
              >
                PLUS TARD
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddEventOpen && (
        <div 
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md animate-fadeIn cursor-pointer"
          onClick={() => setIsAddEventOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-sm shadow-premium border-t-8 border-gold p-6 md:p-8 cursor-default border border-gray-100 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif font-bold text-royal mb-6 text-center uppercase tracking-widest">
              {editingEventId ? 'Modifier' : 'Ajouter'}
            </h3>
            
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Titre du moment</label>
                <input autoFocus required type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="Ex: Soirée restaurant..." className="w-full px-5 py-3 bg-bgGray border-none text-base font-bold text-royal rounded-sm focus:ring-1 focus:ring-gold outline-none shadow-inner" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Catégorie</label>
                  <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})} className="w-full px-5 py-3 bg-bgGray border-none text-xs text-royal font-bold rounded-sm outline-none focus:ring-1 focus:ring-gold shadow-inner">
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <input required type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full px-5 py-3 bg-bgGray border-none text-xs text-royal font-bold rounded-sm outline-none focus:ring-1 focus:ring-gold shadow-inner" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  value={eventForm.description} 
                  onChange={e => setEventForm({...eventForm, description: e.target.value})} 
                  placeholder="Détails sur ce moment..." 
                  className="w-full px-5 py-3 bg-bgGray border-none text-xs font-medium text-royal rounded-sm focus:ring-1 focus:ring-gold outline-none shadow-inner min-h-[60px] resize-none"
                />
              </div>

              {eventForm.type === 'MOMENTS ENSEMBLE' && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Image</label>
                  <div className="flex items-center gap-4">
                    {eventForm.imageUrl && (
                      <div className="w-12 h-12 rounded-sm overflow-hidden border border-gold/20 shadow-sm relative group">
                        <img src={eventForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setEventForm({...eventForm, imageUrl: undefined})}
                          className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="flex-grow cursor-pointer">
                      <div className="w-full px-5 py-3 bg-bgGray border-2 border-dashed border-gray-200 text-gray-400 font-bold text-[9px] uppercase tracking-widest rounded-sm hover:border-gold hover:text-gold transition-all flex items-center justify-center gap-3">
                        <Plus className="w-4 h-4" />
                        {eventForm.imageUrl ? 'CHANGER' : 'TÉLÉCHARGER'}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEventForm({...eventForm, imageUrl: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Mode Surprise Toggle */}
              <div className="bg-royal/5 p-3 rounded-sm border border-royal/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔒</span>
                    <span className="text-[9px] font-bold text-royal uppercase tracking-widest">Mode Surprise</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEventForm({ ...eventForm, isSurprise: !eventForm.isSurprise })}
                    className={`w-10 h-5 rounded-full transition-all relative ${eventForm.isSurprise ? 'bg-gold' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${eventForm.isSurprise ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
                <p className="text-[8px] text-gray-400 italic leading-relaxed">
                  Le détail sera caché sur le calendrier de votre partenaire jusqu'au jour J.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full py-4 gold-gradient text-white text-xs font-bold uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all rounded-sm">
                  {editingEventId ? 'METTRE À JOUR' : 'ENREGISTRER'}
                </button>
                <button type="button" onClick={() => setIsAddEventOpen(false)} className="w-full py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-royal transition-colors">
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

export default SmartJours;
