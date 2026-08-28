import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { ThemeToggleButton } from '../lib/theme';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string }[] = [
  { id: 'home', label: 'Início' },
  { id: 'about', label: 'Identidade' },
  { id: 'gallery', label: 'Cortes' },
  { id: 'barbers', label: 'Equipe' },
  { id: 'booking', label: 'Agendar' },
  { id: 'location', label: 'Encontrar' },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: Page) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-matte font-sans text-offwhite transition-colors duration-300">
      {/* Header */}
      <header 
        className={`fixed top-0 w-full z-50 h-[80px] transition-all duration-500 flex items-center ${
          scrolled ? 'bg-matte-light/95 backdrop-blur-xl border-b border-matte-lighter shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="w-full max-w-[90rem] mx-auto px-6 lg:px-12 flex justify-between items-center">
          <button onClick={() => handleNav('home')} className="flex flex-col group relative z-50 cursor-pointer text-left">
            <Logo className="h-10 w-10 text-offwhite" animate />
            <span className="text-[9px] tracking-[0.3em] text-muted uppercase mt-1 group-hover:text-offwhite transition-colors">Barbearia</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative text-xs tracking-[0.15em] font-medium uppercase transition-all duration-300 overflow-hidden py-2 cursor-pointer ${
                  currentPage === item.id ? 'text-offwhite font-bold' : 'text-muted hover:text-offwhite'
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-crimson origin-left transition-transform duration-300 ${
                  currentPage === item.id ? 'scale-x-100' : 'scale-x-0'
                }`}></span>
              </button>
            ))}

            {/* Theme Toggle Button */}
            <ThemeToggleButton />
          </nav>

          {/* Mobile Actions (Theme Toggle + Menu) */}
          <div className="lg:hidden flex items-center gap-4 z-50">
            <ThemeToggleButton />
            <button 
              className="text-offwhite w-10 h-10 flex items-center justify-end group cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menu"
            >
              <div className="flex flex-col gap-[6px] items-end">
                <span className={`block h-[2px] bg-offwhite transition-all duration-300 ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-[8px]' : 'w-7 group-hover:bg-crimson'}`}></span>
                <span className={`block h-[2px] bg-offwhite transition-all duration-300 ${isMobileMenuOpen ? 'w-0 opacity-0' : 'w-5 group-hover:bg-crimson'}`}></span>
                <span className={`block h-[2px] bg-offwhite transition-all duration-300 ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[8px]' : 'w-3 group-hover:bg-crimson'}`}></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Subtle red line indicator on scroll */}
        <div className={`absolute bottom-0 left-0 h-[1px] bg-crimson transition-all duration-1000 ${scrolled ? 'w-full opacity-50' : 'w-0 opacity-0'}`}></div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 100% 0)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-matte flex flex-col justify-center px-8 border-b border-matte-lighter"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-crimson-dark/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="flex flex-col gap-6 max-w-sm w-full relative z-10">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <button
                    onClick={() => handleNav(item.id)}
                    className={`text-2xl font-serif italic tracking-wide transition-all duration-300 w-full text-left flex items-center group cursor-pointer ${
                      currentPage === item.id ? 'text-crimson' : 'text-offwhite hover:text-crimson'
                    }`}
                  >
                    <span className={`text-xs font-sans not-italic mr-4 transition-all duration-300 ${currentPage === item.id ? 'text-crimson font-bold' : 'text-muted'}`}>
                      0{index + 1}
                    </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-2">
                      {item.label}
                    </span>
                  </button>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: navItems.length * 0.04, duration: 0.3 }}
                className="pt-6 mt-2 border-t border-matte-lighter/30"
              >
                <button
                  onClick={() => handleNav('admin')}
                  className={`text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 w-full text-left cursor-pointer opacity-30 hover:opacity-100 ${
                    currentPage === 'admin' ? 'text-crimson opacity-100' : 'text-muted'
                  }`}
                >
                  Acesso Restrito
                </button>
              </motion.div>
            </div>
            
            <div className="absolute bottom-10 left-8 right-8 flex justify-between items-end border-t border-matte-lighter pt-6">
               <div className="text-xs text-muted font-sans uppercase tracking-widest">
                 Barbearia Elite
               </div>
               <div className="flex gap-4">
                 <span className="text-xs text-muted">Montezuma - MG</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow pt-[80px]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-matte-light py-16 px-6 lg:px-12 mt-auto relative overflow-hidden border-t border-matte-lighter">
        <div className="absolute top-0 right-0 w-96 h-96 bg-crimson/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
          <div className="flex flex-col gap-4">
             <Logo className="h-12 w-12 text-offwhite" />
             <p className="text-muted text-sm max-w-xs font-sans font-medium mt-2">
               Um espaço acolhedor e com padrão de excelência em Montezuma. Acreditamos no poder de um bom corte e de uma boa prosa.
             </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm font-sans">
             <div className="flex flex-col gap-3">
               <span className="text-offwhite font-bold tracking-wider uppercase text-xs mb-1">Navegar</span>
               <button onClick={() => handleNav('home')} className="text-muted hover:text-crimson transition-colors text-left w-fit cursor-pointer">Início</button>
               <button onClick={() => handleNav('about')} className="text-muted hover:text-crimson transition-colors text-left w-fit cursor-pointer">Identidade</button>
               <button onClick={() => handleNav('gallery')} className="text-muted hover:text-crimson transition-colors text-left w-fit cursor-pointer">Cortes</button>
               <button onClick={() => handleNav('booking')} className="text-muted hover:text-crimson transition-colors text-left w-fit cursor-pointer">Agendar</button>
             </div>
             <div className="flex flex-col gap-3">
               <span className="text-offwhite font-bold tracking-wider uppercase text-xs mb-1">Contato</span>
               <span className="text-muted">(38) 9974-6305</span>
               <span className="text-muted text-xs break-all">joaonetopardim67@gmail.com</span>
               <span className="text-muted text-xs break-all">cristianmauro.barbearia@gmail.com</span>
             </div>
<div className="flex flex-col gap-3 col-span-2 md:col-span-1">
                <span className="text-offwhite font-bold tracking-wider uppercase text-xs mb-1">Localização</span>
                <span className="text-muted">Centro<br/>Montezuma - MG</span>
                <span className="text-xs text-muted mt-1">Seg–Qua: 08:30 às 19:00</span>
                <span className="text-xs text-muted">Qui–Sex: 08:00 às 19:00</span>
                <span className="text-xs text-muted">Sáb: 08:00 às 15:00</span>
              </div>
          </div>
        </div>
        
        <div className="max-w-[90rem] mx-auto mt-14 pt-8 border-t border-matte-lighter flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Barbearia Elite. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-[10px] text-muted uppercase tracking-widest items-center">
            <button onClick={() => handleNav('admin')} className="opacity-30 hover:opacity-100 transition-opacity cursor-pointer">
              Admin
            </button>
            <span className="opacity-30">•</span>
            <span className="opacity-30">Ambiente Seguro</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
