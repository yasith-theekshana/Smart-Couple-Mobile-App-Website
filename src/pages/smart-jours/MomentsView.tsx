import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanningEvent, PlanningCategory } from '../../types';
import { X, ChevronLeft, ChevronRight, Play, Pause, Maximize2 } from 'lucide-react';

interface MomentsViewProps {
  events: PlanningEvent[];
  onEditEvent: (event: PlanningEvent) => void;
  categories: PlanningCategory[];
}

const MomentsView: React.FC<MomentsViewProps> = ({ events, onEditEvent, categories }) => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>(null);

  const moments = useMemo(() => {
    return events
      .filter(e => e.type === 'MOMENTS ENSEMBLE')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  const momentsWithImages = useMemo(() => {
    return moments.filter(m => !!m.imageUrl);
  }, [moments]);

  return (
    <div className="animate-fadeIn pb-16">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Intro */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Galerie des Souvenirs</h4>
            <p className="text-sm text-gray-500 italic max-w-lg leading-relaxed">
              Chaque instant partagé construit notre histoire. Retrouvez ici tous vos moments passés et à venir classés dans votre catégorie <span className="text-gold font-bold">MOMENTS ENSEMBLE</span>.
            </p>
          </div>
          
          {momentsWithImages.length > 0 && (
            <button 
              onClick={() => navigate('/smart-jours/slideshow')}
              className="px-8 py-4 bg-royal text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-lg flex items-center gap-3 group"
            >
              <Maximize2 className="w-4 h-4 text-gold group-hover:text-white transition-colors" />
              <span>Lancer le Diaporama</span>
            </button>
          )}
        </div>

        {moments.length === 0 ? (
          <div className="py-24 text-center bg-white border border-dashed border-gray-200 rounded-sm">
             <svg className="w-12 h-12 text-gray-100 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">Aucun souvenir enregistré</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {moments.map(m => {
              const dateObj = new Date(m.date);
              return (
                <div 
                  key={m.id} 
                  onClick={() => setSelectedEvent(m)}
                  className="bg-white rounded-sm shadow-soft border border-gray-50 overflow-hidden group cursor-pointer hover:shadow-premium transition-all hover:-translate-y-1"
                >
                  {/* Photo Container */}
                  <div className="aspect-square relative overflow-hidden bg-bgGray">
                    {m.imageUrl ? (
                      <img 
                        src={m.imageUrl} 
                        alt={m.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                         <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                         <span className="text-[8px] font-bold uppercase tracking-widest mt-2">Pas de photo</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[8px] font-bold text-royal uppercase tracking-tighter">
                      {dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h5 className="text-sm font-bold text-royal uppercase tracking-tight group-hover:text-gold transition-colors mb-2">{m.title}</h5>
                    <p className="text-[10px] text-gray-400 italic line-clamp-2 leading-relaxed">
                      {m.description || "Un moment précieux partagé ensemble."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL VIEW MODAL */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-md animate-fadeIn cursor-pointer"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row cursor-default"
            onClick={e => e.stopPropagation()}
          >
            {/* Left: Image */}
            <div className="md:w-1/2 bg-bgGray flex items-center justify-center overflow-hidden">
               {selectedEvent.imageUrl ? (
                 <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <div className="p-20 text-center text-gray-200">
                    <svg className="w-20 h-20 mx-auto opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] mt-4">Souvenir sans image</p>
                 </div>
               )}
            </div>

            {/* Right: Info */}
            <div className="md:w-1/2 p-10 flex flex-col relative">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 text-gray-300 hover:text-royal transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-grow">
                <span className="text-[9px] font-bold text-gold uppercase tracking-[0.3em] mb-3 block">MOMENT ENSEMBLE</span>
                <h3 className="text-3xl font-serif font-bold text-royal uppercase tracking-tight mb-4">{selectedEvent.title}</h3>
                <div className="flex items-center gap-2 mb-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                   <span>{new Date(selectedEvent.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                <div className="bg-bgGray/50 p-6 rounded-sm border border-gray-100 italic text-sm text-gray-600 leading-relaxed mb-8">
                  "{selectedEvent.description || "Chaque moment passé avec toi est un trésor que je garde précieusement."}"
                </div>

                <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                  Partenaire : <span className="text-royal">{selectedEvent.partner || 'Jean & Monique'}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 flex gap-4">
                <button 
                  onClick={() => { onEditEvent(selectedEvent); setSelectedEvent(null); }}
                  className="flex-1 py-3 bg-royal text-white text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-md"
                >
                  MODIFIER LE SOUVENIR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MomentsView;
