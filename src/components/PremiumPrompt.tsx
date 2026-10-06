import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, X, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumPrompt: React.FC<PremiumPromptProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-royal/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-sm shadow-premium overflow-hidden"
          >
            {/* Header with Gradient */}
            <div className="gold-gradient p-8 text-white text-center relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Crown size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold uppercase tracking-tight">Passez au Premium</h2>
              <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mt-2">Débloquez tout le potentiel de votre couple</p>
            </div>

            <div className="p-8">
              <p className="text-gray-600 text-sm leading-relaxed mb-8 text-center">
                Cette fonctionnalité est réservée à nos membres Premium. Rejoignez des milliers de couples qui utilisent Smart Couple pour transformer leur relation.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  'Analyses financières détaillées',
                  'Objectifs d\'épargne illimités',
                  'Moments Ensemble (Galerie HD)',
                  'Thèmes personnalisés exclusifs'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-gold shrink-0">
                      <Check size={18} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-royal">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Link 
                  to="/subscription" 
                  onClick={onClose}
                  className="w-full py-4 gold-gradient text-white rounded-sm font-bold uppercase tracking-[0.2em] text-xs text-center shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  Découvrir les Plans
                  <ArrowRight size={16} />
                </Link>
                <button 
                  onClick={onClose}
                  className="w-full py-4 text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-royal transition-colors"
                >
                  Peut-être plus tard
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumPrompt;
