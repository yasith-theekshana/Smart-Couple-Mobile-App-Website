import React, { useState, useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import { PlanningEvent, PlanningCategory } from '../../types';
import { PlanningSettings } from './SmartJours';

interface TodoViewProps {
  events: PlanningEvent[];
  setEvents: React.Dispatch<React.SetStateAction<PlanningEvent[]>>;
  categories: PlanningCategory[];
  onEditEvent: (event: PlanningEvent) => void;
  onQuickAdd: (categoryName: string) => void;
  settings: PlanningSettings;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

const TodoView: React.FC<TodoViewProps> = ({ 
  events, 
  setEvents, 
  categories, 
  onEditEvent, 
  onQuickAdd, 
  settings,
  currentDate,
  setCurrentDate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || '');
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<PlanningEvent | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Mini-Map Date Logic
  const realToday = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = useMemo(() => {
    const date = new Date(currentYear, currentMonth, 1);
    const days = [];
    
    // Adjust start padding based on firstDayOfWeek setting
    const rawStartPadding = date.getDay();
    let startPadding = rawStartPadding;
    if (settings.firstDayOfWeek === 'mon') {
      startPadding = rawStartPadding === 0 ? 6 : rawStartPadding - 1;
    }

    for (let i = 0; i < startPadding; i++) days.push(null);
    while (date.getMonth() === currentMonth) {
      days.push(date.getDate());
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth, currentYear, settings.firstDayOfWeek]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => e.type === selectedCategory);
  }, [events, selectedCategory]);

  const eventDays = useMemo(() => {
    return filteredEvents
      .filter(e => {
        const [y, m] = e.date.split('-').map(Number);
        return (m - 1) === currentMonth && y === currentYear;
      })
      .map(e => Number(e.date.split('-')[2]));
  }, [filteredEvents, currentMonth, currentYear]);

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const handleDeleteEvent = () => {
    if (!selectedEventForDetail) return;
    setEvents(prev => prev.filter(e => e.id !== selectedEventForDetail.id));
    setSelectedEventForDetail(null);
    setIsDeletingEvent(false);
  };

  const getCategoryColor = (typeName: string) => {
    return categories.find(c => c.name === typeName)?.color || '#2ECC71';
  };

  const dayHeaders = settings.firstDayOfWeek === 'sun' 
    ? ['D','L','M','M','J','V','S'] 
    : ['L','M','M','J','V','S','D'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fadeIn">
      
      {/* LEFT: Category Selection ONLY */}
      <div className="lg:col-span-4 space-y-10">
        <div className="bg-white p-10 rounded-sm shadow-soft border border-gray-100">
          <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-5">
            <h4 className="text-[11px] font-bold text-gray-400 tracking-[0.3em] uppercase">Filtrer par Catégorie</h4>
          </div>

          <div className="space-y-3">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className={`w-full flex items-center justify-between p-6 cursor-pointer transition-all border-l-[6px] shadow-sm rounded-sm group ${
                  selectedCategory === cat.name 
                    ? 'bg-royal/5 border-gold shadow-md translate-x-1' 
                    : 'bg-white border-transparent hover:bg-bgGray/50 hover:border-royal/20 hover:translate-x-1'
                }`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <div className="flex items-center gap-5">
                  <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: cat.color }}></div>
                  <span className={`text-[12px] font-bold tracking-widest transition-colors ${selectedCategory === cat.name ? 'text-royal' : 'text-gray-400 group-hover:text-royal'}`}>
                    {cat.name}
                  </span>
                </div>
                {/* Bouton Plus remplaçant l'icône de validation */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd(cat.name);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedCategory === cat.name 
                      ? 'bg-gold text-white scale-110 shadow-md' 
                      : 'bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100'
                  } hover:rotate-90 active:scale-90`}
                  title={`Ajouter un événement en ${cat.name}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[10px] text-gray-400 italic uppercase leading-relaxed text-center font-medium">
            Personnalisez vos étiquettes dans les <span className="text-gold font-bold">PARAMÈTRES</span>.
          </p>
        </div>
      </div>

      {/* RIGHT: Filtered Mini-Map & List */}
      <div className="lg:col-span-8 space-y-12">
        <div className="bg-white p-12 rounded-sm shadow-soft border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Mini-Map */}
          <div>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <button onClick={() => changeMonth(-1)} className="p-1 text-gray-300 hover:text-gold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h5 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase min-w-[100px] text-center">
                  {currentDate.toLocaleString('fr-FR', { month: 'short', year: 'numeric' })}
                </h5>
                <button onClick={() => changeMonth(1)} className="p-1 text-gray-300 hover:text-gold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(selectedCategory) }}></div>
                 <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{selectedCategory}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center mb-3">
              {dayHeaders.map((d, idx) => (
                <div key={`${d}-${idx}`} className="text-center text-[9px] font-bold text-gray-300 tracking-widest">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day, i) => {
                const isSelected = day && eventDays.includes(day);
                return (
                  <div 
                    key={i} 
                    className={`aspect-square flex items-center justify-center text-[10px] font-bold transition-all rounded-sm ${
                      !day ? 'bg-transparent' : 
                      isSelected 
                        ? 'text-white shadow-premium transform scale-110 z-10' 
                        : 'text-gray-300 hover:text-royal hover:bg-bgGray'
                    }`}
                    style={isSelected ? { backgroundColor: getCategoryColor(selectedCategory) } : {}}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results List */}
          <div className="flex flex-col">
             <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                <h5 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Résultats</h5>
                <span className="bg-royal/10 px-4 py-1 text-[10px] font-bold text-royal rounded-full tracking-widest">{filteredEvents.length}</span>
             </div>
             
             <div className="flex-grow space-y-5 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                {filteredEvents.map(e => (
                  <button 
                    key={e.id} 
                    onClick={() => setSelectedEventForDetail(e)}
                    className="w-full text-left p-6 bg-bgGray/30 border-2 border-transparent rounded-sm hover:border-gold/30 hover:bg-white hover:shadow-soft transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h6 className="text-[12px] font-bold text-royal uppercase tracking-tight group-hover:text-gold transition-colors">{e.title}</h6>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter bg-white px-2 py-1 rounded-sm border border-gray-50">{new Date(e.date).getDate()} / {new Date(e.date).getMonth() + 1}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 italic line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">{e.description || 'Pas de description.'}</p>
                  </button>
                ))}
                
                {filteredEvents.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="w-16 h-16 bg-bgGray rounded-full flex items-center justify-center mb-6">
                      <svg className="w-7 h-7 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">Aucune activité enregistrée</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-royal p-12 rounded-sm flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left overflow-hidden relative shadow-premium border-b-[8px] border-gold">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-gold" />
              <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">Structurez votre vision</h3>
            </div>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">Le planning intelligent vous permet de trier vos priorités par thématique pour un équilibre de vie optimal.</p>
          </div>
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="relative z-10 px-12 py-5 bg-gold text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-105 transition-transform shadow-2xl">
            NOUVEL ÉVÉNEMENT
          </button>
        </div>
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEventForDetail && (
        <div 
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md animate-fadeIn cursor-pointer"
          onClick={() => { setSelectedEventForDetail(null); setIsDeletingEvent(false); }}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-sm shadow-premium border-t-[12px] p-12 cursor-default border border-gray-100"
            style={{ borderTopColor: getCategoryColor(selectedEventForDetail.type) }}
            onClick={e => e.stopPropagation()}
          >
            <header className="mb-10 flex justify-between items-start">
              <div className="flex-grow pr-8">
                <span className="px-5 py-2 text-[10px] font-bold text-white uppercase tracking-widest rounded-sm mb-5 inline-block" style={{ backgroundColor: getCategoryColor(selectedEventForDetail.type) }}>
                  {selectedEventForDetail.type}
                </span>
                <h3 className="text-3xl font-serif font-bold text-royal uppercase tracking-tight leading-tight">{selectedEventForDetail.title}</h3>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3">{new Date(selectedEventForDetail.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelectedEventForDetail(null)} className="text-gray-300 hover:text-royal transition-colors p-3 bg-bgGray rounded-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </header>

            <div className="space-y-10">
              {selectedEventForDetail.imageUrl && (
                <div className="mb-6 shadow-premium rounded-sm overflow-hidden border border-gray-100">
                  <img src={selectedEventForDetail.imageUrl} alt={selectedEventForDetail.title} className="w-full h-64 object-cover" />
                </div>
              )}

              <div className="bg-bgGray/50 p-8 rounded-sm border border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Description détaillée</h4>
                <p className="text-royal font-medium italic leading-relaxed text-base">
                  "{selectedEventForDetail.description || "Pas de détails pour ce moment."}"
                </p>
              </div>

              {!isDeletingEvent ? (
                <div className="flex flex-col gap-6 pt-10 border-t border-gray-100 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Responsable</span>
                      <span className="text-sm font-bold text-royal uppercase tracking-tight">{selectedEventForDetail.partner || 'Jean & Monique'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => { 
                        onEditEvent(selectedEventForDetail); 
                        setSelectedEventForDetail(null); 
                      }}
                      className="py-6 border-2 border-royal text-royal text-sm font-bold uppercase tracking-widest hover:bg-royal hover:text-white transition-all shadow-md active:scale-95"
                    >
                      MODIFIER
                    </button>
                    <button 
                      onClick={() => setIsDeletingEvent(true)}
                      className="py-6 border-2 border-red-500 text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-md active:scale-95"
                    >
                      SUPPRIMER
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-8 rounded-sm border-2 border-red-100 animate-fadeIn space-y-8 text-center">
                  <p className="text-base text-red-600 font-bold uppercase tracking-widest leading-relaxed">CONFIRMER LA SUPPRESSION ?</p>
                  <div className="flex gap-6">
                    <button 
                      onClick={handleDeleteEvent}
                      className="flex-1 py-6 bg-red-500 text-white text-sm font-bold uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all active:scale-95"
                    >
                      OUI, SUPPRIMER
                    </button>
                    <button onClick={() => setIsDeletingEvent(false)} className="flex-1 py-6 bg-white border-2 border-red-200 text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95">ANNULER</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F8F9FA;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default TodoView;
