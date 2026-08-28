import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Calendar, Clock, User, Phone, Sparkles } from 'lucide-react';
import { getAvailableTimes, WeeklySchedule } from '../lib/businessHours';

type BookingData = {
  barber: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
};

const steps = ['Profissional', 'Serviço', 'Data e Hora', 'Seus Dados', 'Confirmado'];

function todayLocal(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function Booking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingData>({
    barber: '', service: '', date: '', time: '', name: '', phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [dayClosedReason, setDayClosedReason] = useState('');
  const [serverSchedule, setServerSchedule] = useState<WeeklySchedule | undefined>(undefined);

  const currentAvailableTimes = getAvailableTimes(formData.date, formData.service, serverSchedule);

  useEffect(() => {
    if (formData.date && formData.barber && formData.service) {
      const fetchBookedTimes = async () => {
        setIsLoadingTimes(true);
        setErrorMessage(null);
        setIsDayClosed(false);
        setDayClosedReason('');
        try {
          const params = new URLSearchParams({
            date: formData.date,
            barber: formData.barber,
            service: formData.service
          });
          const res = await fetch(`/api/public/occupied-times?${params.toString()}`);
          if (!res.ok) {
            throw new Error('Falha ao obter horários');
          }
          const data = await res.json();
          if (data.isDayClosed) {
            setIsDayClosed(true);
            setDayClosedReason(data.dayClosedReason || 'Barbearia fechada nesta data.');
            setBookedTimes([]);
          } else {
            setBookedTimes(data.occupiedTimes || []);
          }

          if (data.weeklySchedule) {
            setServerSchedule(data.weeklySchedule);
          }
        } catch (error) {
          console.error("Erro ao carregar horários ocupados:", error);
          setBookedTimes([]);
        } finally {
          setIsLoadingTimes(false);
        }
      };
      fetchBookedTimes();
    } else {
      setBookedTimes([]);
      setIsDayClosed(false);
      setDayClosedReason('');
    }
  }, [formData.date, formData.barber, formData.service]);

  const handleNext = () => {
    setErrorMessage(null);
    if (step < 5) setStep(step + 1);
  };
  const handlePrev = () => {
    setErrorMessage(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Honeypot check for bots
    const hpField = (document.getElementById('hp_field') as HTMLInputElement)?.value;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hp_field: hpField || undefined
        })
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.code === 'SLOT_OCCUPIED' || json.code === 'SLOT_BLOCKED' || res.status === 409) {
          setErrorMessage(json.error || "Esse horário está indisponível ou já foi reservado. Por favor, selecione outro horário.");
          setStep(3); // Voltar para seleção de horário
          return;
        }
        throw new Error(json.error || 'Erro ao realizar agendamento.');
      }

      if (json.booking?.barber) {
        setFormData(prev => ({ ...prev, barber: json.booking.barber }));
      }
      setStep(5);
    } catch (error: any) {
      console.error("Erro ao salvar agendamento:", error);
      setErrorMessage(error.message || "Ocorreu um erro ao processar o agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.barber !== '';
      case 2: return formData.service !== '';
      case 3: return formData.date !== '' && formData.time !== '' && !isDayClosed;
      case 4: {
        const phoneRegex = /^\(?\d{2}\)?\s?(9?\d{4})[-.\s]?(\d{4})$/;
        return formData.name.trim().length >= 2 && phoneRegex.test(formData.phone.trim());
      }
      default: return true;
    }
  };

  const updateData = (field: keyof BookingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PageTransition>
      <section className="min-h-screen pt-28 pb-20 px-6 max-w-4xl mx-auto flex flex-col justify-center">
        
        {/* Header Title */}
        <div className="mb-10 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-crimson font-bold block mb-3">
            Agendamento Rápido & Seguro
          </span>
          <h1 className="font-sans font-black text-4xl md:text-6xl uppercase tracking-tighter text-offwhite">
            Reserve seu <span className="italic font-serif font-normal text-crimson">Atendimento</span>
          </h1>
        </div>

        {/* Multi-step Navigation Bar */}
        <div className="flex justify-between items-center mb-10 border-b border-matte-lighter pb-4 overflow-x-auto">
          {steps.map((label, idx) => (
            <div 
              key={label}
              className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors whitespace-nowrap px-2 ${
                step === idx + 1 
                  ? 'text-crimson font-bold' 
                  : step > idx + 1 
                  ? 'text-offwhite opacity-80' 
                  : 'text-muted opacity-40'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === idx + 1 ? 'bg-crimson text-white' : 'border border-current'
              }`}>
                {idx + 1}
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Global Error Message Banner */}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 text-sm font-sans"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Step Container Form */}
        <div className="relative">
          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Step 1: Barber Selection */}
                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    {[
                      { id: 'qualquer', name: 'Qualquer um', desc: 'Primeiro barbeiro que estiver livre no horário escolhido' },
                      { id: 'joao', name: 'João Neto', desc: 'Especialista em visagismo, navalha clássica e cortes modernos' },
                      { id: 'cristian', name: 'Cristian Mauro', desc: 'Mestre em barboterapia, alinhamentos e fade impecável' }
                    ].map(b => (
                      <label key={b.id} className="relative cursor-pointer group block">
                        <input type="radio" name="barber" value={b.name} checked={formData.barber === b.name} onChange={(e) => updateData('barber', e.target.value)} className="peer hidden" />
                        <div className="font-sans font-bold text-4xl md:text-6xl text-offwhite uppercase tracking-tighter opacity-40 peer-checked:opacity-100 group-hover:opacity-90 transition-all duration-300">
                          {b.name}
                        </div>
                        <p className="font-sans text-sm text-muted uppercase tracking-widest mt-2 h-0 overflow-hidden opacity-0 peer-checked:h-auto peer-checked:opacity-100 transition-all duration-300">
                          {b.desc}
                        </p>
                      </label>
                    ))}
                  </div>
                )}

                {/* Step 2: Service Selection */}
                {step === 2 && (
                  <div className="flex flex-col gap-6">
                    {[
                      { id: 'corte', name: 'Cabelo', price: 'R$ 35', desc: 'Corte tradicional ou moderno com acabamento impecável e lavagem.' },
                      { id: 'barba', name: 'Barba', price: 'R$ 30', desc: 'Alinhamento completo, navalha esterilizada, toalha quente e pós-barba.' },
                      { id: 'combo', name: 'Cabelo & Barba', price: 'R$ 60', desc: 'Experiência completa para renovar o visual por inteiro com desconto especial.' }
                    ].map(s => (
                      <label key={s.id} className="relative cursor-pointer group block">
                        <input type="radio" name="service" value={s.name} checked={formData.service === s.name} onChange={(e) => updateData('service', e.target.value)} className="peer hidden" />
                        <div className="flex justify-between items-baseline">
                          <span className="font-sans font-bold text-4xl md:text-6xl text-offwhite uppercase tracking-tighter opacity-40 peer-checked:opacity-100 group-hover:opacity-90 transition-all duration-300">
                            {s.name}
                          </span>
                          <span className="font-sans font-bold text-2xl text-crimson opacity-60 peer-checked:opacity-100">
                            {s.price}
                          </span>
                        </div>
                        <p className="font-sans text-sm text-muted uppercase tracking-widest mt-2 h-0 overflow-hidden opacity-0 peer-checked:h-auto peer-checked:opacity-100 transition-all duration-300">
                          {s.desc}
                        </p>
                      </label>
                    ))}
                  </div>
                )}

                {/* Step 3: Date and Time */}
                {step === 3 && (
                  <div className="flex flex-col gap-8">
                    <div className="relative">
                      <span className="text-crimson text-xs uppercase tracking-widest font-bold mb-2 block flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> Data do Atendimento
                      </span>
                      <input 
                        type="date" 
                        required
                        value={formData.date}
                        min={todayLocal()}
                        onChange={(e) => {
                          updateData('date', e.target.value);
                          updateData('time', ''); // Limpa horário ao trocar data
                        }}
                        className="w-full bg-matte-light/50 border border-matte-lighter rounded-lg p-4 font-sans text-2xl md:text-4xl text-offwhite focus:outline-none focus:border-crimson transition-colors"
                      />
                    </div>

                    {isDayClosed && (
                      <div className="p-4 bg-red-900/20 border border-red-500/40 rounded-xl flex items-center gap-3 text-red-300 text-sm">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <div>
                          <strong className="block font-bold">Barbearia Fechada Nesta Data</strong>
                          <span className="text-xs text-red-300/80">{dayClosedReason || 'Não haverá expediente neste dia. Por favor, escolha outra data.'}</span>
                        </div>
                      </div>
                    )}

                    {!isDayClosed && (
                      <div className="relative">
                        <span className="text-crimson text-xs uppercase tracking-widest font-bold mb-2 block flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> Horário Disponível
                        </span>
                        <select 
                          required
                          value={formData.time}
                          onChange={(e) => updateData('time', e.target.value)}
                          className="w-full bg-matte-light/50 border border-matte-lighter rounded-lg p-4 font-sans text-2xl md:text-4xl text-offwhite focus:outline-none focus:border-crimson transition-colors appearance-none cursor-pointer"
                          disabled={isLoadingTimes || !formData.date || isDayClosed}
                        >
                          <option value="" disabled className="bg-matte text-muted text-base">
                            {!formData.date ? 'Primeiro escolha uma data acima' : isLoadingTimes ? 'Verificando horários em tempo real...' : 'Selecione um Horário'}
                          </option>
                          {currentAvailableTimes.length === 0 && formData.date && !isLoadingTimes && (
                            <option value="" disabled className="bg-matte text-red-400 text-base">
                              Nenhum horário disponível para esta data
                            </option>
                          )}
                          {currentAvailableTimes.map(t => {
                            const isBooked = bookedTimes.includes(t);
                            return (
                              <option key={t} value={t} disabled={isBooked} className="bg-matte text-base py-2">
                                {t} {isBooked ? '— (Indisponível / Reservado)' : '— (Livre)'}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Personal Info */}
                {step === 4 && (
                  <div className="flex flex-col gap-8">
                    {/* Honeypot invisible field for anti-bot protection */}
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
                      <input type="text" id="hp_field" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="relative">
                      <label className="text-crimson text-xs uppercase tracking-widest font-bold mb-2 block flex items-center gap-1.5">
                        <User className="w-4 h-4" /> Seu Nome Completo
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => updateData('name', e.target.value)}
                        className="w-full bg-matte-light/50 border border-matte-lighter rounded-lg p-4 font-sans text-xl md:text-3xl text-offwhite focus:outline-none focus:border-crimson transition-colors"
                        placeholder="Ex: Carlos Eduardo Silva"
                      />
                    </div>

                    <div className="relative">
                      <label className="text-crimson text-xs uppercase tracking-widest font-bold mb-2 block flex items-center gap-1.5">
                        <Phone className="w-4 h-4" /> WhatsApp / Celular
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => updateData('phone', e.target.value)}
                        className={`w-full bg-matte-light/50 border rounded-lg p-4 font-sans text-xl md:text-3xl text-offwhite focus:outline-none transition-colors ${
                          formData.phone && !/^\(?\d{2}\)?\s?(9?\d{4})[-.\s]?(\d{4})$/.test(formData.phone) 
                            ? 'border-red-500' 
                            : 'border-matte-lighter focus:border-crimson'
                        }`}
                        placeholder="Ex: 38999746305"
                      />
                      {formData.phone && !/^\(?\d{2}\)?\s?(9?\d{4})[-.\s]?(\d{4})$/.test(formData.phone) && (
                        <span className="text-red-400 text-xs mt-1.5 block">Formato inválido. Use DDD + Número (ex: 38 99999-9999)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Confirmation */}
                {step === 5 && (
                  <div className="flex flex-col items-start gap-8 bg-matte-light/60 p-8 md:p-12 border border-matte-lighter rounded-2xl">
                    <div className="flex items-center gap-4 text-emerald-400">
                      <CheckCircle2 className="w-12 h-12" />
                      <div>
                        <h2 className="font-sans font-bold text-3xl md:text-5xl text-offwhite tracking-tight uppercase">
                          Agendamento <span className="text-crimson">Confirmado!</span>
                        </h2>
                        <p className="text-xs uppercase tracking-widest text-muted mt-1">
                          Seu horário está garantido em nosso sistema.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-6 border-t border-matte-lighter font-sans text-sm">
                      <div className="p-4 bg-matte-lighter/30 rounded-lg">
                        <span className="text-xs uppercase text-muted block mb-1">Profissional</span>
                        <span className="text-offwhite font-bold text-lg">{formData.barber}</span>
                      </div>
                      <div className="p-4 bg-matte-lighter/30 rounded-lg">
                        <span className="text-xs uppercase text-muted block mb-1">Serviço</span>
                        <span className="text-offwhite font-bold text-lg">{formData.service}</span>
                      </div>
                      <div className="p-4 bg-matte-lighter/30 rounded-lg">
                        <span className="text-xs uppercase text-muted block mb-1">Data e Hora</span>
                        <span className="text-offwhite font-bold text-lg">{formData.date} às {formData.time}</span>
                      </div>
                      <div className="p-4 bg-matte-lighter/30 rounded-lg">
                        <span className="text-xs uppercase text-muted block mb-1">Cliente</span>
                        <span className="text-offwhite font-bold text-lg">{formData.name}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
                      <a 
                        href={`https://wa.me/553899746305?text=${encodeURIComponent(`Olá, confirmo meu agendamento na Barbearia Elite!\n\nServiço: ${formData.service}\nProfissional: ${formData.barber}\nData: ${formData.date} às ${formData.time}\nCliente: ${formData.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-crimson flex-1 text-center font-bold"
                      >
                        Enviar comprovante no WhatsApp
                      </a>
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormData({ barber: '', service: '', date: '', time: '', name: '', phone: '' });
                          setStep(1);
                        }} 
                        className="px-6 py-4 border border-matte-lighter rounded-none text-xs uppercase tracking-widest text-muted hover:text-offwhite hover:border-crimson transition-all cursor-pointer font-bold"
                      >
                        Novo Agendamento
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step < 5 && (
              <div className="flex justify-between items-center mt-14 pt-8 border-t border-matte-lighter">
                {step > 1 ? (
                  <button type="button" onClick={handlePrev} className="text-muted hover:text-offwhite transition-colors flex items-center gap-2 uppercase text-xs tracking-widest font-bold group cursor-pointer">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retornar
                  </button>
                ) : <div></div>}
                
                <motion.button 
                  type="submit" 
                  disabled={!isStepValid() || isSubmitting}
                  whileHover={isStepValid() && !isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={isStepValid() && !isSubmitting ? { scale: 0.98 } : {}}
                  className={`flex items-center gap-2 px-8 py-4 uppercase text-xs tracking-[0.2em] font-bold transition-all duration-300 cursor-pointer ${
                    (!isStepValid() || isSubmitting) 
                      ? 'bg-matte-lighter text-muted opacity-50 cursor-not-allowed' 
                      : 'bg-crimson text-white hover:bg-crimson-dark shadow-lg shadow-crimson/20'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" /> Processando...
                    </span>
                  ) : step === 4 ? (
                    <>Confirmar Horário <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  ) : (
                    <>Avançar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </motion.button>
              </div>
            )}
          </form>

        </div>
      </section>
    </PageTransition>
  );
}
