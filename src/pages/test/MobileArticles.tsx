import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, translateArticle } from './translations';

interface MobileArticlesProps {
  articles: any[];
  selectedArticleId: string | null;
  onSelectArticle: (id: string | null) => void;
  onClose: () => void;
  lang?: 'fr' | 'en';
}

const MobileArticles: React.FC<MobileArticlesProps> = ({ 
  articles, 
  selectedArticleId, 
  onSelectArticle, 
  onClose,
  lang = 'fr'
}) => {
  // Translate the list of articles
  const translatedArticles = articles.map(art => translateArticle(art, lang));
  const selectedArticle = translatedArticles.find(a => a.id === selectedArticleId);

  const handleBack = () => {
    if (selectedArticleId) {
      onSelectArticle(null);
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-[60] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-gold/10 shrink-0">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-[10px] font-bold text-royal uppercase tracking-widest"
        >
          <i className="fa-solid fa-chevron-left text-gold"></i>
          {selectedArticleId 
            ? (lang === 'fr' ? 'Bibliothèque' : 'Library') 
            : (lang === 'fr' ? 'Retour' : 'Back')}
        </button>
        <h2 className="text-sm font-serif font-bold text-royal uppercase tracking-widest">
          {selectedArticle 
            ? (lang === 'fr' ? 'Lecture' : 'Reading') 
            : (lang === 'fr' ? 'Articles' : 'Articles')}
        </h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {selectedArticle ? (
            <motion.div
              key="reader"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-24"
            >
              <div className="relative h-60 w-full mb-8">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-2 py-1 bg-gold text-white text-[8px] font-bold tracking-widest uppercase rounded-sm mb-2 inline-block">
                    {selectedArticle.category}
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-white leading-tight">
                    {selectedArticle.title}
                  </h1>
                </div>
              </div>

              <div className="px-6 space-y-6">
                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gold/10 pb-6">
                  <span>{selectedArticle.readTime}</span>
                  <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                  <span>{selectedArticle.date}</span>
                </div>

                {selectedArticle.lead && (
                  <p className="text-lg font-serif italic text-royal/70 leading-relaxed border-l-4 border-gold pl-6 py-1">
                    {selectedArticle.lead}
                  </p>
                )}

                <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                  {selectedArticle.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {selectedArticle.quote && (
                  <div className="py-10 border-y border-gold/10 text-center px-4 my-8">
                    <i className="fa-solid fa-quote-left text-gold/20 text-3xl mb-4 block"></i>
                    <p className="text-xl font-serif font-bold text-royal italic leading-relaxed">
                      "{selectedArticle.quote}"
                    </p>
                  </div>
                )}
                
                <div className="pt-8 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">
                    {lang === 'fr' ? "Fin de l'article" : "End of article"}
                  </p>
                  <button 
                    onClick={() => onSelectArticle(null)}
                    className="px-10 py-4 bg-royal text-white rounded-2xl font-bold text-[10px] tracking-widest uppercase shadow-lg active:scale-95 transition-transform"
                  >
                    {lang === 'fr' ? "Voir d'autres articles" : "View other articles"}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-6 pb-24"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-serif font-bold text-royal mb-2">
                  {lang === 'fr' ? 'Bibliothèque' : 'Library'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  {lang === 'fr' ? 'Savoir-faire du couple' : 'Relationship Wisdom'}
                </p>
              </div>

              <div className="space-y-4">
                {translatedArticles.map(article => (
                  <button 
                    key={article.id}
                    onClick={() => onSelectArticle(article.id)}
                    className="w-full bg-white border-2 border-gold/10 rounded-2xl overflow-hidden shadow-soft flex items-center gap-4 text-left p-3 hover:border-gold/30 transition-all active:scale-[0.98]"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col py-1">
                      <span className="text-[8px] font-bold text-gold uppercase tracking-widest mb-1">{article.category}</span>
                      <h4 className="text-royal font-serif font-bold text-sm leading-tight mb-2 line-clamp-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        <span>{article.readTime}</span>
                        <span className="w-1 h-1 bg-gold rounded-full"></span>
                        <span>{lang === 'fr' ? 'Lire' : 'Read'}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MobileArticles;
