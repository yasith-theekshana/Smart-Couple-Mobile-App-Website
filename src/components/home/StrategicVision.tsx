import React from 'react';

export const StrategicVision: React.FC = () => {
  const points = [
    {
      num: '01',
      title: 'Finances Communes',
      desc: 'Gérer vos dépenses avec transparence. Maintenir un registre financier organisé pour vos frais et votre épargne commune.'
    },
    {
      num: '02',
      title: 'Planning Intentionnel',
      desc: "Se souvenir des jours et dates importants. Planifier des moments de qualité pour ne jamais oublier l'essentiel."
    },
    {
      num: '03',
      title: 'Intelligence Union',
      desc: "Surmonter les défis grâce à l'intelligence émotionnelle. Cultiver la patience et la tolérance par la connaissance."
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-20">
          <span className="text-gold font-bold tracking-[0.5em] uppercase text-[10px]">L'Approche</span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-royal uppercase tracking-tighter mt-4">
            Smart Couple
          </h2>
          <div className="h-1 w-20 bg-gold mx-auto mt-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {points.map((point, i) => (
            <div key={i} className="group space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl font-serif text-gold/20 font-bold group-hover:text-gold/40 transition-colors">{point.num}</span>
                <div className="h-px bg-gold/20 flex-grow"></div>
              </div>
              <h3 className="text-xs font-bold text-royal tracking-[0.3em] uppercase">{point.title}</h3>
              <p className="text-gray-500 leading-relaxed text-base font-light">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
