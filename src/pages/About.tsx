import { motion } from 'motion/react';
import PageTransition from '../components/PageTransition';
import { Target, ShieldAlert, Fingerprint, GripHorizontal } from 'lucide-react';

export default function About() {
  return (
    <PageTransition>
      <section className="pt-32 lg:pt-48 pb-24 px-6 lg:px-12 bg-matte overflow-hidden relative">
        <div className="absolute top-20 right-0 w-[50vw] h-[50vw] border-[1px] border-matte-lighter rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-[90rem] mx-auto mb-32 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
            
            {/* Title / Intro (Left overlap) */}
            <div className="lg:col-span-5 lg:col-start-1 z-20">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-crimson uppercase tracking-[0.3em] font-sans text-xs font-bold mb-8 block"
              >
                Nossa História
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-sans font-bold text-5xl lg:text-7xl text-offwhite leading-[0.9] tracking-tighter uppercase mb-8"
              >
                Feito <br/>Pra <br/><span className="text-transparent" style={{ WebkitTextStroke: '1px var(--color-offwhite)' }}>Você</span><br/>Relaxar.
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="font-sans text-muted text-base max-w-sm"
              >
                <p className="mb-4">
                  A brbr elite nasceu de uma vontade bem simples: oferecer um lugar super aconchegante em Montezuma onde fazer a barba e cortar o cabelo fosse um momento gostoso do dia, e não só mais uma obrigação.
                </p>
                <p>
                  Nós gostamos do simples e bem feito. Sem frescuras, mas com muito respeito pelo seu tempo e pelo seu estilo único.
                </p>
              </motion.div>
            </div>

            {/* Image Composition (Right) */}
            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-8 lg:col-start-5 relative mt-8 lg:mt-0 mb-12 sm:mb-16"
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full">
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1600" 
                    alt="Barber working" 
                    loading="lazy"
                    className="w-full h-full object-cover object-center grayscale brightness-50 contrast-125"
                  />
                  <div className="absolute inset-0 bg-crimson mix-blend-color opacity-20"></div>
                </div>
                <div className="absolute -bottom-6 sm:-bottom-10 -left-4 sm:-left-10 bg-matte p-6 lg:p-12 w-11/12 sm:w-3/4 md:w-2/3 border-r border-t border-matte-lighter shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10">
                  <p className="font-serif italic text-lg sm:text-2xl text-offwhite">
                    "Um bom papo, um café quente e um corte de respeito."
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Pilares */}
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 mb-32 border-t border-matte-lighter pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col group"
          >
            <Target className="w-8 h-8 text-crimson mb-6 group-hover:-translate-y-2 transition-transform duration-300" />
            <h3 className="font-sans font-bold uppercase tracking-wider text-xl text-offwhite mb-4">O Essencial</h3>
            <p className="text-muted font-sans text-sm leading-relaxed">
              Fazemos o básico com excelência: cabelo e barba. Sem invenções, focando no que realmente importa para o seu bem-estar.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col group"
          >
            <ShieldAlert className="w-8 h-8 text-crimson mb-6 group-hover:-translate-y-2 transition-transform duration-300" />
            <h3 className="font-sans font-bold uppercase tracking-wider text-xl text-offwhite mb-4">Seu Estilo</h3>
            <p className="text-muted font-sans text-sm leading-relaxed">
              Mais do que seguir a moda, queremos entender o que combina com você e com a sua rotina no dia a dia.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col group"
          >
            <Fingerprint className="w-8 h-8 text-crimson mb-6 group-hover:-translate-y-2 transition-transform duration-300" />
            <h3 className="font-sans font-bold uppercase tracking-wider text-xl text-offwhite mb-4">Nossa Marca</h3>
            <p className="text-muted font-sans text-sm leading-relaxed">
              A dedicação ao acabamento e o cuidado com cada detalhezinho do corte são o que nos faz tão felizes com o nosso trabalho.
            </p>
          </motion.div>
        </div>

        {/* Manifesto List */}
        <div className="max-w-[90rem] mx-auto bg-matte-light p-10 lg:p-20 relative overflow-hidden">
          <GripHorizontal className="absolute -top-10 -right-10 w-40 h-40 text-matte-lighter opacity-20" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <h2 className="font-sans font-bold text-4xl text-offwhite uppercase tracking-tighter">Nossos Valores<span className="text-crimson">.</span></h2>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-6">
              {[
                "Valorizamos muito o seu tempo. Procuramos ser bem pontuais para que seu dia renda mais.",
                "Sinta-se em casa. Quer bater papo? Adoramos! Quer apenas relaxar em silêncio? Fica à vontade.",
                "A higiene e a limpeza do nosso espaço são levadas muito a sério para sua segurança e conforto.",
                "Usamos ótimos equipamentos e produtos para garantir um corte suave, sem irritar a pele.",
                "Queremos que você saia daqui com um baita sorriso no rosto e a confiança lá em cima."
              ].map((regra, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-b border-matte-lighter pb-6 group"
                >
                  <p className="text-offwhite font-sans text-lg lg:text-xl font-medium tracking-wide group-hover:text-crimson transition-colors duration-300">
                    {regra}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </PageTransition>
  );
}
