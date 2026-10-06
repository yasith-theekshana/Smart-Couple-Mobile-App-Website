import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const FeatureDeepDives: React.FC = () => {
  const features = [
    {
      tag: 'LOGICIEL DE GESTION',
      title: 'SMART DÉPENSES',
      desc: 'La clarté financière est la base de la sérénité. Notre outil vous permet de co-piloter votre budget sans friction.',
      items: ['Dépenses mensuelles partagées', 'Budget cible commun', 'Suivi fixe et variable'],
      links: [
        { label: "DÉCOUVRIR L'OUTIL FINANCIER", to: '/smart-depenses' },
        { label: "ACCÉDER À LA LISTE DE COURSES", to: '/smart-depenses/grocery' }
      ],
      img: 'https://www.curieux.live/wp-content/uploads/2022/01/young-couple-managing-finances-reviewing-their-ba-2021-08-31-05-28-21-utc-scaled.jpg?auto=format&fit=crop&q=80&w=1000',
      reverse: false
    },
    {
      tag: 'AGENDA PARTAGÉ',
      title: 'SMART JOURS',
      desc: 'Le temps est votre ressource la plus précieuse. Allouez-le avec intention à ceux qui comptent vraiment.',
      items: ['Dates et souvenirs mémorables', 'Réservation de "Moments-Ensemble"', 'Chronologie partagée'],
      links: [
        { label: "GÉRER LE CALENDRIER", to: '/smart-jours' }
      ],
      img: 'https://www.cewe.fr/cdn/images/ek/tw/ektWRzdDbDRLRmpSWTJQMW14a0REUi9mVUdQd0pwbWZhcGNuSmJrSGZpOHVGT2IvaDh5OWdWRkY4M044TEdYam9tY2xaaUFjcml0VXptTkx1YnlVQXU5QjM5NXNFNjdxNDVhTHlOc1lUa0k9/calendrier-agenda.jpg?auto=format&fit=crop&q=80&w=1000',
      reverse: true
    },
    {
      tag: 'INTELLIGENCE ÉMOTIONNELLE',
      title: 'SMART UNION',
      desc: "Parce que nous sommes des êtres émotionnels, la maîtrise de nos échanges est le secret d'une harmonie durable.",
      items: ['Apprentissage de la patience', 'Maîtrise des émotions', 'Ressources psychologiques'],
      links: [
        { label: "EXPLORER LES ARTICLES", to: '/smart-union' }
      ],
      img: 'https://img.freepik.com/free-photo/excited-fair-haired-girl-fooling-around-with-boyfriend-home-good-humoured-brunette-man-dancing-with-wife_197531-12200.jpg?auto=format&fit=crop&q=80&w=1000',
      reverse: false
    }
  ];

  return (
    <section className="space-y-32 py-24 bg-gray-50/50">
      {features.map((f, i) => (
        <div key={i} className="container mx-auto px-6 max-w-6xl">
          <div className={`flex flex-col ${f.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24`}>
            <motion.div 
              className="flex-1 space-y-8"
              initial={{ opacity: 0, x: f.reverse ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1 bg-royal text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-full">{f.tag}</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-royal leading-tight uppercase tracking-tighter">
                {f.title}
              </h2>
              <p className="text-gray-500 leading-relaxed font-light text-lg">
                {f.desc}
              </p>
              <ul className="space-y-4">
                {f.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-xs font-bold text-royal uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-gold"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-6 pt-4">
                {f.links.map((link, idx) => (
                  <Link key={idx} to={link.to} className="inline-block text-royal font-bold border-b-2 border-gold/30 hover:border-gold pb-2 transition-all text-sm uppercase tracking-widest w-fit">
                    {link.label} →
                  </Link>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 relative w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className={`absolute -inset-4 border border-gold/20 -z-10 ${f.reverse ? '-translate-x-4' : 'translate-x-4'} translate-y-4 rounded-2xl`}></div>
              <img 
                src={f.img} 
                alt={f.title} 
                className="w-full h-[400px] md:h-[550px] object-cover shadow-premium rounded-2xl transition-transform duration-700 hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      ))}
    </section>
  );
};
