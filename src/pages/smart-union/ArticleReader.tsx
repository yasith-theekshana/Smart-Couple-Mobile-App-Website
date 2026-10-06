import React, { useEffect } from 'react';
import { Article } from './ArticleData';

interface ArticleReaderProps {
  article: Article;
  onBack: () => void;
}

const ArticleReader: React.FC<ArticleReaderProps> = ({ article, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="animate-fadeIn pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-[10px] font-bold text-gray-400 hover:text-royal transition-colors mb-12 uppercase tracking-[0.3em]"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> RETOUR AUX ARTICLES
        </button>

        <header className="text-center mb-16">
          <span className="text-gold font-bold text-xs tracking-[0.4em] uppercase mb-4 block">{article.category}</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-royal mb-6 leading-tight">{article.title}</h1>
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <span>TEMPS DE LECTURE : {article.readTime}</span>
            <span className="w-1 h-1 bg-gold rounded-full"></span>
            <span>PAR SMART COUPLE TEAM</span>
          </div>
        </header>

        <div className="rounded-sm overflow-hidden shadow-premium mb-16 aspect-video md:aspect-[21/9]">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>

        <article className="max-w-2xl mx-auto space-y-10">
          {article.lead && (
            <p className="text-xl md:text-2xl font-serif italic text-royal/70 leading-relaxed border-l-4 border-gold pl-8 py-2">
              {article.lead}
            </p>
          )}

          <div className="text-lg text-gray-600 leading-[2] space-y-8 font-light">
            {article.content.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {article.quote && (
            <div className="py-12 border-y border-gray-100 text-center px-10">
              <svg className="w-12 h-12 text-gold/20 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              <p className="text-2xl md:text-3xl font-serif font-bold text-royal italic leading-relaxed">
                "{article.quote}"
              </p>
            </div>
          )}
        </article>

        <footer className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">FIN DE LA LECTURE</p>
          <button 
            onClick={onBack}
            className="px-12 py-5 bg-royal text-white rounded-sm font-bold text-[10px] tracking-[0.3em] uppercase shadow-xl hover:bg-gold transition-all"
          >
            VOIR D'AUTRES ARTICLES
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ArticleReader;
