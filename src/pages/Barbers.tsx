import { motion } from 'motion/react';
import PageTransition from '../components/PageTransition';
import { Page } from '../App';

const barbers = [
  {
    name: 'JOÃO',
    surname: 'NETO',
    specialty: 'Cortes & Barbas',
    description: 'Sempre de bem com a vida, o João adora um bom dedo de prosa. É especialista em entender exatamente o que você quer e transformar isso em um corte excelente que facilita o seu dia a dia.',
  },
  {
    name: 'CRISTIAN',
    surname: 'MAURO',
    specialty: 'Clássicos & Modernos',
    description: 'Atencioso e muito detalhista, o Cristian tem a mão super leve e um talento incrível para acertar na mosca o visual que mais combina com você. Pode sentar na cadeira dele e relaxar.',
  }
];

export default function Barbers({ onNavigate }: { onNavigate?: (p: Page) => void }) {
  return (
    <PageTransition>
      <section className="pt-32 lg:pt-48 pb-32 px-6 lg:px-12 bg-matte">
        <div className="max-w-[90rem] mx-auto">
          
          <div className="mb-24 lg:mb-32">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-sans font-bold text-5xl lg:text-[7rem] text-offwhite leading-[0.85] tracking-tighter uppercase"
            >
              A<br/>Equipe<span className="text-crimson">.</span>
            </motion.h2>
          </div>

          <div className="flex flex-col gap-32">
            {barbers.map((barber, index) => (
              <div 
                key={index}
                className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}
              >
                {/* Monograma no lugar da foto */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, filter: 'grayscale(100%) blur(10px)' }}
                  whileInView={{ opacity: 1, scale: 1, filter: 'grayscale(100%) blur(0px)' }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="w-full lg:w-1/2 relative group"
                >
                  <div className="aspect-[3/4] lg:aspect-square overflow-hidden relative flex items-center justify-center bg-matte-light">
                    <span className="font-sans font-bold text-[9rem] lg:text-[12rem] leading-none text-offwhite/15 uppercase tracking-tighter select-none">
                      {barber.name[0]}{barber.surname[0]}
                    </span>
                    <div className="absolute inset-0 bg-matte/30 mix-blend-multiply"></div>
                  </div>
                  {/* Decorative element */}
                  <div className={`absolute top-1/2 -translate-y-1/2 ${index % 2 !== 0 ? '-left-6' : '-right-6'} w-12 h-32 bg-crimson mix-blend-difference hidden lg:block`}></div>
                </motion.div>

                {/* Text */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full lg:w-1/2 flex flex-col"
                >
                  <span className="text-crimson font-sans text-xs tracking-[0.2em] uppercase font-bold mb-4 block">
                    {barber.specialty}
                  </span>
                  
                  <h3 className="font-sans font-bold text-6xl lg:text-8xl text-offwhite uppercase tracking-tighter leading-none mb-6">
                    {barber.name}<br/>
                    <span className="text-transparent" style={{ WebkitTextStroke: '1px var(--color-offwhite)' }}>{barber.surname}</span>
                  </h3>
                  
                  <p className="text-muted font-sans text-lg max-w-md mb-10">
                    {barber.description}
                  </p>

                  <div className="w-fit">
                    <button 
                      onClick={() => onNavigate && onNavigate('booking')}
                      className="group flex items-center gap-4 text-offwhite hover:text-crimson transition-colors font-sans uppercase tracking-[0.2em] text-sm font-bold"
                    >
                      <span>Agendar</span>
                      <span className="w-12 h-[1px] bg-offwhite group-hover:bg-crimson group-hover:w-20 transition-all duration-300"></span>
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </PageTransition>
  );
}
