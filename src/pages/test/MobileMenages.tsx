import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from './MobileTypes';
import { translations, translateCategory, translateTaskName } from './translations';

const DEFAULT_CATEGORIES = [
  { id: 'cuisine', name: 'Cuisine', icon: 'fa-utensils', color: 'bg-orange-500' },
  { id: 'salon', name: 'Salon', icon: 'fa-couch', color: 'bg-blue-500' },
  { id: 'chambre', name: 'Chambre', icon: 'fa-bed', color: 'bg-indigo-600' },
  { id: 'salle-de-bain', name: 'Salle de bain', icon: 'fa-sink', color: 'bg-cyan-500' },
  { id: 'jardin', name: 'Jardin', icon: 'fa-leaf', color: 'bg-green-500' },
  { id: 'vetements', name: 'Vêtements', icon: 'fa-shirt', color: 'bg-pink-500' },
  { id: 'autres', name: 'Autres', icon: 'fa-ellipsis', color: 'bg-gray-500' },
];

interface MobileMenagesProps {
  onBack: () => void;
  initialView?: 'dashboard' | 'upcoming' | 'completed';
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  lang?: 'fr' | 'en';
}

const MobileMenages: React.FC<MobileMenagesProps> = ({ onBack, initialView = 'dashboard', tasks, setTasks, lang = 'fr' }) => {
  const t = translations[lang || 'fr'];
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 6)); // April 6th, 2026
  const [categories, setCategories] = useState([...DEFAULT_CATEGORIES]);

  const [view, setView] = useState<'dashboard' | 'upcoming' | 'completed'>(initialView);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isTaskOptionsOpen, setIsTaskOptionsOpen] = useState(false);
  const [selectedTaskForOptions, setSelectedTaskForOptions] = useState<Task | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(true);

  // Modal State
  const [newTask, setNewTask] = useState({
    name: '',
    category: '',
    assignedTo: 'Jean' as 'Jean' | 'Monique' | 'Jean & Monique',
    date: new Date().toISOString().split('T')[0],
    isRecurrent: false
  });

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay() || 7;
    if (day !== 1) start.setHours(-24 * (day - 1));
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const format = (d: Date) => {
      const dayDigits = d.getDate().toString().padStart(2, '0');
      const monthDigits = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${dayDigits}/${monthDigits}`;
    };

    const fullFormat = (d: Date) => {
      const dayDigits = d.getDate().toString().padStart(2, '0');
      const monthNamesFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
      const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = lang === 'fr' ? monthNamesFr[d.getMonth()] : monthNamesEn[d.getMonth()];
      return `${dayDigits} ${month}`;
    };

    return {
      short: `${format(start)} - ${format(end)}`,
      long: lang === 'fr' ? `Semaine du ${fullFormat(start)} au ${fullFormat(end)}` : `Week of ${fullFormat(start)} to ${fullFormat(end)}`
    };
  };

  const changeWeek = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + delta * 7);
    setCurrentDate(newDate);
  };

  const weekRange = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay() || 7;
    if (day !== 1) start.setHours(-24 * (day - 1));
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }, [currentDate]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    result = result.filter(t => {
      if (t.isRecurrent) return true;
      const taskDate = new Date(t.date);
      return taskDate >= weekRange.start && taskDate <= weekRange.end;
    });

    if (view === 'upcoming') {
      result = result.filter(t => t.status === 'À faire');
    } else if (view === 'completed') {
      result = result.filter(t => t.status === 'Terminé');
    }

    if (selectedCategory && view === 'dashboard') {
      result = result.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    return result;
  }, [tasks, view, selectedCategory, weekRange]);

  const handleCreateTask = () => {
    if (editingTaskId) {
      setTasks(tasks.map(t => t.id === editingTaskId ? {
        ...t,
        name: newTask.name,
        category: newTask.category || 'Autres',
        assignedTo: newTask.assignedTo,
        date: newTask.date,
        isRecurrent: newTask.isRecurrent
      } : t));
    } else {
      const task: Task = {
        id: Date.now().toString(),
        name: newTask.name,
        category: newTask.category || 'Autres',
        assignedTo: newTask.assignedTo,
        date: newTask.date,
        status: 'À faire',
        isRecurrent: newTask.isRecurrent
      };
      setTasks([...tasks, task]);
    }
    setIsModalOpen(false);
    setModalStep(1);
    setEditingTaskId(null);
    setNewTask({ name: '', category: '', assignedTo: 'Jean', date: new Date().toISOString().split('T')[0], isRecurrent: false });
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask({
      name: task.name,
      category: task.category,
      assignedTo: task.assignedTo,
      date: task.date,
      isRecurrent: task.isRecurrent || false
    });
    setIsReadOnly(false);
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddCategory = () => {
    if (newCatName) {
      const newCat = {
        id: newCatName.toLowerCase().replace(/\s+/g, '-'),
        name: newCatName,
        icon: 'fa-star',
        color: 'bg-royal'
      };
      setCategories([...categories, newCat]);
      setNewCatName('');
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (!DEFAULT_CATEGORIES.find(c => c.id === id)) {
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCategory === categories.find(c => c.id === id)?.name) {
        setSelectedCategory(null);
      }
    }
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Terminé' ? 'À faire' : 'Terminé' } : t));
  };

  const weekInfo = getWeekRange(currentDate);

  return (
    <div className="h-full flex flex-col bg-white relative no-scrollbar">
      {/* Header */}
      <div className="px-6 pt-4 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="text-royal">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h1 className="text-2xl font-serif font-bold text-royal">{t.tabMenages}</h1>
        </div>

        {/* Top Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { id: 'dashboard', label: lang === 'fr' ? 'Semaine' : 'Weekly', icon: 'fa-calendar-week' },
            { id: 'create', label: lang === 'fr' ? 'Créer' : 'Create', icon: 'fa-plus' },
            { id: 'upcoming', label: t.tskUpcoming, icon: 'fa-clock' },
            { id: 'completed', label: t.tskCompleted, icon: 'fa-check-double' },
          ].map(btn => {
            const isActive = (view === btn.id) || (btn.id === 'dashboard' && view === 'dashboard');
            return (
              <button 
                key={btn.id}
                onClick={() => {
                  if (btn.id === 'dashboard') { setView('dashboard'); setSelectedCategory(null); }
                  else if (btn.id === 'create') {
                    setEditingTaskId(null);
                    setNewTask({ name: '', category: '', assignedTo: 'Jean', date: new Date().toISOString().split('T')[0], isRecurrent: false });
                    setIsReadOnly(false);
                    setModalStep(1);
                    setIsModalOpen(true);
                  }
                  else if (btn.id === 'upcoming') { setView('upcoming'); setSelectedCategory(null); }
                  else if (btn.id === 'completed') { setView('completed'); setSelectedCategory(null); }
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all border-2 ${
                  isActive 
                  ? 'bg-royal border-royal text-white shadow-md' 
                  : 'bg-white border-gold text-gold shadow-sm'
                }`}
              >
                <i className={`fa-solid ${btn.icon} text-[11px] mb-1 ${isActive ? 'text-white' : 'text-royal'}`}></i>
                <span className={`text-[7px] font-bold uppercase tracking-tighter text-center leading-none ${isActive ? 'text-white' : 'text-gold'}`}>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-bgGray rounded-2xl p-4 shadow-soft mb-6 border-2 border-gold/10">
          <button onClick={() => changeWeek(-1)} className="text-royal/40 hover:text-gold transition-colors">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="text-[10px] font-bold text-royal tracking-widest uppercase">
            {weekInfo.long}
          </span>
          <button onClick={() => changeWeek(1)} className="text-royal/40 hover:text-gold transition-colors">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow px-6 pb-8 overflow-y-auto no-scrollbar">
        {view === 'dashboard' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                {lang === 'fr' ? 'Zones / Pièces' : 'Rooms & Areas'}
              </h3>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="text-[9px] font-bold text-gold uppercase tracking-widest border-b border-gold/30">
                  {lang === 'fr' ? 'Effacer' : 'Clear'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {categories.map(cat => {
                const isDefault = DEFAULT_CATEGORIES.find(c => c.id === cat.id);
                return (
                  <div key={cat.id} className="relative group">
                    <button 
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${selectedCategory === cat.name ? 'bg-royal shadow-lg scale-105' : 'bg-white border-2 border-gold/10 shadow-soft'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center text-white text-xs shadow-sm`}>
                        <i className={`fa-solid ${cat.icon}`}></i>
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-tighter text-center ${selectedCategory === cat.name ? 'text-white' : 'text-royal/60'}`}>
                        {translateCategory(cat.name, lang)}
                      </span>
                    </button>
                    {!isDefault && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-md transition-transform active:scale-95"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-col gap-2">
              {isAddingCategory ? (
                <div className="flex gap-2 animate-fadeIn">
                  <input 
                    type="text" 
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder={lang === 'fr' ? "Nom de la zone..." : "Area/Room Name..."}
                    className="flex-grow bg-white border-2 border-gold rounded-xl px-4 py-2 text-[10px] outline-none font-bold text-royal"
                    autoFocus
                  />
                  <button onClick={handleAddCategory} className="px-4 py-2 bg-gold text-white rounded-xl text-[10px] font-bold uppercase">OK</button>
                  <button onClick={() => setIsAddingCategory(false)} className="px-4 py-2 bg-bgGray text-gray-400 rounded-xl text-[10px] font-bold uppercase">X</button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full py-4 border-2 border-dashed border-gold/40 rounded-2xl text-[9px] font-bold text-royal/40 uppercase tracking-widest hover:bg-gold/5 transition-all"
                >
                  {lang === 'fr' ? 'Ajouter une zone +' : 'Add Category +'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              {view === 'upcoming' ? (lang === 'fr' ? 'À Faire' : 'To Do') : view === 'completed' ? (lang === 'fr' ? 'Terminé' : 'Completed') : (lang === 'fr' ? 'Tâches Hebdomadaires' : 'Weekly Tasks')}
            </h3>
            <span className="text-[9px] font-bold text-royal/40 uppercase tracking-widest">
              {filteredTasks.length} {lang === 'fr' ? (filteredTasks.length > 1 ? 'Tâches' : 'Tâche') : (filteredTasks.length > 1 ? 'Tasks' : 'Task')}
            </span>
          </div>

          <div className="space-y-3">
            {filteredTasks.map(task => (
              <motion.div 
                layout
                key={task.id} 
                className={`bg-white border-2 border-gold/10 rounded-2xl shadow-soft flex items-center overflow-hidden transition-all relative ${task.status === 'Terminé' ? 'bg-gold/5' : ''}`}
                onClick={() => {
                  setSelectedTaskForOptions(task);
                  setIsTaskOptionsOpen(true);
                }}
              >
                <div className={`w-1.5 h-full absolute left-0 top-0 bottom-0 ${task.status === 'Terminé' ? 'bg-gold' : 'bg-royal'}`}></div>
                <div className={`flex-grow p-4 flex items-center justify-between gap-4 ${task.status === 'Terminé' ? 'pr-24' : ''}`}>
                  <div className="flex items-center gap-4 flex-grow overflow-hidden">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id); }}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${task.status === 'Terminé' ? 'bg-gold border-gold' : 'border-gold/30'}`}
                    >
                      {task.status === 'Terminé' && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </button>
                    
                    <div className="flex text-left flex-col flex-grow overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[12px] font-bold text-royal leading-tight truncate ${task.status === 'Terminé' ? 'opacity-60' : ''}`}>
                          {translateTaskName(task.name, lang)}
                        </span>
                        {task.isRecurrent && <i className="fa-solid fa-repeat text-[8px] text-gold"></i>}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold bg-gold text-white uppercase tracking-widest mb-1 w-fit ${task.status === 'Terminé' ? 'opacity-60' : ''}`}>
                          {task.assignedTo === 'Jean & Monique' && lang === 'en' ? 'Jean & Monique' : task.assignedTo}
                        </span>
                        <div className={`flex items-center gap-2 ${task.status === 'Terminé' ? 'opacity-60' : ''}`}>
                          <span className="text-[8px] text-gray-400 uppercase tracking-widest font-black">
                            {translateCategory(task.category, lang)}
                          </span>
                          <span className="text-[8px] text-gold font-bold">
                            {task.date.split('-').reverse().slice(0,2).join('/')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Elegant Terminé Badge with 2 ticks on the far right */}
                  {task.status === 'Terminé' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gold text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1 shrink-0 shadow-sm border border-white">
                      <span className="text-[9px] font-black uppercase tracking-wider">
                        {lang === 'fr' ? 'Terminé' : 'Done'}
                      </span>
                      <i className="fa-solid fa-check-double text-[10px]"></i>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-16">
                <i className="fa-solid fa-sparkles text-gold/10 text-5xl mb-4"></i>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  {lang === 'fr' ? 'Tout est propre !' : 'All clean and tidy!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] bg-royal/40 backdrop-blur-sm flex items-end"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full bg-white rounded-t-[40px] p-8 shadow-premium border-t-4 border-gold"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
              {modalStep === 1 ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest mb-2">
                      {editingTaskId ? (lang === 'fr' ? 'Modifier Tâche' : 'Edit Task') : (lang === 'fr' ? 'Nouvelle Tâche' : 'New Task')}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {lang === 'fr' ? 'Étape 1: Zone & Nom' : 'Step 1: Category & Name'}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {categories.map(cat => (
                      <button key={cat.id} disabled={isReadOnly} onClick={() => { setNewTask({ ...newTask, category: cat.name }); }} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${newTask.category === cat.name ? 'bg-gold shadow-lg scale-105' : 'bg-bgGray border-2 border-transparent'}`}>
                        <div className={`w-8 h-8 rounded-lg ${newTask.category === cat.name ? 'bg-white text-gold' : cat.color + ' text-white'} flex items-center justify-center text-xs shadow-sm`}><i className={`fa-solid ${cat.icon}`}></i></div>
                        <span className={`text-[8px] font-bold uppercase tracking-tighter text-center ${newTask.category === cat.name ? 'text-white' : 'text-royal/60'}`}>
                          {translateCategory(cat.name, lang)}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      {lang === 'fr' ? 'Nom de la Tâche' : 'Task Name'}
                    </label>
                    <input 
                      type="text" 
                      readOnly={isReadOnly} 
                      value={newTask.name} 
                      onChange={e => setNewTask({ ...newTask, name: e.target.value })} 
                      placeholder={lang === 'fr' ? "Ex: Laver le micro-ondes" : "E.g: Clean the kitchen table"} 
                      className="w-full px-6 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-sm text-royal outline-none font-bold"
                    />
                  </div>
                  <button onClick={() => setModalStep(2)} disabled={!newTask.category || !newTask.name} className="w-full py-4 bg-gold text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">
                    {lang === 'fr' ? 'CONTINUER' : 'CONTINUE'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest mb-2">
                      {lang === 'fr' ? 'Attribution & Date' : 'Assignee & Due Date'}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {lang === 'fr' ? 'Étape 2: Qui & Quand' : 'Step 2: Who & When'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      {lang === 'fr' ? 'Responsable' : 'Assignee'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Jean', 'Monique', 'Jean & Monique'].map(person => (
                        <button key={person} onClick={() => setNewTask({ ...newTask, assignedTo: person as any })} className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${newTask.assignedTo === person ? 'bg-royal text-white shadow-md' : 'bg-bgGray text-royal/40'}`}>{person}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                      <input type="date" value={newTask.date} onChange={e => setNewTask({ ...newTask, date: e.target.value })} className="w-full px-4 py-4 bg-bgGray border-2 border-gold/20 rounded-2xl text-xs text-royal outline-none font-bold"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        {lang === 'fr' ? 'Récurrence' : 'Recurrence'}
                      </label>
                      <button onClick={() => setNewTask({ ...newTask, isRecurrent: !newTask.isRecurrent })} className={`w-full py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${newTask.isRecurrent ? 'bg-gold text-white' : 'bg-bgGray text-royal/40'}`}><i className="fa-solid fa-repeat"></i>
                        {newTask.isRecurrent ? (lang === 'fr' ? 'Chaque semaine' : 'Weekly') : (lang === 'fr' ? 'Une fois' : 'Once')}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setModalStep(1)} className="flex-1 py-4 border-2 border-gold text-royal/40 text-[10px] font-bold uppercase tracking-widest rounded-2xl">
                      {lang === 'fr' ? 'Retour' : 'Back'}
                    </button>
                    <button onClick={handleCreateTask} className="flex-1 py-4 bg-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl">
                      {lang === 'fr' ? 'VALIDER' : 'CONFIRM'}
                    </button>
                  </div>
                </div>
              )}
              <button onClick={() => setIsModalOpen(false)} className="w-full mt-6 py-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-royal transition-colors text-center">
                {t.finCancel}
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {isTaskOptionsOpen && selectedTaskForOptions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[2000] bg-royal/40 backdrop-blur-sm flex items-end" onClick={() => setIsTaskOptionsOpen(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="w-full bg-white rounded-t-[40px] p-8 shadow-premium border-t-4 border-gold" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-serif font-bold text-royal uppercase tracking-widest mb-2">
                    {lang === 'fr' ? 'Options de Tâche' : 'Task Options'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translateTaskName(selectedTaskForOptions.name, lang)}</p>
                </div>
                <button onClick={() => { setIsTaskOptionsOpen(false); handleEditTask(selectedTaskForOptions); }} className="w-full py-4 bg-royal text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-lg flex items-center justify-center gap-3"><i className="fa-solid fa-pen-to-square"></i>
                  {lang === 'fr' ? 'Modifier tâche' : 'Edit Task'}
                </button>
                <button onClick={() => { handleDeleteTask(selectedTaskForOptions.id); setIsTaskOptionsOpen(false); }} className="w-full py-4 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3"><i className="fa-solid fa-trash-can"></i>
                  {lang === 'fr' ? 'Supprimer définitivement' : 'Delete Task'}
                </button>
                <button onClick={() => setIsTaskOptionsOpen(false)} className="w-full py-4 border-2 border-gold/20 text-royal/40 text-[10px] font-bold uppercase tracking-widest rounded-2xl">
                  {t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenages;
