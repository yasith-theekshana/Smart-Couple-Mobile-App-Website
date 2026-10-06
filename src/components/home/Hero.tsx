import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden min-h-[80vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://exposure.software/site/wp-content/uploads/2015/02/Jim-Pollard-goes-click-11.jpg" 
          alt="Couple Landscape" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-royal/40 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90"></div>
      </div>

      {/* Blueprint Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.1] z-1"
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: 'center center'
        }}
      ></div>

      <div className="container mx-auto px-6 py-20 text-center max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-royal leading-[0.9] mb-8 tracking-tighter">
            Vivre une vie de <br className="hidden md:block" />
            couple <span className="text-gold uppercase">SMART</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-royal/80 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Une plateforme partagée conçue pour apporter de la clarté à vos finances, 
            de l'intentionnalité à votre temps et de la profondeur à votre union.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/signup" className="w-full sm:w-auto px-12 py-6 gold-gradient text-white rounded-full font-bold tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform text-sm uppercase">
              Créer un compte
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto px-12 py-6 bg-white text-royal border border-gray-200 rounded-full font-bold tracking-[0.2em] shadow-lg hover:bg-gray-50 transition-all text-sm uppercase">
              Essayer gratuitement
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
