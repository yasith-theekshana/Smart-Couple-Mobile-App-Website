import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { scale, setScale } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const location = useLocation();

  const publicRoutes = ['/', '/login', '/signup'];
  const isAppView = !publicRoutes.includes(location.pathname);

  React.useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) { // scrolling down
          setIsVisible(false);
        } else { // scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  const navItems = [
    { name: 'Accueil', path: '/dashboard' },
    { name: 'Smart Dépenses', path: '/smart-depenses' },
    { name: 'Smart Jours', path: '/smart-jours' },
    { name: 'Smart Union', path: '/smart-union' },
    { name: 'Paramètres', path: '/parametres' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  // Reset font size for Navbar to ignore root scaling
  const baseFontSize = scale === '200%' ? '0.666rem' : '1rem';

  return (
    <nav 
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      style={{ fontSize: baseFontSize }}
    >
      <div className="container mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
        <Link to="/" className="flex flex-col items-center group shrink-0">
          <span className="text-[20px] md:text-[24px] font-display font-bold tracking-tighter text-[#D4AF37] leading-none uppercase whitespace-nowrap">
            SMART<span className="text-[#1F4E79]">COUPLE</span>
          </span>
          <img 
            src="/img/smartcouple-icon.png" 
            alt="Smart Couple Icon" 
            className="w-5 md:w-6 h-auto mt-0.5 group-hover:scale-110 transition-transform"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {isAppView ? (
            /* App View Menu */
            <div className="flex items-center gap-4 lg:gap-8 mr-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`relative py-2 text-[14px] font-bold uppercase tracking-widest transition-colors group ${
                    isActive(item.path) ? 'text-gold' : 'text-royal hover:text-gold'
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gold transform transition-transform duration-300 ${
                    isActive(item.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
              ))}
            </div>
          ) : (
            /* Public View Menu */
            <Link to="/dashboard" className="px-6 py-3 border-2 border-royal text-royal rounded-sm text-[14px] font-bold uppercase tracking-widest hover:bg-royal hover:text-white transition-all whitespace-nowrap">
              Essayer gratuitement
            </Link>
          )}
          
          <div className="flex items-center bg-gray-100 rounded-full p-1 mx-2 shrink-0">
          </div>

          {isAppView ? (
            <Link to="/signup" className="px-6 py-3 border-2 border-gold text-gold rounded-sm text-[14px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all whitespace-nowrap">
              Créer un compte
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-6 py-3 border-2 border-royal text-royal rounded-sm text-[14px] font-bold uppercase tracking-widest hover:bg-royal hover:text-white transition-all whitespace-nowrap">
                Connexion
              </Link>
              <Link to="/signup" className="px-6 py-3 border-2 border-gold text-gold rounded-sm text-[14px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all whitespace-nowrap">
                Créer un compte
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-royal p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-6 flex flex-col gap-6 animate-fadeIn shadow-xl">
          {isAppView ? (
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  onClick={() => setIsOpen(false)}
                  className={`text-[14px] font-bold uppercase tracking-widest transition-colors ${
                    isActive(item.path) ? 'text-gold' : 'text-royal'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ) : (
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-[14px] font-bold uppercase tracking-widest text-royal">Essayer gratuitement</Link>
          )}
          
          <div className="h-px bg-gray-100"></div>
          
          <div className="flex items-center justify-between py-2">
             <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Taille Interface</span>
             <div className="flex bg-gray-100 rounded-full p-1">
             </div>
          </div>

          <div className="flex flex-col gap-3">
            {!isAppView && (
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-4 text-center border-2 border-royal text-royal rounded-sm text-[14px] font-bold uppercase tracking-widest">Connexion</Link>
            )}
            <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full py-4 text-center border-2 border-gold text-gold rounded-sm text-[14px] font-bold uppercase tracking-widest">Créer un compte</Link>
          </div>
        </div>
      )}
    </nav>
  );
};
