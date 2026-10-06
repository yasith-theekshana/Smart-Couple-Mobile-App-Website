import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, Task } from './MobileTypes';
import { translations, translateTaskName, translateExpenseDesc } from './translations';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'finance' | 'menage' | 'event';
  date: string;
  amount?: number;
  assignedTo?: string;
  category?: string;
}

interface MobileCalendarProps {
  onBack: () => void;
  expenses: Expense[];
  tasks: Task[];
  lang?: 'fr' | 'en';
}

const MobileCalendar: React.FC<MobileCalendarProps> = ({ onBack, expenses, tasks, lang = 'fr' }) => {
  const t = translations[lang || 'fr'];
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDate, setSelectedDate] = useState<string>(new Date(2026, 3, 6).toISOString().split('T')[0]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(selectedDate);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([
    { id: 'ev-1', title: 'Anniversaire Rencontre', type: 'event', date: '2026-04-15' },
    { id: 'ev-2', title: 'Dîner aux chandelles', type: 'event', date: '2026-04-20' },
  ]);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start (0=Mon, 6=Sun)
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // Previous month padding
    const prevMonth = new Date(year, month - 1, 1);
    const daysInPrevMonth = daysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ day: d.getDate(), currentMonth: false, date: formatDate(d) });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ day: i, currentMonth: true, date: formatDate(d) });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ day: i, currentMonth: false, date: formatDate(d) });
    }

    return days;
  }, [currentMonth]);

  const getEventsForDate = (dateStr: string) => {
    const dayExpenses = expenses.filter(e => e.date === dateStr).map(e => ({
      id: e.id,
      title: e.desc,
      type: 'finance' as const,
      amount: e.amt,
      assignedTo: e.owner,
      category: e.cat,
      date: e.date
    }));
    
    const dayTasks = tasks.map(t => {
        if (t.isRecurrent) {
            const tDate = new Date(t.date);
            const checkDate = new Date(dateStr);
            if (tDate.getDay() === checkDate.getDay() && checkDate >= tDate) {
                return {
                    id: `${t.id}-${dateStr}`,
                    title: t.name,
                    type: 'menage' as const,
                    assignedTo: t.assignedTo,
                    category: t.category,
                    date: dateStr
                };
            }
        } else if (t.date === dateStr) {
            return {
                id: t.id,
                title: t.name,
                type: 'menage' as const,
                assignedTo: t.assignedTo,
                category: t.category,
                date: dateStr
            };
        }
        return null;
    }).filter(Boolean) as CalendarEvent[];

    const dayEvents = customEvents.filter(e => e.date === dateStr);

    return [...dayExpenses, ...dayTasks, ...dayEvents];
  };

  const selectedDayEvents = useMemo(() => getEventsForDate(selectedDate), [selectedDate, expenses, tasks, customEvents]);

  const handleAddEvent = () => {
    if (newEventTitle) {
      const newEv: CalendarEvent = {
        id: Date.now().toString(),
        title: newEventTitle,
        type: 'event',
        date: newEventDate
      };
      setCustomEvents([...customEvents, newEv]);
      setNewEventTitle('');
      setIsEventModalOpen(false);
      setSelectedDate(newEventDate);
    }
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      setCustomEvents(customEvents.filter(e => e.id !== eventToDelete));
      setEventToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative no-scrollbar">
      {/* Header */}
      <div className="px-6 pt-4 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-royal">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h1 className="text-2xl font-serif font-bold text-royal">{t.tabCalendar}</h1>
          </div>
          <button 
            onClick={() => {
                setNewEventDate(selectedDate);
                setIsEventModalOpen(true);
            }}
            className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-white shadow-soft transition-transform active:scale-90"
          >
            <i className="fa-solid fa-plus font-bold"></i>
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-bgGray rounded-2xl p-4 border-2 border-gold/10 mb-6 font-bold uppercase tracking-widest text-[11px] text-royal">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="capitalize">{currentMonth.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 mb-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {(lang === 'fr' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(d => (
            <span key={d} className="text-[9px] font-bold text-gold uppercase text-center">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((dayObj, idx) => {
            const isSelected = selectedDate === dayObj.date;
            const events = getEventsForDate(dayObj.date);
            const hasFinance = events.some(e => e.type === 'finance');
            const hasMenage = events.some(e => e.type === 'menage');
            const hasEvent = events.some(e => e.type === 'event');

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(dayObj.date);
                  setIsSheetOpen(true);
                }}
                className={`relative h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                  dayObj.currentMonth ? 'text-royal' : 'text-royal/20'
                } ${
                  isSelected ? 'bg-royal text-white shadow-lg scale-105 z-10' : 'bg-white border-4 border-gold/20'
                }`}
              >
                <span className="text-[11px] font-bold">{dayObj.day}</span>
                <div className="flex gap-0.5 mt-1">
                  {hasFinance && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-gold'}`}></div>}
                  {hasMenage && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-gold' : 'bg-royal'}`}></div>}
                  {hasEvent && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-400'}`}></div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Bottom Activity Sheet */}
      <AnimatePresence>
        {isSheetOpen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute bottom-0 left-0 right-0 top-[64px] bg-bgGray border-t border-gold/40 rounded-t-[40px] z-[500] shadow-[0_-12px_36px_rgba(31,78,121,0.15)] no-scrollbar flex flex-col"
          >
            <div className="w-full pt-4 pb-4 shrink-0 flex flex-col items-center">
                <div className="w-10 h-1 bg-gold/30 rounded-full mb-1"></div>
                <div className="w-6 h-1 bg-gold/10 rounded-full"></div>
            </div>
            
            <div className="px-6 flex items-center justify-between mb-5 shrink-0">
                <div className="flex flex-col text-left">
                  <h3 className="text-[12px] font-bold text-royal uppercase tracking-wider leading-tight">
                    {new Date(selectedDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <span className="text-[8px] font-black tracking-widest text-gold uppercase mt-0.5">
                    {selectedDayEvents.length} {lang === 'fr' ? 'activités' : 'activities'}
                  </span>
                </div>
                
                <button 
                  onClick={() => setIsSheetOpen(false)}
                  className="px-3 py-1.5 bg-royal/10 text-royal hover:bg-royal/15 active:scale-95 transition-all text-[9px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5"
                >
                  <span>{t.close}</span>
                  <i className="fa-solid fa-xmark text-[9px]"></i>
                </button>
            </div>

            <div className="px-6 space-y-3 flex-grow overflow-y-auto no-scrollbar pb-24">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event, idx) => {
                  const displayTitle = event.type === 'finance' 
                    ? translateExpenseDesc(event.title, lang) 
                    : (event.type === 'menage' ? translateTaskName(event.title, lang) : event.title);
                  return (
                    <div key={idx} className="bg-white p-4 rounded-2xl border-2 border-gold/5 shadow-soft flex items-center justify-between relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 w-1 h-full ${event.type === 'finance' ? 'bg-gold' : event.type === 'menage' ? 'bg-royal' : 'bg-pink-400'}`}></div>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${event.type === 'finance' ? 'bg-gold/10 text-gold' : event.type === 'menage' ? 'bg-royal/5 text-royal' : 'bg-pink-50 text-pink-400'}`}>
                          <i className={`fa-solid ${event.type === 'finance' ? 'fa-wallet' : event.type === 'menage' ? 'fa-broom' : 'fa-heart'} text-sm`}></i>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[13px] font-bold text-royal leading-tight">{displayTitle}</span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                              {event.assignedTo ? `${event.assignedTo} • ` : ''}
                              {event.type === 'finance' ? 'Finance' : event.type === 'menage' ? (lang === 'fr' ? 'Ménage' : 'Chore') : (lang === 'fr' ? 'Spécial' : 'Special')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {event.amount && <span className="text-[12px] font-bold text-royal lining-nums">{event.amount.toFixed(2)}€</span>}
                        {event.type === 'event' && (
                            <button 
                                onClick={() => {
                                    setEventToDelete(event.id);
                                    setIsConfirmDeleteOpen(true);
                                }} 
                                className="text-gray-300 hover:text-red-400 transition-colors opacity-100"
                            >
                                <i className="fa-solid fa-trash-can text-[10px]"></i>
                            </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center opacity-45">
                  <i className="fa-solid fa-calendar-day text-4xl mb-4 text-royal"></i>
                  <p className="text-[10px] font-bold text-royal tracking-widest uppercase">
                    {lang === 'fr' ? 'Aucun événement prévu' : 'No activities scheduled'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Special Event Modal */}
      <AnimatePresence>
        {isEventModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[2000] bg-royal/40 backdrop-blur-sm flex items-end" onClick={() => setIsEventModalOpen(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="w-full bg-white rounded-t-[40px] p-8 shadow-premium border-t-4 border-gold" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest mb-1">
                    {lang === 'fr' ? 'Jour Important' : 'Special Date'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {lang === 'fr' ? 'Marquer une date spéciale' : 'Highlight a special day'}
                  </p>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          {lang === 'fr' ? 'Événement' : 'Event Title'}
                        </label>
                        <input type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder={lang === 'fr' ? "Ex: Anniversaire, Vacances..." : "E.g: Anniversary, Vacation..."} className="w-full px-6 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-sm text-royal outline-none font-bold"/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                        <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full px-6 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-sm text-royal outline-none font-bold"/>
                    </div>
                    <button onClick={handleAddEvent} className="w-full py-4 bg-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl">
                      {lang === 'fr' ? 'AJOUTER' : 'ADD DATE'}
                    </button>
                    <button onClick={() => setIsEventModalOpen(false)} className="w-full py-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-royal transition-colors text-center font-bold">
                      {t.finCancel}
                    </button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[3000] bg-royal/80 backdrop-blur-md flex items-center justify-center p-6"
                onClick={() => setIsConfirmDeleteOpen(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl border-4 border-gold"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-trash-can text-red-400 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest">
                          {lang === 'fr' ? 'Confirmer la suppression' : 'Confirm Deletion'}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-4">
                          {lang === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce jour important ?' : 'Are you sure you want to remove this important date?'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsConfirmDeleteOpen(false)}
                            className="flex-1 py-4 border-2 border-gold/20 text-royal/40 text-[10px] font-bold uppercase tracking-widest rounded-2xl"
                        >
                            {t.finCancel}
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-4 bg-red-400 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-lg"
                        >
                            {lang === 'fr' ? 'Supprimer' : 'Delete'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileCalendar;
