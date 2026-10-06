import React, { useState } from 'react';
import { PlanningCategory, PlanningEvent } from '../../types';
import { PlanningSettings } from './SmartJours';

interface SettingsViewProps {
  settings: PlanningSettings;
  setSettings: React.Dispatch<React.SetStateAction<PlanningSettings>>;
  categories: PlanningCategory[];
  setCategories: React.Dispatch<React.SetStateAction<PlanningCategory[]>>;
  events: PlanningEvent[];
}

const PREMIUM_COLORS = [
  '#D4AF37', '#2ECC71', '#DA70D6', '#E91E63', '#4CAF50', '#FF9800', '#607D8B', '#795548',
];

const PROTECTED_CATEGORIES = ['JOURS IMPORTANT', 'ANNIVERSAIRE', 'MOMENTS ENSEMBLE'];

const NOTIFICATION_OPTIONS = [
  { value: '15_min', label: '15 MINUTES AVANT' },
  { value: '30_min', label: '30 MINUTES AVANT' },
  { value: '1_hour', label: '1 HEURE AVANT' },
  { value: '2_hours', label: '2 HEURES AVANT' },
  { value: '1_day', label: '1 JOUR AVANT' },
  { value: '2_days', label: '2 JOURS AVANT' },
  { value: '1_week', label: '1 SEMAINE AVANT' },
  { value: '2_weeks', label: '2 SEMAINES AVANT' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, categories, setCategories, events }) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PREMIUM_COLORS[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const triggerSavedMessage = () => {
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  // Monitor settings changes for feedback
  React.useEffect(() => {
    const saved = localStorage.getItem('smart_planning_settings');
    if (saved && JSON.stringify(settings) !== saved) {
      triggerSavedMessage();
    }
  }, [settings]);

  // Monitor categories changes for feedback
  React.useEffect(() => {
    const saved = localStorage.getItem('smart_categories');
    if (saved && JSON.stringify(categories) !== saved) {
      triggerSavedMessage();
    }
  }, [categories]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const name = newCatName.trim().toUpperCase();
    
    if (categories.some(c => c.name === name)) {
      setErrorMessage("Cette catégorie existe déjà.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const newCat: PlanningCategory = {
      id: Date.now().toString(),
      name,
      color: newCatColor
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const deleteCategory = (cat: PlanningCategory) => {
    if (PROTECTED_CATEGORIES.includes(cat.name)) {
      setErrorMessage(`La catégorie "${cat.name}" est essentielle et ne peut être supprimée.`);
      setConfirmDeleteId(null);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const isUsed = events.some(e => e.type === cat.name);
    if (isUsed) {
      setErrorMessage(`Impossible de supprimer "${cat.name}" car elle est utilisée.`);
      setConfirmDeleteId(null);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setCategories(prev => prev.filter(c => c.id !== cat.id));
    setConfirmDeleteId(null);
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto space-y-16 relative">
      {/* Floating Status Message */}
      {showSavedMessage && (
        <div className="fixed top-32 right-10 z-[5000] bg-royal text-white px-8 py-4 rounded-sm shadow-premium border-l-4 border-gold animate-slideInRight flex items-center gap-3">
          <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Préférences synchronisées</span>
        </div>
      )}
      
      {/* SECTION: GENERAL PREFERENCES */}
      <section className="bg-white p-12 rounded-sm shadow-soft border border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-10 border-b border-gray-50 pb-5">Préférences Générales</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <label className="text-[10px] font-bold text-royal uppercase tracking-[0.2em] block">Premier jour de la semaine</label>
            <div className="flex bg-bgGray p-1.5 rounded-sm shadow-inner">
              <button 
                onClick={() => setSettings({...settings, firstDayOfWeek: 'mon'})}
                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest transition-all ${settings.firstDayOfWeek === 'mon' ? 'bg-white text-royal shadow-premium' : 'text-gray-400 hover:text-royal'}`}
              >
                LUNDI
              </button>
              <button 
                onClick={() => setSettings({...settings, firstDayOfWeek: 'sun'})}
                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest transition-all ${settings.firstDayOfWeek === 'sun' ? 'bg-white text-royal shadow-premium' : 'text-gray-400 hover:text-royal'}`}
              >
                DIMANCHE
              </button>
            </div>
            <p className="text-[10px] text-gray-400 italic font-medium">L'affichage des calendriers s'adaptera automatiquement.</p>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-bold text-royal uppercase tracking-[0.2em] block">Rappel de Notification</label>
            <select 
              value={settings.notificationLeadTime}
              onChange={(e) => setSettings({...settings, notificationLeadTime: e.target.value})}
              className="w-full px-6 py-5 bg-bgGray border-none text-[11px] font-bold text-royal rounded-sm outline-none focus:ring-2 focus:ring-gold shadow-inner"
            >
              {NOTIFICATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 italic font-medium">Synchronisation automatique avec votre calendrier.</p>
          </div>
        </div>
      </section>

      {/* SECTION: CATEGORIES MANAGEMENT */}
      <section className="bg-white p-12 rounded-sm shadow-soft border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-gray-50 pb-8">
          <h4 className="text-[11px] font-bold text-gray-400 tracking-[0.3em] uppercase">Gestion des Catégories</h4>
          <button 
            onClick={() => setIsAddingCategory(!isAddingCategory)}
            className={`px-10 py-4 text-[11px] font-bold tracking-[0.25em] transition-all uppercase rounded-sm border-2 ${
              isAddingCategory 
                ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white' 
                : 'bg-gold/10 text-gold border-gold/20 hover:bg-gold hover:text-white shadow-sm'
            }`}
          >
            {isAddingCategory ? 'ANNULER' : '+ NOUVELLE'}
          </button>
        </div>

        {errorMessage && (
          <div className="mb-8 p-6 bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-widest text-center border-l-4 border-red-500 shadow-sm animate-pulse">
            {errorMessage}
          </div>
        )}

        {isAddingCategory && (
          <form onSubmit={handleAddCategory} className="mb-12 p-10 bg-bgGray/30 border-2 border-dashed border-gray-200 animate-fadeIn space-y-8 rounded-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nom de catégorie</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="EX: VOYAGE, SPORT..."
                    className="w-full px-6 py-4 bg-white border border-gray-100 text-[12px] font-bold text-royal outline-none focus:ring-2 focus:ring-gold shadow-sm"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nuancier Premium</label>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {PREMIUM_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCatColor(color)}
                        className={`w-8 h-8 rounded-full transition-all hover:scale-125 hover:shadow-lg ${newCatColor === color ? 'ring-4 ring-offset-2 ring-gold scale-110' : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
             </div>
             <button type="submit" className="w-full py-6 bg-royal text-white text-[11px] font-bold uppercase tracking-[0.3em] shadow-premium hover:bg-gold transition-all rounded-sm border-b-[6px] border-gold/40">
               AJOUTER LA CATÉGORIE
             </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="relative group">
              <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-50 rounded-sm hover:border-gold/30 hover:shadow-soft transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-[12px] font-bold text-royal tracking-[0.15em] uppercase">
                    {cat.name}
                  </span>
                  {PROTECTED_CATEGORIES.includes(cat.name) && (
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">(SYSTÈME)</span>
                  )}
                </div>
                
                {!PROTECTED_CATEGORIES.includes(cat.name) && (
                  <button 
                    onClick={() => setConfirmDeleteId(cat.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2 bg-bgGray rounded-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                )}
              </div>

              {confirmDeleteId === cat.id && (
                <div className="absolute inset-0 bg-white/95 z-20 flex items-center justify-between px-8 animate-fadeIn border-l-[8px] border-red-500 shadow-premium">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Sûr de vouloir supprimer ?</span>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => deleteCategory(cat)}
                      className="px-6 py-2.5 bg-red-500 text-white text-[10px] font-bold rounded-sm uppercase tracking-widest shadow-md hover:scale-105 transition-transform"
                    >
                      OUI
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-6 py-2.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
                    >
                      NON
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: DATA MANAGEMENT */}
      <section className="bg-white p-12 rounded-sm shadow-soft border border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-10 border-b border-gray-50 pb-5">Gestion des Données</h4>
        <div className="flex flex-col items-center gap-6">
          <p className="text-xs text-gray-500 text-center max-w-md leading-relaxed">
            Si vous souhaitez réinitialiser l'application avec les données de démonstration d'origine, utilisez le bouton ci-dessous. Attention, toutes vos modifications seront perdues.
          </p>
          <button 
            onClick={() => {
              if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible et l'application sera rechargée avec les données de démonstration d'origine.")) {
                localStorage.clear();
                // Force reload from server to clear any memory cache
                window.location.href = window.location.origin + '/smart-jours/settings';
              }
            }}
            className="px-12 py-5 bg-white border-2 border-gold text-gold font-bold text-[11px] uppercase tracking-[0.25em] rounded-sm hover:bg-gold hover:text-white transition-all shadow-md"
          >
            Réinitialiser les données par défaut
          </button>
        </div>
      </section>

      {/* FOOTER INFO */}
      <section className="text-center py-12">
        <p className="text-[11px] font-bold text-gray-300 tracking-[0.4em] uppercase">Configuration Smart Couple v2.5 Premium</p>
      </section>

    </div>
  );
};

export default SettingsView;
