import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Play, Pause, ArrowLeft } from 'lucide-react';
import { PlanningEvent } from '../../types';

interface SlideshowViewProps {
  events: PlanningEvent[];
}

const SlideshowView: React.FC<SlideshowViewProps> = ({ events }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const moments = useMemo(() => {
    return events
      .filter(e => e.type === 'MOMENTS ENSEMBLE' && !!e.imageUrl)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % moments.length);
  }, [moments.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + moments.length) % moments.length);
  }, [moments.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPlaying) {
      timerRef.current = setInterval(nextSlide, 3000);
    }
  }, [isPlaying, nextSlide]);

  useEffect(() => {
    if (moments.length > 0 && isPlaying) {
      timerRef.current = setInterval(nextSlide, 3000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [moments.length, isPlaying, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (moments.length === 0) return;
      if (e.key === 'ArrowRight') {
        nextSlide();
        resetTimer();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        resetTimer();
      } else if (e.key === 'Escape') {
        navigate('/smart-jours/moments');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moments.length, nextSlide, prevSlide, navigate, resetTimer]);

  if (moments.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-sm border border-gray-100 shadow-soft">
        <div className="w-20 h-20 bg-bgGray rounded-full flex items-center justify-center mb-6">
          <X className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest mb-4">Aucun moment à afficher</h3>
        <p className="text-gray-500 mb-8 max-w-md italic">
          Ajoutez des souvenirs avec des images dans la catégorie "Moments Ensemble" pour lancer le diaporama.
        </p>
        <button 
          onClick={() => navigate('/smart-jours/moments')}
          className="px-8 py-4 bg-royal text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-lg flex items-center gap-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux Moments</span>
        </button>
      </div>
    );
  }

  const currentMoment = moments[currentIndex];

  return (
    <div className="animate-fadeIn flex flex-col items-center justify-start min-h-[70vh] bg-white rounded-sm shadow-soft border border-gray-100 p-4 md:p-8 overflow-hidden">
      
      {/* Header Area - Standalone View Style */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/smart-jours/moments')}
            className="p-2 text-gray-400 hover:text-royal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xs font-bold text-royal uppercase tracking-[0.3em]">Diaporama des Moments</h2>
        </div>
        
        <button 
          onClick={() => navigate('/smart-jours/moments')}
          className="text-gray-400 hover:text-royal transition-all hover:scale-110 p-2 bg-bgGray rounded-full shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cinema Stage - Fixed Rectangular Area (Approx 1234x571) */}
      <div className="relative w-full max-w-[1234px] aspect-[1234/571] bg-bgGray rounded-sm overflow-hidden shadow-2xl border border-gray-100 group shrink-0">
        
        {/* Logo Overlay */}
        <div className="absolute top-4 left-4 z-30 flex flex-col items-center pointer-events-none">
          <img 
            src="/img/smartcouple-icon.png" 
            alt="Smart Couple Logo" 
            className="h-8 w-auto drop-shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="h-px w-6 bg-gold/60 mt-1" />
        </div>

        <div className="absolute inset-0">
          {moments.map((m, idx) => (
            <div 
              key={m.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={m.imageUrl} 
                alt={m.title} 
                className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${
                  idx === currentIndex ? 'scale-110' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-gray-100/20 w-full z-20">
          <div 
            className="h-full bg-gold transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(212,175,55,0.4)]"
            style={{ width: `${((currentIndex + 1) / moments.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Footer Area */}
      <div className="w-full max-w-[1234px] mt-8 flex flex-col items-center gap-6 shrink-0">
        
        {/* Title & Date Card */}
        <div 
          key={currentIndex}
          className="animate-fadeInUp flex flex-col items-center"
        >
          <div className="bg-bgGray/50 px-8 py-4 rounded-sm border border-gray-100 shadow-sm text-center">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-royal tracking-tight">
              {currentMoment?.title}
            </h3>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="h-px w-8 bg-gold/40" />
              <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em]">
                {new Date(currentMoment?.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
              <div className="h-px w-8 bg-gold/40" />
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="w-full flex items-center justify-between px-4">
          {/* Counter */}
          <div className="text-gray-400 font-serif italic text-sm tracking-widest bg-bgGray/30 px-4 py-2 rounded-sm border border-gray-100 min-w-[80px] text-center">
            <span className="text-royal font-bold not-italic">{currentIndex + 1}</span> / {moments.length}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { prevSlide(); resetTimer(); }}
              className="p-3 rounded-full bg-white border border-gray-100 text-royal hover:bg-gold hover:text-white hover:border-gold transition-all group shadow-md"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-5 rounded-full bg-royal text-white shadow-xl hover:bg-gold hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button 
              onClick={() => { nextSlide(); resetTimer(); }}
              className="p-3 rounded-full bg-white border border-gray-100 text-royal hover:bg-gold hover:text-white hover:border-gold transition-all group shadow-md"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Spacer for balance */}
          <div className="w-[80px] hidden md:block" />
        </div>
      </div>
    </div>
  );
};

export default SlideshowView;
