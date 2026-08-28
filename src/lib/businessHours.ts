export interface DaySchedule {
  isOpen: boolean;
  open: string;
  close: string;
}

export interface WeeklySchedule {
  0: DaySchedule; // Domingo
  1: DaySchedule; // Segunda
  2: DaySchedule; // Terça
  3: DaySchedule; // Quarta
  4: DaySchedule; // Quinta
  5: DaySchedule; // Sexta
  6: DaySchedule; // Sábado
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM ou vazio para dia inteiro
  barber: string; // 'Todos' | 'João Neto' | 'Cristian Mauro'
  reason?: string;
  created_at?: string;
}

export const SERVICES = {
  'Cabelo': { durationMinutes: 30 },
  'Barba': { durationMinutes: 30 },
  'Cabelo & Barba': { durationMinutes: 60 }
};

export const DEFAULT_BUSINESS_HOURS: WeeklySchedule = {
  0: { isOpen: false, open: '08:00', close: '12:00' }, // Domingo fechado
  1: { isOpen: true, open: '08:30', close: '19:00' },
  2: { isOpen: true, open: '08:30', close: '19:00' },
  3: { isOpen: true, open: '08:30', close: '19:00' },
  4: { isOpen: true, open: '08:00', close: '19:00' },
  5: { isOpen: true, open: '08:00', close: '19:00' },
  6: { isOpen: true, open: '08:00', close: '15:00' }
};

// Gera todos os slots de horário disponíveis para uma data considerando o cronograma semanal
export function getAvailableTimes(
  dateStr: string, 
  serviceName: string,
  customSchedule?: WeeklySchedule
): string[] {
  if (!dateStr || !serviceName) return [];
  const service = (SERVICES as any)[serviceName];
  const durationMinutes = service ? service.durationMinutes : 30;

  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const dayOfWeek = dateObj.getDay() as keyof WeeklySchedule;

  const schedule = customSchedule || DEFAULT_BUSINESS_HOURS;
  const dayConfig = schedule[dayOfWeek];

  if (!dayConfig || !dayConfig.isOpen) return [];

  const times: string[] = [];
  let [currentHour, currentMinute] = dayConfig.open.split(':').map(Number);
  const [closeHour, closeMinute] = dayConfig.close.split(':').map(Number);

  while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
    const endMinute = currentMinute + durationMinutes;
    const endHourTemp = currentHour + Math.floor(endMinute / 60);
    const endMinuteTemp = endMinute % 60;

    if (endHourTemp < closeHour || (endHourTemp === closeHour && endMinuteTemp <= closeMinute)) {
      times.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
    }

    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute -= 60;
    }
  }

  return times;
}

// Gera todos os horários padrão possíveis de um dia para o painel de bloqueio/desbloqueio
export function generateDayTimeSlots(open = '07:00', close = '21:00', interval = 30): string[] {
  const times: string[] = [];
  let [curH, curM] = open.split(':').map(Number);
  const [endH, endM] = close.split(':').map(Number);

  while (curH < endH || (curH === endH && curM <= endM)) {
    times.push(`${curH.toString().padStart(2, '0')}:${curM.toString().padStart(2, '0')}`);
    curM += interval;
    if (curM >= 60) {
      curH += 1;
      curM -= 60;
    }
  }
  return times;
}
