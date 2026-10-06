import React, { createContext, useContext, useState, useEffect } from 'react';
import PremiumPrompt from '../components/PremiumPrompt';

interface PremiumContextType {
  isPremium: boolean;
  showPremiumPrompt: boolean;
  setShowPremiumPrompt: (show: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('smart_tier') === 'premium';
  });
  
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);

  useEffect(() => {
    const checkTier = () => {
      setIsPremium(localStorage.getItem('smart_tier') === 'premium');
    };
    window.addEventListener('storage', checkTier);
    // Also check on a custom event if we change it within the same tab
    window.addEventListener('tierChange', checkTier);
    
    return () => {
      window.removeEventListener('storage', checkTier);
      window.removeEventListener('tierChange', checkTier);
    };
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, showPremiumPrompt, setShowPremiumPrompt }}>
      {children}
      <PremiumPrompt isOpen={showPremiumPrompt} onClose={() => setShowPremiumPrompt(false)} />
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) throw new Error('usePremium must be used within a PremiumProvider');
  return context;
};
