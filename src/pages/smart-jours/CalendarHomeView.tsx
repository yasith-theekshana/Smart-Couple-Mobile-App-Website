import React, { useState, useMemo } from 'react';
import { PlanningEvent, PlanningCategory } from '../../types';
import { PlanningSettings } from './SmartJours';

interface CalendarHomeProps {
  events: PlanningEvent[];
  setEvents: React.Dispatch<React.SetStateAction<PlanningEvent[]>>;
  onEditEvent: (event: PlanningEvent) => void;
  categories: PlanningCategory[];
  settings: PlanningSettings;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

type ViewMode = 'month' | 'week' | 'day';

const CalendarHomeView: React.FC<CalendarHomeProps> = ({ 
  events, 
  setEvents, 
  onEditEvent, 
  categories, 
  settings,
  currentDate,
  setCurrentDate
}) => {
  const realToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const parseDateLocal = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateISO = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); 
    const diff = settings.firstDayOfWeek === 'mon' 
      ? (day === 0 ? -6 : 1 - day)
      : -day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  const weekRange = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
  }, [currentDate, settings.firstDayOfWeek]);

  // MONTH LOGIC
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    const rawStartPadding = date.getDay();
    let startPadding = rawStartPadding;
    if (settings.firstDayOfWeek === 'mon') {
      startPadding = rawStartPadding === 0 ? 6 : rawStartPadding - 1;
    }

    for (let i = 0; i < startPadding; i++) {
      days.push({ day: null, dateStr: '' });
    }
    while (date.getMonth() === month) {
      const d = date.getDate();
      days.push({ day: d, dateStr: formatDateISO(date) });
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate, settings.firstDayOfWeek]);

  // WEEK LOGIC
  const daysInWeek = useMemo(() => {
    const startOfWeek = getStartOfWeek(currentDate);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push({ day: day.getDate(), dateStr: formatDateISO(day), fullDate: new Date(day) });
    }
    return week;
  }, [currentDate, settings.firstDayOfWeek]);

  const changePeriod = (offset: number) => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + offset);
    else if (viewMode === 'week') next.setDate(next.getDate() + offset * 7);
    else if (viewMode === 'day') next.setDate(next.getDate() + offset);
    setCurrentDate(next);
  };

  const currentViewEvents = useMemo(() => {
    return [...events]
      .filter(e => {
        const d = parseDateLocal(e.date);
        if (viewMode === 'month') return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        if (viewMode === 'week') {
            const start = getStartOfWeek(currentDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(start.getDate() + 7);
            return d >= start && d < end;
        }
        return e.date === formatDateISO(currentDate);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, currentDate, viewMode, settings.firstDayOfWeek]);

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
    setSelectedEvent(null);
    setIsDeleting(false);
  };

  const getCategoryColor = (typeName: string) => {
    return categories.find(c => c.name === typeName)?.color || '#2ECC71';
  };

  const dayHeaders = settings.firstDayOfWeek === 'sun' 
    ? ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'] 
    : ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

  return (
    <div className="space-y-12 animate-fadeIn relative pb-20">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-8 bg-royal p-8 rounded-sm shadow-premium border border-gold/20">
        <div className="flex bg-black/20 p-1.5 rounded-sm shadow-inner w-full md:w-auto">
          {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 md:flex-none px-10 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                viewMode === mode ? 'bg-gold !text-white shadow-premium' : '!text-white hover:bg-white/10'
              }`}
            >
              {mode === 'month' ? 'MOIS' : mode === 'week' ? 'SEMAINE' : 'JOUR'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <button 
            onClick={() => setCurrentDate(new Date(realToday.getFullYear(), realToday.getMonth(), realToday.getDate()))}
            className="px-8 py-4 bg-gold/10 border-2 border-gold/20 text-gold text-[11px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-sm"
          >
            AUJOURD'HUI
          </button>
          <div className="flex items-center bg-black/20 border-2 border-gold/10 rounded-sm shadow-sm overflow-hidden">
            <button onClick={() => changePeriod(-1)} className="p-4 text-gold hover:text-white border-r border-gold/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <span className="px-10 py-4 text-xs font-bold text-gold uppercase tracking-widest min-w-[200px] text-center">
              {viewMode === 'month' ? monthName : viewMode === 'week' ? weekRange : currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </span>
            <button onClick={() => changePeriod(1)} className="p-4 text-gold hover:text-white border-l border-gold/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <section className="bg-white rounded-sm shadow-premium border border-gold/20 overflow-hidden">
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 text-center border-b border-gold/20 bg-royal/5">
            {dayHeaders.map(d => (
              <div key={d} className="py-6 text-sm font-black text-gold tracking-[0.3em] uppercase">{d}</div>
            ))}
          </div>
        )}

        {viewMode === 'month' && (
          <div className="grid grid-cols-7">
            {daysInMonth.map((d, i) => {
              const dayEvents = events.filter(e => e.date === d.dateStr);
              const isToday = d.dateStr === formatDateISO(realToday);
              return (
                <div key={i} className={`min-h-[70px] md:min-h-[90px] p-4 border-r border-b border-gold/10 transition-colors hover:bg-royal/5 relative ${!d.day ? 'bg-gray-50' : ''}`}>
                  {d.day && (
                    <>
                      <span className={`text-lg font-black mb-2 transition-all flex items-center justify-center ${isToday ? 'w-9 h-9 bg-gold text-white rounded-full shadow-lg' : 'text-royal opacity-40 w-9 h-9'}`}>
                        {d.day}
                      </span>
                      <div className="space-y-2 mt-2">
                        {dayEvents.slice(0, 3).map(e => (
                          <button key={e.id} onClick={() => setSelectedEvent(e)} className="block h-2 w-full rounded-sm transition-all hover:scale-[1.05]" style={{ backgroundColor: getCategoryColor(e.type) }}></button>
                        ))}
                        {dayEvents.length > 3 && <div className="text-[8px] text-royal/40 font-bold uppercase tracking-widest px-1">+ {dayEvents.length - 3}</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="grid grid-cols-7 divide-x divide-gold/10">
            {daysInWeek.map((d, i) => {
              const dayEvents = events.filter(e => e.date === d.dateStr);
              const isToday = d.dateStr === formatDateISO(realToday);
              return (
                <div key={i} className={`min-h-[350px] p-6 transition-colors hover:bg-royal/5 ${isToday ? 'bg-gold/5' : ''}`}>
                  <div className="text-center mb-10">
                    <span className={`text-xl font-black transition-all ${isToday ? 'w-12 h-12 flex items-center justify-center mx-auto bg-gold text-white rounded-full shadow-xl' : 'text-royal opacity-30 uppercase tracking-[0.2em]'}`}>
                      {d.day}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {dayEvents.map(e => (
                      <div key={e.id} onClick={() => setSelectedEvent(e)} className="p-4 rounded-sm border-l-[6px] shadow-sm cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-md bg-royal/5" style={{ borderColor: getCategoryColor(e.type) }}>
                        <p className="text-[9px] font-bold text-royal/40 uppercase tracking-widest mb-2 truncate">{e.type}</p>
                        <h6 className="text-[11px] font-bold text-royal leading-tight uppercase line-clamp-2 tracking-tight">{e.title}</h6>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'day' && (
          <div className="p-10 md:p-20 animate-fadeIn bg-white min-h-[400px]">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-10 mb-16 pb-12 border-b-2 border-gold/20">
                <div className="w-24 h-24 bg-gold/10 border-2 border-gold/20 flex flex-col items-center justify-center rounded-sm shadow-sm">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-1">JOUR</span>
                  <span className="text-4xl font-serif font-bold text-royal">{currentDate.getDate()}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-serif font-bold text-gold uppercase tracking-tight">{currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h4>
                  <p className="text-[11px] font-bold text-royal/60 uppercase tracking-widest mt-2">{currentViewEvents.length} événements programmés</p>
                </div>
              </div>

              <div className="space-y-8">
                {currentViewEvents.length > 0 ? (
                  currentViewEvents.map(e => (
                    <div 
                      key={e.id} 
                      onClick={() => setSelectedEvent(e)}
                      className="group cursor-pointer bg-royal/5 p-8 rounded-sm border-l-[8px] transition-all hover:translate-x-2 hover:bg-royal/10 hover:shadow-premium"
                      style={{ borderColor: getCategoryColor(e.type) }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 text-white rounded-sm shadow-sm" style={{ backgroundColor: getCategoryColor(e.type) }}>
                            {e.type}
                          </span>
                          {e.isSurprise && (
                            <span className="text-[9px] font-bold bg-royal/20 text-gold px-2 py-1 rounded-sm flex items-center gap-1">
                              🔒 SURPRISE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-royal/40 uppercase tracking-widest">
                          {e.partner || 'Jean & Monique'}
                        </span>
                      </div>
                      <h5 className="text-2xl font-serif font-bold text-royal uppercase tracking-tight mb-4 group-hover:text-gold transition-colors">
                        {e.title}
                      </h5>
                      {e.description && (
                        <p className="text-royal/70 italic leading-relaxed text-sm">
                          "{e.description}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-royal/5 rounded-sm border-2 border-dashed border-gold/20">
                    <p className="text-royal/40 font-bold uppercase tracking-widest text-sm">Aucun événement pour ce jour</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md animate-fadeIn cursor-pointer" onClick={() => { setSelectedEvent(null); setIsDeleting(false); }}>
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-premium border-t-[10px] p-12 cursor-default relative overflow-hidden border border-gray-100" style={{ borderTopColor: getCategoryColor(selectedEvent.type) }} onClick={e => e.stopPropagation()}>
            <header className="mb-10 flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-5 py-2 text-[10px] font-bold text-white uppercase tracking-widest rounded-sm inline-block" style={{ backgroundColor: getCategoryColor(selectedEvent.type) }}>{selectedEvent.type}</span>
                  {selectedEvent.isSurprise && (
                    <span className="px-3 py-2 text-[10px] font-bold bg-royal text-gold uppercase tracking-widest rounded-sm inline-flex items-center gap-2">
                      🔒 Mode Surprise Actif
                    </span>
                  )}
                </div>
                <h3 className="text-4xl font-serif font-bold text-royal uppercase tracking-tight leading-tight mb-2">{selectedEvent.title}</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{new Date(selectedEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-300 hover:text-royal transition-colors p-3 bg-bgGray rounded-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </header>

            <div className="space-y-10">
              {selectedEvent.imageUrl && <div className="mb-6 shadow-premium rounded-sm overflow-hidden border border-gray-100"><img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-64 object-cover" /></div>}
              <div className="bg-bgGray/50 p-8 rounded-sm border border-gray-100"><h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Description détaillée</h4><p className="text-royal font-medium italic leading-relaxed text-base">"{selectedEvent.description || "Pas de détails pour ce moment."}"</p></div>

              {!isDeleting ? (
                <div className="flex flex-col gap-6 pt-10 border-t border-gray-100 mt-6">
                  <div className="flex items-center justify-between"><div className="flex flex-col"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Responsable</span><span className="text-sm font-bold text-royal uppercase tracking-tight">{selectedEvent.partner || 'Jean & Monique'}</span></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => { onEditEvent(selectedEvent); setSelectedEvent(null); }} className="py-6 border-2 border-royal text-royal text-sm font-bold uppercase tracking-widest hover:bg-royal hover:text-white transition-all shadow-md active:scale-95">MODIFIER L'ÉVÉNEMENT</button>
                    <button onClick={() => setIsDeleting(true)} className="py-6 border-2 border-red-500 text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-md active:scale-95">SUPPRIMER</button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-8 rounded-sm border-2 border-red-100 animate-fadeIn space-y-8"><h4 className="text-[12px] font-bold text-red-600 uppercase tracking-widest text-center">CONFIRMER LA SUPPRESSION ?</h4><div className="flex gap-4"><button onClick={handleDeleteEvent} className="flex-1 py-6 bg-red-500 text-white text-sm font-bold uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all">OUI, SUPPRIMER</button><button onClick={() => setIsDeleting(false)} className="flex-1 py-6 bg-white border-2 border-red-200 text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-50 transition-all">ANNULER</button></div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarHomeView;
