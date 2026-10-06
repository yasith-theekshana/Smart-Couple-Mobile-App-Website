import React from 'react';

export const Quote: React.FC = () => {
  return (
    <section className="container mx-auto px-6 py-24 text-center max-w-4xl">
      <div className="p-16 md:p-24 border border-gold/10 rounded-3xl bg-white relative shadow-soft">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white border border-gold/20 flex items-center justify-center rounded-full text-gold text-4xl font-serif shadow-md">“</div>
        <p className="text-3xl md:text-5xl font-serif italic text-royal mb-10 leading-tight tracking-tight">
          "Un couple intelligent ne se contente pas de partager une vie, il construit une vision commune avec transparence et grâce."
        </p>
        <div className="h-1 w-16 bg-gold mx-auto mb-6"></div>
        <p className="text-gold font-bold tracking-[0.4em] text-xs uppercase">L'Essence de l'Union</p>
      </div>
    </section>
  );
};
