import React, { useState, useMemo } from 'react';
import { PlanningEvent } from '../../types';

interface ImportantDaysViewProps {
  events: PlanningEvent[];
  onEditEvent: (event: PlanningEvent) => void;
}

const ImportantDaysView: React.FC<ImportantDaysViewProps> = ({ events, onEditEvent }) => {
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('smart_notifications');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleNotification = (id: string) => {
    const updated = { ...notifications, [id]: !notifications[id] };
    setNotifications(updated);
    localStorage.setItem('smart_notifications', JSON.stringify(updated));
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const importantEvents = useMemo(() => {
    return events
      .filter(e => e.type === 'JOURS IMPORTANT' || e.type === 'ANNIVERSAIRE')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return importantEvents.filter(e => new Date(e.date) >= now);
  }, [importantEvents, now]);

  const pastEvents = useMemo(() => {
    return importantEvents.filter(e => new Date(e.date) < now).reverse();
  }, [importantEvents, now]);

  return (
    <div className="animate-fadeIn pb-20 max-w-4xl mx-auto">
      
      {/* HEADER SECTION */}
      <section className="text-center mb-16">
        <h4 className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-4">Agenda des Célébrations</h4>
        <p className="text-sm text-gray-500 italic leading-relaxed max-w-lg mx-auto">
          Ne laissez plus passer les moments qui comptent. Retrouvez ici tous vos <span className="text-gold font-bold">Anniversaires</span> et vos <span className="text-royal font-bold">Jours Importants</span>.
        </p>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <h3 className="text-sm font-bold text-royal uppercase tracking-widest whitespace-nowrap">À Venir Prochainement</h3>
          <div className="h-px bg-gold/20 flex-grow"></div>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="py-12 text-center bg-bgGray/30 rounded-sm border border-dashed border-gray-200">
             <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Aucun événement à venir prévu</p>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingEvents.map((e, idx) => {
              const eventDate = new Date(e.date);
              const isFirst = idx === 0;
              return (
                <div 
                  key={e.id}
                  className={`group bg-white p-8 rounded-sm shadow-soft border transition-all hover:shadow-premium cursor-pointer relative overflow-hidden ${
                    isFirst ? 'border-gold border-l-[6px]' : 'border-gray-50 border-l-[6px] border-l-royal/20'
                  }`}
                  onClick={() => onEditEvent(e)}
                >
                  {isFirst && (
                    <div className="absolute top-0 right-0 bg-gold text-white text-[8px] font-bold px-4 py-1.5 uppercase tracking-widest transform translate-x-[20%] translate-y-[50%] rotate-45 shadow-sm">
                      Prochain
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className={`w-14 h-14 rounded-sm flex flex-col items-center justify-center transition-colors ${
                        isFirst ? 'bg-gold text-white shadow-md' : 'bg-bgGray text-royal border border-gray-100'
                      }`}>
                        <span className="text-[8px] font-bold uppercase opacity-80">{eventDate.toLocaleString('fr-FR', { month: 'short' })}</span>
                        <span className="text-xl font-serif font-bold">{eventDate.getDate()}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${e.type === 'ANNIVERSAIRE' ? 'text-gold' : 'text-royal'}`}>
                            {e.type}
                          </span>
                        </div>
                        <h4 className={`text-xl font-serif font-bold uppercase tracking-tight ${isFirst ? 'text-royal' : 'text-royal/80 group-hover:text-gold transition-colors'}`}>
                          {e.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 italic uppercase tracking-tighter">Implique : {e.partner || 'Jean & Monique'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(ev) => {
                          ev.stopPropagation();
                          toggleNotification(e.id);
                        }}
                        className={`p-3 rounded-full border transition-all ${
                          notifications[e.id] 
                            ? 'bg-gold/10 border-gold text-gold shadow-sm' 
                            : 'border-gray-100 text-gray-200 hover:text-gold hover:border-gold/30'
                        }`}
                        title={notifications[e.id] ? 'Notification active' : 'Activer le rappel'}
                      >
                        <svg className={`w-5 h-5 ${notifications[e.id] ? 'animate-bounce' : ''}`} fill={notifications[e.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                      </button>
                      <div className="text-gray-100 group-hover:text-gold transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PAST EVENTS */}
      <section>
        <div className="flex items-center gap-4 mb-10">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">Passés & Souvenirs</h3>
          <div className="h-px bg-gray-100 flex-grow"></div>
        </div>

        <div className="space-y-4">
          {pastEvents.map(e => {
            const date = new Date(e.date);
            return (
              <div 
                key={e.id}
                onClick={() => onEditEvent(e)}
                className="bg-white p-6 rounded-sm border border-gray-50 flex items-center justify-between opacity-60 hover:opacity-100 transition-all hover:bg-bgGray/30 cursor-pointer shadow-sm group"
              >
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[50px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">{date.getDate()}</p>
                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{date.toLocaleString('fr-FR', { month: 'short' })}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest block mb-0.5">{e.type}</span>
                    <h5 className="text-sm font-bold text-royal group-hover:text-gold transition-colors">{e.title}</h5>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{date.getFullYear()}</div>
              </div>
            );
          })}

          {pastEvents.length === 0 && (
            <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest italic py-8">L'histoire est en marche...</p>
          )}
        </div>
      </section>

    </div>
  );
};

export default ImportantDaysView;
