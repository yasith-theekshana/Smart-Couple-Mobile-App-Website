import React, { createContext, useContext, useState, useEffect } from 'react';

type ScaleLevel = '100%' | '200%';

interface ThemeContextType {
  scale: ScaleLevel;
  setScale: (scale: ScaleLevel) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scale, setScaleState] = useState<ScaleLevel>('100%');

  const setScale = (newScale: ScaleLevel) => {
    setScaleState(newScale);
    // Apply to root html element so all rem units scale
    document.documentElement.style.fontSize = newScale === '200%' ? '1.5rem' : '1rem';
  };

  return (
    <ThemeContext.Provider value={{ scale, setScale }}>
      <div className={scale === '200%' ? 'scale-large' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
