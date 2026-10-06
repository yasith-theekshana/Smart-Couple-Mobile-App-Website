import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export const SubscriptionSection: React.FC = () => {
  const tiers = [
    {
      name: 'Freemium',
      price: '0€',
      desc: 'Pour débuter votre voyage ensemble.',
      features: [
        'Gestion des dépenses de base',
        'Liste de courses simple',
        '2 objectifs communs / 4 mois',
        "Vue d'analyse standard"
      ],
      cta: 'COMMENCER GRATUITEMENT',
      popular: false,
      color: 'royal'
    },
    {
      name: 'Premium Subscription',
      price: '1.49€',
      period: 'par personne / mois',
      subPrice: '2.98€ par compte / mois',
      desc: 'Pour les couples qui visent l\'excellence.',
      features: [
        'Dépenses récurrentes automatisées',
        'Estimation intelligente des prix',
        'Objectifs individuels illimités',
        'Analyse détaillée par catégorie',
        'Accès prioritaire aux nouveautés'
      ],
      cta: 'DEVENIR PREMIUM',
      popular: true,
      color: 'gold'
    }
  ];

  return (
    <section className="py-24 bg-royal text-white overflow-hidden relative">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-20">
          <span className="text-gold font-bold tracking-[0.5em] uppercase text-[10px]">Tarification</span>
          <h2 className="text-4xl md:text-7xl font-serif font-bold text-white uppercase tracking-tighter mt-4">
            Choisissez votre <span className="text-gold italic">Harmonie</span>
          </h2>
          <p className="text-white/60 mt-6 max-w-2xl mx-auto text-lg">
            Des outils adaptés à chaque étape de votre vie de couple.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`relative p-12 rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${
                tier.popular 
                ? 'bg-white text-royal border-gold shadow-[0_0_50px_rgba(212,175,55,0.2)]' 
                : 'bg-white/5 text-white border-white/10 backdrop-blur-sm'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-12 gold-gradient text-white px-6 py-2 rounded-b-xl text-[10px] font-bold tracking-widest uppercase">
                  RECOMMANDÉ
                </div>
              )}

              <div className="mb-10">
                <h3 className={`text-3xl font-serif font-bold uppercase mb-2 ${tier.popular ? 'text-royal' : 'text-gold'}`}>
                  {tier.name}
                </h3>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-serif font-bold">{tier.price}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-widest">{tier.period || '/ mois'}</span>
                  </div>
                  {tier.subPrice && (
                    <span className="text-gold font-bold uppercase text-[10px] tracking-widest mt-1">{tier.subPrice}</span>
                  )}
                </div>
                <p className="mt-4 opacity-70 font-light">{tier.desc}</p>
              </div>

              <div className={`h-px w-full mb-10 ${tier.popular ? 'bg-gray-100' : 'bg-white/10'}`}></div>

              <ul className="space-y-6 mb-12">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <Check className={tier.popular ? 'text-gold' : 'text-gold'} size={20} />
                    <span className="text-sm font-medium uppercase tracking-wider">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to={tier.name === 'Freemium' ? "/dashboard" : "/signup"} 
                className={`block w-full py-5 text-center text-xs font-bold uppercase tracking-[0.3em] rounded-full transition-all ${
                  tier.popular 
                  ? 'gold-gradient text-white shadow-xl hover:shadow-gold/20' 
                  : 'border-2 border-white/20 text-white hover:bg-white hover:text-royal'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
