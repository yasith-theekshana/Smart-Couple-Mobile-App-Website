import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionPage: React.FC = () => {
  const plans = [
    {
      name: 'Freemium',
      price: '0€',
      period: '/mois',
      description: 'L\'essentiel pour commencer à deux.',
      icon: <Star className="w-8 h-8 text-royal" />,
      features: [
        'Gestion des dépenses communes',
        'Liste de courses partagée',
        'Calendrier de base',
        'Suivi des dettes',
        '1 Foyer unique',
      ],
      cta: 'Commencer gratuitement',
      highlight: false,
    },
    {
      name: 'Premium Subscription',
      price: '1.49€',
      period: 'par personne / mois',
      subPrice: '2.98€ par compte / mois',
      description: 'L\'expérience ultime pour un couple épanoui.',
      icon: <Crown className="w-8 h-8 text-gold" />,
      features: [
        'Tout ce qui est dans Freemium',
        'Moments Ensemble (Galerie HD)',
        'Analyses financières avancées',
        'Objectifs d\'épargne illimités',
        'Thèmes personnalisés (Royal & Pink)',
        'Support prioritaire 24/7',
      ],
      cta: 'Passer au Premium',
      highlight: true,
    },
  ];

  const handleSelectPlan = (planName: string) => {
    const tier = planName.toLowerCase().includes('premium') ? 'premium' : 'freemium';
    localStorage.setItem('smart_tier', tier);
    window.dispatchEvent(new Event('tierChange'));
    // Redirect to dashboard after selection
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-bgGray pt-20 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-royal mb-6 uppercase tracking-tight"
          >
            Choisissez votre <span className="text-gold">Liberté</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto font-medium"
          >
            Que vous souhaitiez simplement organiser votre quotidien ou transformer votre vie de couple, nous avons le plan idéal.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className={`relative bg-white rounded-sm p-10 flex flex-col h-full transition-all duration-500 ${
                plan.highlight 
                  ? 'border-2 border-gold shadow-premium scale-105 z-10' 
                  : 'border border-gray-100 shadow-soft'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-white px-6 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                  Recommandé
                </div>
              )}

              <div className="mb-8">
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-serif font-bold text-royal uppercase tracking-tight mb-2">{plan.name}</h3>
                <div className="flex flex-col mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif font-bold text-royal">{plan.price}</span>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{plan.period}</span>
                  </div>
                  {plan.subPrice && (
                    <span className="text-gold font-bold uppercase text-[10px] tracking-widest mt-1">{plan.subPrice}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex-grow space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className={`mt-1 shrink-0 ${plan.highlight ? 'text-gold' : 'text-royal'}`}>
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-5 rounded-sm font-bold uppercase tracking-[0.2em] text-sm text-center transition-all flex items-center justify-center gap-2 group ${
                  plan.highlight 
                    ? 'gold-gradient text-white shadow-xl hover:shadow-gold/20 active:scale-95' 
                    : 'border-2 border-royal text-royal hover:bg-royal hover:text-white active:scale-95'
                }`}
              >
                {plan.cta}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center max-w-2xl mx-auto">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Questions fréquentes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="text-sm font-bold text-royal uppercase mb-2">Puis-je annuler à tout moment ?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Oui, l'abonnement Premium est sans engagement. Vous pouvez revenir au plan Freemium en un clic depuis vos paramètres.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-royal uppercase mb-2">Mes données sont-elles sécurisées ?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Absolument. Nous utilisons un chiffrement de bout en bout pour protéger vos finances et vos moments intimes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
