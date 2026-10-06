import React, { useState, useMemo } from 'react';
import { ARTICLES, CONNECTION_QUESTIONS, Article } from './ArticleData';
import ArticleReader from './ArticleReader';

const SmartUnion: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = ['Tous', 'Communication', 'Psychologie', 'Vie Quotidienne', 'Finances'];

  const filteredArticles = useMemo(() => {
    let result = [...ARTICLES];

    // 1. Filtrage par catégorie
    if (activeCategory !== 'Tous') {
      result = result.filter(a => a.category === activeCategory);
    }

    // 2. Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.excerpt.toLowerCase().includes(query)
      );
    }

    // 3. Tri par date
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [activeCategory, searchQuery, sortOrder]);

  const refreshQuestion = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * CONNECTION_QUESTIONS.length);
      } while (nextIdx === currentQuestionIdx && CONNECTION_QUESTIONS.length > 1);
      
      setCurrentQuestionIdx(nextIdx);
      setIsRefreshing(false);
    }, 400);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (selectedArticle) {
    return <ArticleReader article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div className="container mx-auto px-6 max-w-6xl pb-32 animate-fadeIn pt-32">
      <header className="mb-12 text-center md:text-left border-b border-gold/20 pb-10">
        <h5 className="text-gold font-bold text-xs tracking-[0.3em] mb-4 uppercase">Croissance & Soutien</h5>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-royal mb-4 uppercase tracking-tight">
          Smart Union
        </h1>
        <p className="text-gray-500 max-w-xl leading-relaxed text-base font-light">
          Conseils, réflexions et ressources pour cultiver une relation épanouie et durable au quotidien.
        </p>
      </header>

      {/* Question du Jour Section */}
      <section className="mb-12 max-w-3xl mx-auto">
        <div className="bg-royal p-8 md:p-10 rounded-sm shadow-premium border border-gold/20 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gold"></div>
          
          <span className="inline-block px-4 py-1 bg-gold text-white text-[9px] font-bold tracking-[0.3em] uppercase rounded-full mb-6">
            QUESTION DU JOUR
          </span>
          
          <div className={`min-h-[80px] flex items-center justify-center transition-all duration-500 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white leading-snug px-4 italic">
              "{CONNECTION_QUESTIONS[currentQuestionIdx]}"
            </h2>
          </div>

          <button 
            onClick={refreshQuestion}
            disabled={isRefreshing}
            className={`mt-8 group flex items-center gap-2 mx-auto text-[9px] font-bold text-gold hover:text-white transition-all uppercase tracking-widest ${isRefreshing ? 'animate-pulse' : ''}`}
          >
            <span className={`text-lg transition-transform duration-500 ${isRefreshing ? 'rotate-180' : 'group-hover:rotate-45'}`}>↻</span>
            INSPIRATION SUIVANTE
          </button>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <div className="flex flex-col space-y-8 mb-12">
        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto w-full">
          <input 
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-b border-gray-100 py-4 px-2 text-royal font-light text-lg focus:border-gold outline-none transition-all placeholder:text-gray-300"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {/* Categories and Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <nav className="flex flex-wrap justify-center md:justify-start gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 text-[11px] font-bold tracking-widest uppercase transition-all rounded-sm border flex-grow md:flex-grow-0 ${
                  activeCategory === cat 
                    ? 'bg-royal text-white border-royal shadow-md' 
                    : 'bg-white text-royal border-royal/30 hover:border-gold hover:text-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Trier par :</span>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-white border-none text-[11px] font-bold text-royal uppercase tracking-widest px-4 py-2 outline-none focus:ring-0 cursor-pointer hover:text-gold transition-colors"
            >
              <option value="newest">Plus Récents</option>
              <option value="oldest">Plus Anciens</option>
            </select>
          </div>
        </div>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredArticles.map((article) => (
          <div 
            key={article.id} 
            className="group cursor-pointer flex flex-col h-full bg-white border border-gray-50 rounded-sm overflow-hidden hover:shadow-premium transition-all hover:-translate-y-1"
            onClick={() => setSelectedArticle(article)}
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-royal/90 backdrop-blur-sm px-4 py-1.5 text-[10px] font-bold text-white shadow-sm tracking-widest uppercase">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[8px] font-bold text-gold uppercase tracking-widest">{formatDate(article.date)}</span>
                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{article.readTime}</span>
              </div>
              
              <h3 className="text-lg font-serif font-bold text-royal mb-3 group-hover:text-gold transition-colors leading-tight uppercase">
                {article.title}
              </h3>
              
              <p className="text-sm text-gray-500 leading-relaxed mb-6 font-light italic flex-grow">
                {article.excerpt}
              </p>
              
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-royal font-bold text-[9px] tracking-widest group-hover:text-gold transition-colors uppercase">LIRE LA SUITE</span>
                <span className="text-gold group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredArticles.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-300 font-serif italic text-xl">Aucun article ne correspond à votre recherche.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('Tous'); }}
              className="mt-6 text-[10px] font-bold text-gold border-b border-gold uppercase tracking-widest"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-24 p-10 md:p-16 bg-royal rounded-sm flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8 border border-gold/20 relative overflow-hidden shadow-premium">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-white mb-3">Une question particulière ?</h3>
          <p className="text-white/70 max-w-md text-base font-light leading-relaxed">
            Notre espace conseil évolue chaque semaine. Suggérez-nous des thématiques qui vous tiennent à cœur.
          </p>
        </div>
        <button className="relative z-10 px-10 py-4 bg-gold text-white rounded-sm font-bold tracking-[0.2em] shadow-xl hover:scale-105 transition-all uppercase text-[9px]">
          NOUS CONTACTER
        </button>
      </div>
    </div>
  );
};

export default SmartUnion;
