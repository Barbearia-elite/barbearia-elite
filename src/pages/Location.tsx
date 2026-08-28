import { motion } from 'motion/react';
import PageTransition from '../components/PageTransition';
import { MapPin, Clock, MessageCircle, Instagram, Facebook, Map } from 'lucide-react';

export default function Location() {
  return (
    <PageTransition>
      <section className="pt-16 lg:pt-32 pb-24 px-6 lg:px-12 bg-matte">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-crimson uppercase tracking-[0.3em] font-sans text-xs font-bold block mb-4"
            >
              Venha nos Visitar
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-sans font-bold text-5xl lg:text-7xl text-offwhite tracking-tighter uppercase"
            >
              Como <span className="text-crimson">Chegar</span>
            </motion.h2>
          </div>

          <div className="flex flex-col gap-12">
            
            {/* Map Placeholder */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full h-[400px] bg-matte-light/40 border border-matte-lighter p-2 relative rounded-none overflow-hidden block group"
            >
              <div className="absolute inset-0 bg-matte flex items-center justify-center flex-col gap-4 m-2">
                <MapPin className="w-12 h-12 text-crimson" />
                <span className="text-offwhite/40 font-sans tracking-[0.2em] uppercase text-xs font-bold">Localização em Montezuma - MG</span>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Rua+Principal%2C+Centro%2C+Montezuma+-+MG%2C+39540-000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-crimson text-[10px] uppercase tracking-widest font-bold mt-2 flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1"
                >
                  <Map className="w-4 h-4" /> Abrir no Google Maps
                </a>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mt-8">
              {/* Address and Actions */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                <div className="flex gap-6">
                  <div className="mt-1">
                    <MapPin className="w-6 h-6 text-crimson" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-2xl text-offwhite uppercase tracking-wider mb-3">Endereço</h3>
                    <p className="text-muted font-sans text-sm leading-relaxed mb-8">
                      Rua Principal, 123<br />
                      Centro, Montezuma - MG<br />
                      CEP: 39540-000
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a href="#" className="btn-crimson !py-3 !px-6 !min-h-0 !text-[10px] w-fit">
                        <Map className="w-4 h-4 mr-2" /> Google Maps
                      </a>
                      <a href="https://wa.me/553899746305" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-matte-lighter text-offwhite hover:border-crimson hover:text-crimson transition-colors duration-300 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] w-fit">
                        <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Hours and Contact */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-10"
              >
                {/* Hours */}
                <div className="flex gap-6">
                  <div className="mt-1">
                    <Clock className="w-6 h-6 text-crimson" />
                  </div>
                  <div className="w-full">
                    <h3 className="font-sans font-bold text-2xl text-offwhite uppercase tracking-wider mb-3">Horário</h3>
                    <ul className="text-muted font-sans text-sm space-y-3">
                      <li className="flex justify-between w-full max-w-[280px] border-b border-matte-lighter pb-2">
                        <span>Segunda a Quarta</span>
                        <span>08:30 às 19:00</span>
                      </li>
                      <li className="flex justify-between w-full max-w-[280px] border-b border-matte-lighter pb-2">
                        <span>Quinta e Sexta</span>
                        <span>08:00 às 19:00</span>
                      </li>
                      <li className="flex justify-between w-full max-w-[280px] border-b border-matte-lighter pb-2">
                        <span>Sábado</span>
                        <span>08:00 às 15:00</span>
                      </li>
                      <li className="flex justify-between w-full max-w-[280px] text-crimson pb-2">
                        <span>Domingo</span>
                        <span>Fechado</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Socials */}
                <div className="space-y-2">
                  <span className="text-muted font-sans font-bold uppercase tracking-widest text-xs">Siga-nos:</span>
                  <div className="flex items-center gap-6 pt-2">
                    <a
                      href="https://www.instagram.com/explore/tags/barbeariaelite"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram da Barbearia Elite"
                      className="w-12 h-12 border border-matte-lighter flex items-center justify-center text-offwhite hover:border-crimson hover:text-crimson hover:-translate-y-1 transition-all duration-300"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a
                      href="https://www.facebook.com/search/top?q=Barbearia%20Elite"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook da Barbearia Elite"
                      className="w-12 h-12 border border-matte-lighter flex items-center justify-center text-offwhite hover:border-crimson hover:text-crimson hover:-translate-y-1 transition-all duration-300"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
