import { motion, useScroll, useTransform } from 'motion/react';
import { useState } from 'react';
import { Page } from '../App';
import PageTransition from '../components/PageTransition';
import AnimatedScissor from '../components/AnimatedScissor';

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [isGlowing, setIsGlowing] = useState(false);
  const { scrollY } = useScroll();
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden px-6 lg:px-12">
        {/* Background elements */}
        <div className="absolute top-1/4 right-0 w-[40vw] h-[60vh] bg-crimson/10 blur-[150px] rounded-full pointer-events-none animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-10 w-[30vw] h-[40vh] bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="w-full max-w-[90rem] mx-auto flex flex-col lg:flex-row items-center justify-between z-10 relative">
          
          {/* Left Text Content */}
          <motion.div style={{ opacity }} className="lg:w-[65%] z-20">
            <div className="overflow-hidden mb-6">
              <motion.span 
                custom={1} initial="hidden" animate="visible" variants={textVariants}
                className="block text-crimson font-sans uppercase tracking-[0.4em] text-xs font-bold"
              >
                Bem-vindo a barbearia ELITE!
              </motion.span>
            </div>
            
            <h1 className="font-sans font-bold text-[12vw] lg:text-[8rem] text-offwhite leading-[0.85] tracking-tighter uppercase flex flex-col">
              <div className="overflow-hidden">
                <motion.span custom={2} initial="hidden" animate="visible" variants={textVariants} className="block text-reveal">
                  O Seu
                </motion.span>
              </div>
              <div className="overflow-hidden">
                <motion.span custom={3} initial="hidden" animate="visible" variants={textVariants} className="block text-reveal flex items-center gap-4">
                  Estilo<span className="text-crimson">.</span>
                </motion.span>
              </div>
            </h1>
            
            <div className="overflow-hidden mt-12 mb-16">
              <motion.p 
                custom={4} initial="hidden" animate="visible" variants={textVariants}
                className="font-serif italic text-2xl lg:text-3xl text-muted max-w-xl"
              >
                Acreditamos que um bom corte vai muito além do visual. É sobre se sentir bem e confiante, em um ambiente feito para você relaxar.
              </motion.p>
            </div>

            <motion.div custom={5} initial="hidden" animate="visible" variants={textVariants}>
              <button
                onClick={() => onNavigate('booking')}
                className="btn-crimson"
              >
                Agendar Horário
              </button>
            </motion.div>
          </motion.div>

          {/* Right Animated Emblem Composition */}
          <div className="lg:w-[45%] lg:absolute lg:right-12 top-1/2 lg:-translate-y-1/2 mt-16 lg:mt-0 w-full flex items-center justify-center relative z-10 min-h-[300px] lg:min-h-[500px]">
             <motion.div 
               className="pointer-events-auto cursor-pointer"
               onClick={() => { setIsGlowing(true); setTimeout(() => setIsGlowing(false), 1000); }}
             >
               <AnimatedScissor isGlowing={isGlowing} />
             </motion.div>
          </div>
          
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-6 lg:left-12 flex flex-col items-center gap-4 text-muted hidden md:flex"
        >
          <span className="writing-vertical font-sans text-xs tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-muted to-transparent"></div>
        </motion.div>
      </section>

      {/* Manifesto / Stats Section */}
      <section className="py-32 bg-matte-light px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute -left-[20vw] top-[10%] w-[50vw] h-[50vw] border border-matte-lighter rounded-full pointer-events-none"></div>
        
        <div className="max-w-[90rem] mx-auto flex flex-col lg:flex-row gap-20 lg:gap-32">
          <div className="lg:w-1/2 flex flex-col justify-center">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="font-serif italic text-4xl lg:text-6xl text-offwhite mb-10 leading-tight"
            >
              "Sinta-se em casa, com o cuidado que você merece."
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-sans text-muted text-lg leading-relaxed max-w-md"
            >
              Nossa barbearia em Montezuma foi pensada para ser o seu momento de pausa. Trocamos a pressa do dia a dia por atenção, boa conversa e um serviço de primeira.
            </motion.p>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 gap-x-8 gap-y-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="text-6xl lg:text-8xl font-sans font-bold text-transparent" style={{ WebkitTextStroke: '1px var(--color-crimson)' }}>01</div>
              <h3 className="font-sans font-bold text-xl uppercase tracking-widest mt-2 mb-4 text-offwhite">Atenção</h3>
              <p className="font-sans text-sm text-muted">Cada cabelo e barba têm sua história. Nós escutamos o que você quer e usamos nossa experiência para entregar o melhor resultado.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative lg:mt-16"
            >
              <div className="text-6xl lg:text-8xl font-sans font-bold text-transparent" style={{ WebkitTextStroke: '1px var(--color-crimson)' }}>02</div>
              <h3 className="font-sans font-bold text-xl uppercase tracking-widest mt-2 mb-4 text-offwhite">Tranquilidade</h3>
              <p className="font-sans text-sm text-muted">Esqueça a bagunça. Criamos um espaço super agradável para você tomar um cafézinho, trocar uma ideia e sair renovado.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="text-6xl lg:text-8xl font-sans font-bold text-transparent" style={{ WebkitTextStroke: '1px var(--color-crimson)' }}>03</div>
              <h3 className="font-sans font-bold text-xl uppercase tracking-widest mt-2 mb-4 text-offwhite">Cuidado</h3>
              <p className="font-sans text-sm text-muted">Trabalhamos com produtos de muita qualidade que respeitam a sua pele e os seus fios, garantindo que o visual fique bom por mais tempo.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image break section */}
      <section className="h-[60vh] lg:h-[80vh] w-full relative overflow-hidden">
        <motion.img 
          style={{ y: y2, scale: 1.1 }}
          src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=2000" 
          alt="Razor detail"
          className="w-full h-[120%] object-cover grayscale"
        />
        <div className="absolute inset-0 bg-matte/50 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="font-sans font-bold text-6xl md:text-8xl lg:text-[10rem] text-offwhite uppercase tracking-tighter mix-blend-overlay opacity-80">
            A Arte
          </h2>
        </div>
      </section>
    </PageTransition>
  );
}
