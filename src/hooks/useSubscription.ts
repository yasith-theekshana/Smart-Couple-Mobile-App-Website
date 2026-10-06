import { useState, useEffect } from 'react';

export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('smart_tier') === 'premium';
  });
  
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);

  useEffect(() => {
    const checkTier = () => {
      setIsPremium(localStorage.getItem('smart_tier') === 'premium');
    };
    window.addEventListener('storage', checkTier);
    window.addEventListener('tierChange', checkTier);
    return () => {
      window.removeEventListener('storage', checkTier);
      window.removeEventListener('tierChange', checkTier);
    };
  }, []);
  
  return { isPremium, setIsPremium, showPremiumPrompt, setShowPremiumPrompt };
};
