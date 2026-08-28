import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import { X } from 'lucide-react';

type Category = 'Todos' | 'Cortes' | 'Barba' | 'Ambiente';

const images = [
  {
    url: '/corte_28.png',
    title: 'Corte Assinatura',
    category: 'Cortes' as Category,
    // TODO: Adicione o crédito quando tiver fotos reais
    credit: 'João Neto & Cristian Mauro'
  },
  {
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=1000',
    title: 'O Espaço',
    category: 'Ambiente' as Category,
    // TODO: Adicione o crédito quando tiver fotos reais
    credit: ''
  },
  {
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=1000',
    title: 'Barboterapia',
    category: 'Barba' as Category,
    // TODO: Adicione o crédito quando tiver fotos reais
    credit: ''
  },
  {
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1000',
    title: 'A Lâmina',
    category: 'Ambiente' as Category,
    // TODO: Adicione o crédito quando tiver fotos reais
    credit: ''
  }
];

const categories: Category[] = ['Todos', 'Cortes', 'Barba', 'Ambiente'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string, credit: string} | null>(null);

  const filteredImages = images.filter(img => activeCategory === 'Todos' || img.category === activeCategory);

  return (
    <PageTransition>
      <section className="min-h-screen pt-32 lg:pt-48 pb-32 px-6 lg:px-12 bg-matte">
        <div className="max-w-[90rem] mx-auto">
          
          <div className="mb-16">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-crimson uppercase tracking-[0.3em] font-sans text-xs font-bold mb-4 block"
            >
              Portfólio
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-sans font-bold text-5xl lg:text-[7rem] text-offwhite leading-[0.85] tracking-tighter uppercase"
            >
              Nosso<br/>Estilo<span className="text-crimson">.</span>
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            {categories.map(category => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 transition-colors duration-300 font-sans text-xs tracking-[0.2em] font-bold uppercase border ${
                  activeCategory === category 
                    ? 'border-crimson bg-crimson text-offwhite' 
                    : 'border-matte-lighter text-muted hover:border-crimson hover:text-offwhite'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredImages.map((image) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  key={image.url}
                  onClick={() => setSelectedImage(image)}
                  className="group relative aspect-square overflow-hidden bg-matte-light cursor-pointer"
                >
                  <img 
                    src={image.url} 
                    alt={image.title} 
                    loading="lazy"
                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-matte/80 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="font-sans font-bold text-3xl text-offwhite uppercase tracking-tighter mb-2">{image.title}</span>
                    <span className="text-crimson text-[10px] uppercase tracking-[0.3em] font-bold">{image.credit}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

        </div>

        {/* Fullscreen Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-[60] bg-matte/95 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out"
            >
              <button 
                className="absolute top-8 right-8 text-offwhite hover:text-crimson transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                aria-label="Fechar galeria"
              >
                <X className="w-10 h-10" />
              </button>
              <div className="relative">
                <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  src={selectedImage.url} 
                  alt={selectedImage.title}
                  className="max-w-full max-h-[85vh] object-contain shadow-2xl"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4 flex flex-col items-center text-center bg-matte/80 p-4 backdrop-blur-md"
                >
                  <span className="font-sans font-bold text-2xl text-offwhite uppercase tracking-tighter mb-1">{selectedImage.title}</span>
                  <span className="text-crimson text-[10px] uppercase tracking-[0.3em] font-bold">{selectedImage.credit}</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>
    </PageTransition>
  );
}
