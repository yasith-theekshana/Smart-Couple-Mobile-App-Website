import React from 'react';
import { motion } from 'motion/react';
import { Article } from './MobileTypes';
import { translations } from './translations';

interface MobileHomeProps {
  setActiveTab: (tab: 'menu' | 'finances' | 'courses' | 'menages' | 'calendar') => void;
  setIsProfileMenuOpen: (open: boolean) => void;
  profilePhoto: string;
  onViewAllArticles: () => void;
  onSelectArticle: (id: string) => void;
  featuredArticle: Article;
  lang?: 'fr' | 'en';
}

const MobileHome: React.FC<MobileHomeProps> = ({ 
  setActiveTab, 
  setIsProfileMenuOpen, 
  profilePhoto,
  onViewAllArticles,
  onSelectArticle,
  featuredArticle,
  lang = 'fr'
}) => {
  const t = translations[lang];

  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col px-6 pt-4 pb-8 overflow-y-auto no-scrollbar"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gold tracking-[0.2em] uppercase">{t.welcome}</span>
          <h1 className="text-xl font-serif font-bold text-royal">Florian & Shopie</h1>
        </div>
        <button 
          onClick={() => setIsProfileMenuOpen(true)}
          className="w-10 h-10 rounded-full bg-bgGray border-2 border-gold overflow-hidden shadow-soft transition-transform active:scale-95"
        >
          <img 
            src={profilePhoto} 
            alt="Couple Profile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>

      {/* Section 1: Responsabilités */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 ml-1">
          {t.responsibilities}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('finances')}
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gold p-5 rounded-2xl shadow-soft hover:border-gold/60 transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-royal/5 flex items-center justify-center group-hover:bg-royal/10 transition-colors">
              <i className="fa-solid fa-wallet text-royal text-lg"></i>
            </div>
            <span className="text-[11px] font-bold text-royal uppercase tracking-widest">{t.tabFinances}</span>
          </button>
          <button 
            onClick={() => setActiveTab('menages')}
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gold p-5 rounded-2xl shadow-soft hover:border-gold/60 transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-royal/5 flex items-center justify-center group-hover:bg-royal/10 transition-colors">
              <i className="fa-solid fa-broom text-royal text-lg"></i>
            </div>
            <span className="text-[11px] font-bold text-royal uppercase tracking-widest">{t.tabMenages}</span>
          </button>
        </div>
      </div>

      {/* Section 2: Supplémentaires */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 ml-1">
          {t.extras}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('courses')}
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gold p-5 rounded-2xl shadow-soft hover:border-gold/60 transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-royal/5 flex items-center justify-center group-hover:bg-royal/10 transition-colors">
              <i className="fa-solid fa-cart-shopping text-royal text-lg"></i>
            </div>
            <span className="text-[11px] font-bold text-royal uppercase tracking-widest text-center leading-tight">{t.tabCourses}</span>
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gold p-5 rounded-2xl shadow-soft hover:border-gold/60 transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-royal/5 flex items-center justify-center group-hover:bg-royal/10 transition-colors">
              <i className="fa-solid fa-calendar-days text-royal text-lg"></i>
            </div>
            <span className="text-[11px] font-bold text-royal uppercase tracking-widest">{t.tabCalendar}</span>
          </button>
        </div>
      </div>

      {/* Section 3: Articles */}
      <div className="mb-6 pb-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
            {t.articles}
          </h3>
          <button 
            onClick={onViewAllArticles}
            className="text-[10px] font-bold text-gold uppercase tracking-widest border-b-2 border-gold pb-0.5"
          >
            {t.viewAll}
          </button>
        </div>
        
        <div 
          onClick={() => onSelectArticle(featuredArticle.id)}
          className="bg-white border-2 border-gold rounded-3xl overflow-hidden shadow-soft group cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="relative h-40 overflow-hidden">
            <img 
              src={featuredArticle.image} 
              alt={featuredArticle.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-royal/60 to-transparent opacity-60"></div>
            <span className="absolute bottom-4 left-4 px-3 py-1.5 bg-gold text-white text-[8px] font-bold tracking-widest uppercase rounded-sm">
              {lang === 'fr' ? featuredArticle.category : (featuredArticle.category === 'Communication' ? 'Communication' : 'Wellness')}
            </span>
          </div>
          <div className="p-5">
            <h4 className="text-royal font-serif font-bold text-lg mb-2 leading-tight">
              {lang === 'fr' ? featuredArticle.title : (featuredArticle.id === 'ecoute-active' ? 'Active Listening as a Couple' : featuredArticle.title)}
            </h4>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-4 line-clamp-2">
              {lang === 'fr' ? featuredArticle.excerpt : (featuredArticle.id === 'ecoute-active' ? 'Discover how practicing active listening can strengthen your emotional connections and avoid unnecessary misunderstandings.' : featuredArticle.excerpt)}
            </p>
            <button className="flex items-center gap-2 text-[10px] font-bold text-royal uppercase tracking-[0.2em] group/btn">
              <span className="border-b-2 border-gold pb-0.5 group-hover/btn:text-gold transition-colors">{t.readArticle}</span>
              <i className="fa-solid fa-arrow-right text-[8px] transition-transform group-hover/btn:translate-x-1"></i>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileHome;
