import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { motion, useScroll, useSpring } from 'motion/react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Barbers = lazy(() => import('./pages/Barbers'));
const Booking = lazy(() => import('./pages/Booking'));
const Location = lazy(() => import('./pages/Location'));
const Admin = lazy(() => import('./pages/Admin'));

export type Page = 'home' | 'about' | 'gallery' | 'barbers' | 'booking' | 'location' | 'admin';

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="text-muted text-xs uppercase tracking-widest font-bold animate-pulse">Carregando...</span>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [flashes, setFlashes] = useState<{id: number, x: number, y: number}[]>([]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    const id = Date.now();
    setFlashes(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setFlashes(prev => prev.filter(f => f.id !== id));
    }, 500);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      const isClickable = window.getComputedStyle(target).cursor === 'pointer' || 
                          target.tagName.toLowerCase() === 'a' || 
                          target.tagName.toLowerCase() === 'button' ||
                          target.closest('a') ||
                          target.closest('button');
                          
      setIsHovering(!!isClickable);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [handleGlobalClick]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'about': return <About />;
      case 'gallery': return <Gallery />;
      case 'barbers': return <Barbers onNavigate={setCurrentPage} />;
      case 'booking': return <Booking />;
      case 'location': return <Location />;
      case 'admin': return <Admin onNavigate={setCurrentPage} />;
      default: return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <div className="noise-bg"></div>
      
      {currentPage !== 'home' && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-crimson z-[10001] origin-left"
          style={{ scaleX }}
        />
      )}

      {flashes.map(f => (
        <div key={f.id} className="click-flash" style={{ left: f.x, top: f.y }}></div>
      ))}

      <div 
        className={`custom-cursor hidden md:block ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`} 
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      ></div>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        <Suspense fallback={<PageFallback />}>
          {renderPage()}
        </Suspense>
      </Layout>
    </>
  );
}