import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link to="/" className="flex flex-col items-center group w-fit">
              <span className="text-xl font-display font-bold tracking-tighter text-[#D4AF37] leading-none uppercase whitespace-nowrap">
                SMART<span className="text-[#1F4E79]">COUPLE</span>
              </span>
              <img 
                src="/img/smartcouple-icon.png" 
                alt="Smart Couple Icon" 
                className="w-6 h-auto mt-1 group-hover:scale-110 transition-transform"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              La plateforme ultime pour les couples modernes qui souhaitent construire un futur solide et harmonieux.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-royal hover:bg-gold hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-royal hover:bg-gold hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-royal hover:bg-gold hover:text-white transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-royal uppercase tracking-[0.3em]">Navigation</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-500 hover:text-gold text-sm transition-colors">Accueil</Link></li>
              <li><Link to="/dashboard" className="text-gray-500 hover:text-gold text-sm transition-colors">Dashboard</Link></li>
              <li><Link to="/articles" className="text-gray-500 hover:text-gold text-sm transition-colors">Articles</Link></li>
              <li><Link to="/planning" className="text-gray-500 hover:text-gold text-sm transition-colors">Planning</Link></li>
              <li><Link to="/mobile-test" className="text-gray-500 hover:text-gold text-sm transition-colors">Mobile (Test)</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-royal uppercase tracking-[0.3em]">Légal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-gray-500 hover:text-gold text-sm transition-colors">Confidentialité</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-gold text-sm transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/cookies" className="text-gray-500 hover:text-gold text-sm transition-colors">Cookies</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-royal uppercase tracking-[0.3em]">Contact</h4>
            <p className="text-gray-500 text-sm">
              Des questions ?<br />
              <a href="mailto:hello@smartcouple.fr" className="text-royal font-bold hover:text-gold transition-colors">hello@smartcouple.fr</a>
            </p>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
            © 2026 SMART COUPLE. TOUS DROITS RÉSERVÉS.
          </p>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
            FAIT AVEC <Heart size={10} className="inline text-gold fill-gold mx-1" /> POUR LES AMOUREUX.
          </p>
        </div>
      </div>
    </footer>
  );
};
