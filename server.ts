import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

try {
  process.loadEnvFile();
} catch {
  /* sem .env no diretório atual — usa as variáveis de ambiente do processo */
}

const isProduction = process.env.NODE_ENV === 'production';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} é obrigatória. Copie o .env.example para .env e preencha os valores (ver README.md).`
    );
  }
  return value;
}

const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const SESSION_SECRET = requireEnv('SESSION_SECRET');
const JOAO_TOKEN = requireEnv('JOAO_TOKEN');
const CRISTIAN_TOKEN = requireEnv('CRISTIAN_TOKEN');

const PORT = Number(process.env.PORT || 3000);
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const BARBERS = ['João Neto', 'Cristian Mauro'] as const;
const BARBER_CHOICES = [...BARBERS, 'Qualquer um'] as const;

const SERVICES: Record<string, { durationMinutes: number }> = {
  Cabelo: { durationMinutes: 30 },
  Barba: { durationMinutes: 30 },
  'Cabelo & Barba': { durationMinutes: 60 }
};

interface DaySchedule {
  isOpen: boolean;
  open: string;
  close: string;
}

type WeeklySchedule = Record<string, DaySchedule>;

const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  '0': { isOpen: false, open: '08:00', close: '12:00' },
  '1': { isOpen: true, open: '08:30', close: '19:00' },
  '2': { isOpen: true, open: '08:30', close: '19:00' },
  '3': { isOpen: true, open: '08:30', close: '19:00' },
  '4': { isOpen: true, open: '08:00', close: '19:00' },
  '5': { isOpen: true, open: '08:00', close: '19:00' },
  '6': { isOpen: true, open: '08:00', close: '15:00' }
};

interface SessionPayload {
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

interface BookingRow {
  id: string;
  barber: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  status: string;
  notes?: string | null;
  created_at?: string;
}

interface BlockedSlotRow {
  id: string;
  date: string;
  time: string | null;
  barber: string;
  reason?: string | null;
  created_at?: string;
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: SessionPayload;
    }
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function b64url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function createSignedToken(payload: SessionPayload): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signature = createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifySignedToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  const expected = createHmac('sha256', SESSION_SECRET).update(`${headerB64}.${payloadB64}`).digest('base64url');
  const received = Buffer.from(signatureB64);
  const expectedBuf = Buffer.from(expected);
  if (received.length !== expectedBuf.length || !timingSafeEqual(received, expectedBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    if (typeof payload.name !== 'string' || !payload.name) return null;
    return payload;
  } catch {
    return null;
  }
}

function rateLimit(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits) {
      const remaining = timestamps.filter((t) => now - t < windowMs);
      if (remaining.length === 0) hits.delete(ip);
      else hits.set(ip, remaining);
    }
  }, 10 * 60 * 1000);
  sweep.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const timestamps = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    if (timestamps.length >= max) {
      return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns instantes.' });
    }
    timestamps.push(now);
    hits.set(ip, timestamps);
    next();
  };
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = bearer || req.cookies?.barbearia_admin_token;
  const payload = typeof token === 'string' ? verifySignedToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: 'Não autorizado. Faça login novamente.' });
  }
  req.adminUser = payload;
  next();
}

function isValidDateStr(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

function isValidTimeStr(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidPhone(value: unknown): value is string {
  return typeof value === 'string' && /^\+?[\d().\s-]{8,20}$/.test(value.trim());
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getDayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00`).getDay();
}

function todayLocal(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function normalizeSchedule(raw: unknown): WeeklySchedule {
  const result: WeeklySchedule = { ...DEFAULT_WEEKLY_SCHEDULE };
  if (raw && typeof raw === 'object') {
    for (const key of Object.keys(DEFAULT_WEEKLY_SCHEDULE)) {
      const day = (raw as Record<string, unknown>)[key];
      if (day && typeof day === 'object') {
        const config = day as Partial<DaySchedule>;
        result[key] = {
          isOpen: Boolean(config.isOpen),
          open: isValidTimeStr(config.open) ? config.open : DEFAULT_WEEKLY_SCHEDULE[key].open,
          close: isValidTimeStr(config.close) ? config.close : DEFAULT_WEEKLY_SCHEDULE[key].close
        };
      }
    }
  }
  return result;
}

async function getWeeklySchedule(): Promise<WeeklySchedule> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'weekly_schedule')
    .maybeSingle();
  if (error) throw error;
  return normalizeSchedule(data?.value);
}

async function saveWeeklySchedule(schedule: WeeklySchedule): Promise<WeeklySchedule> {
  const clean = normalizeSchedule(schedule);
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'weekly_schedule', value: clean, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
  return clean;
}

async function listBlockedSlots(): Promise<BlockedSlotRow[]> {
  const { data, error } = await supabase
    .from('blocked_slots')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as BlockedSlotRow[];
}

async function listBookings(): Promise<BookingRow[]> {
  const { data, error } = await supabase.from('bookings').select('*');
  if (error) throw error;
  return (data || []) as BookingRow[];
}

function isFullDayBlock(block: Pick<BlockedSlotRow, 'time'> | undefined): boolean {
  return block !== undefined && (block.time === null || block.time === undefined || block.time === '' || block.time === 'full_day');
}

interface Occupancy {
  perBarber: Record<string, Set<string>>;
  isDayClosed: boolean;
  dayClosedReason: string;
}

function computeOccupancy(
  date: string,
  schedule: WeeklySchedule,
  bookings: BookingRow[],
  blocks: BlockedSlotRow[],
  durationMinutes: number,
  dayOfWeek: number
): Occupancy {
  const dayCfg = schedule[String(dayOfWeek)];
  const scheduleClosed = !dayCfg || !dayCfg.isOpen;

  const allDayTodos = blocks.find(
    (b) => b.date === date && isFullDayBlock(b) && b.barber === 'Todos'
  );

  const isDayClosed = scheduleClosed || Boolean(allDayTodos);
  const dayClosedReason = allDayTodos?.reason || (scheduleClosed ? 'Não haverá expediente neste dia.' : 'Barbearia fechada nesta data.');

  const bookingsOfDate = bookings.filter((b) => b.date === date && b.status !== 'cancelado');
  const blocksOfDate = blocks.filter((b) => b.date === date);

  const resultSlots: string[] = [];
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    resultSlots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  }

  const perBarber: Record<string, Set<string>> = {};
  for (const barber of BARBERS) perBarber[barber] = new Set<string>();

  for (const slot of resultSlots) {
    const startMin = toMinutes(slot);
    const endMin = startMin + durationMinutes;

    const timeBlockedFor = (barber: string): boolean => {
      return blocksOfDate.some((b) => {
        if (isFullDayBlock(b)) return b.barber === 'Todos' || b.barber === barber;
        if (b.time && (b.barber === 'Todos' || b.barber === barber)) {
          const blockStart = toMinutes(b.time);
          const blockEnd = blockStart + 30;
          return startMin < blockEnd && endMin > blockStart;
        }
        return false;
      });
    };

    const bookingBlocks = (barber: string): boolean => {
      for (const booking of bookingsOfDate) {
        if (booking.barber !== barber && booking.barber !== 'Qualquer um') continue;
        const duration = SERVICES[booking.service]?.durationMinutes || 30;
        const bookingStart = toMinutes(booking.time);
        const bookingEnd = bookingStart + duration;
        if (startMin < bookingEnd && endMin > bookingStart) return true;
      }
      return false;
    };

    for (const barber of BARBERS) {
      if (isDayClosed || timeBlockedFor(barber) || bookingBlocks(barber)) {
        perBarber[barber].add(slot);
      }
    }
  }

  return { perBarber, isDayClosed, dayClosedReason };
}

function occupancyForBarber(occupancy: Occupancy, barber: string): string[] {
  if (barber === 'Qualquer um') {
    const joao = occupancy.perBarber['João Neto'];
    const cristian = occupancy.perBarber['Cristian Mauro'];
    const both: string[] = [];
    for (const slot of joao) {
      if (cristian.has(slot)) both.push(slot);
    }
    both.sort();
    return both;
  }
  const set = occupancy.perBarber[barber] || new Set<string>();
  return [...set].sort();
}

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.set('X-XSS-Protection', '0');
  next();
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post('/api/auth/login', rateLimit(10, 60 * 1000), (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  const token = typeof body.token === 'string' ? body.token.trim() : '';

  if (!token) {
    return res.status(400).json({ error: 'Informe o Token de Acesso.' });
  }

  let email = '';
  let name = '';
  if (token === JOAO_TOKEN) {
    email = 'joaonetopardim67@gmail.com';
    name = 'João Neto';
  } else if (token === CRISTIAN_TOKEN) {
    email = 'cristianmauro.barbearia@gmail.com';
    name = 'Cristian Mauro';
  } else {
    return res.status(401).json({ error: 'Token de Acesso inválido. Verifique se o token está correto.' });
  }

  const now = Date.now();
  const payload: SessionPayload = { email, name, role: 'barber', iat: now, exp: now + SESSION_TTL_MS };
  const sessionToken = createSignedToken(payload);

  res.cookie('barbearia_admin_token', sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS
  });

  return res.json({
    success: true,
    token: sessionToken,
    user: { email, name, role: payload.role, expiresAt: payload.exp }
  });
});

app.get('/api/auth/session', requireAuth, (req: Request, res: Response) => {
  const user = req.adminUser!;
  return res.json({
    authenticated: true,
    user: { email: user.email, name: user.name, role: user.role, expiresAt: user.exp }
  });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('barbearia_admin_token');
  res.json({ success: true });
});

app.get('/api/public/occupied-times', rateLimit(90, 60 * 1000), async (req: Request, res: Response) => {
  const query = req.query as Record<string, unknown>;
  const { date, barber, service } = query;

  if (!isValidDateStr(date)) {
    return res.status(400).json({ error: 'Data inválida.' });
  }
  const requestedBarber = typeof barber === 'string' && (BARBER_CHOICES as readonly string[]).includes(barber) ? barber : 'Qualquer um';
  const serviceName = typeof service === 'string' && SERVICES[service] ? service : 'Cabelo';
  const durationMinutes = SERVICES[serviceName].durationMinutes;

  const [schedule, bookings, blocks] = await Promise.all([getWeeklySchedule(), listBookings(), listBlockedSlots()]);
  const occupancy = computeOccupancy(date, schedule, bookings, blocks, durationMinutes, getDayOfWeek(date));
  const occupiedTimes = occupancyForBarber(occupancy, requestedBarber);

  return res.json({
    occupiedTimes,
    isDayClosed: occupancy.isDayClosed,
    dayClosedReason: occupancy.dayClosedReason,
    weeklySchedule: schedule
  });
});

app.post('/api/public/bookings', rateLimit(30, 60 * 1000), async (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;

  if (body.hp_field) {
    return res.json({ success: true, booking: null });
  }

  const barber = typeof body.barber === 'string' ? body.barber : '';
  const service = typeof body.service === 'string' ? body.service : '';
  const date = body.date;
  const time = body.time;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null;

  if (!(BARBER_CHOICES as readonly string[]).includes(barber)) {
    return res.status(400).json({ error: 'Profissional inválido.' });
  }
  if (!SERVICES[service]) {
    return res.status(400).json({ error: 'Serviço inválido.' });
  }
  if (!isValidDateStr(date)) {
    return res.status(400).json({ error: 'Data inválida.' });
  }
  if (!isValidTimeStr(time)) {
    return res.status(400).json({ error: 'Horário inválido.' });
  }
  if (name.length < 2) {
    return res.status(400).json({ error: 'Informe seu nome completo.' });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: 'Informe um telefone válido com DDD.' });
  }

  const today = todayLocal();
  const dateObj = new Date(`${date}T12:00:00`);
  const todayObj = new Date(`${today}T00:00:00`);
  if (dateObj.getTime() < todayObj.getTime()) {
    return res.status(400).json({ error: 'Não é possível agendar para uma data passada.' });
  }

  const dayOfWeek = getDayOfWeek(date);
  const [schedule, bookings, blocks] = await Promise.all([getWeeklySchedule(), listBookings(), listBlockedSlots()]);

  const dayCfg = schedule[String(dayOfWeek)];
  if (!dayCfg || !dayCfg.isOpen) {
    return res.status(400).json({ error: 'A barbearia está fechada nesta data.' });
  }

  const startMin = toMinutes(time);
  const endMin = startMin + SERVICES[service].durationMinutes;
  if (startMin < toMinutes(dayCfg.open) || endMin > toMinutes(dayCfg.close)) {
    return res.status(400).json({ error: 'Horário fora do expediente.' });
  }

  if (date === today) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (startMin <= nowMin) {
      return res.status(400).json({ error: 'Não é possível agendar para um horário que já passou.' });
    }
  }

  const occupancy = computeOccupancy(date, schedule, bookings, blocks, SERVICES[service].durationMinutes, dayOfWeek);
  const occupiedTimes = occupancyForBarber(occupancy, barber);

  if (occupancy.isDayClosed) {
    return res.status(409).json({ code: 'SLOT_BLOCKED', error: 'A barbearia está fechada nesta data. Escolha outro dia.' });
  }
  if (occupiedTimes.includes(time)) {
    return res.status(409).json({ code: 'SLOT_OCCUPIED', error: 'Esse horário acabou de ser reservado por outra pessoa. Selecione outro horário.' });
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({ barber, service, date, time, name, phone, status: 'confirmado', notes })
    .select()
    .single();
  if (error) throw error;

  return res.status(201).json({ success: true, booking: data });
});

app.get('/api/admin/bookings', requireAuth, rateLimit(180, 60 * 1000), async (req: Request, res: Response) => {
  const query = req.query as Record<string, unknown>;
  const page = req.adminUser!;

  let all = await listBookings();

  if (page.name === 'João Neto' || page.name === 'Cristian Mauro') {
    all = all.filter((b) => b.barber === page.name || b.barber === 'Qualquer um');
  }

  if (typeof query.date === 'string' && query.date) {
    all = all.filter((b) => b.date === query.date);
  }
  if (typeof query.startDate === 'string' && typeof query.endDate === 'string' && query.startDate && query.endDate) {
    all = all.filter((b) => b.date >= query.startDate && b.date <= query.endDate);
  }
  if (typeof query.barber === 'string' && query.barber) {
    all = all.filter((b) => b.barber === query.barber);
  }
  if (typeof query.status === 'string' && query.status) {
    all = all.filter((b) => b.status === query.status);
  }
  if (typeof query.search === 'string' && query.search.trim()) {
    const term = query.search.trim().toLowerCase();
    all = all.filter((b) => b.name.toLowerCase().includes(term) || b.phone.toLowerCase().includes(term));
  }

  all.sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));

  return res.json({ bookings: all });
});

app.patch('/api/admin/bookings/:id/status', requireAuth, rateLimit(180, 60 * 1000), async (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  const status = typeof body.status === 'string' ? body.status : '';
  if (!['confirmado', 'concluido', 'cancelado'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  const { data: existing, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!existing) {
    return res.status(404).json({ error: 'Agendamento não encontrado.' });
  }

  const page = req.adminUser!;
  if ((page.name === 'João Neto' || page.name === 'Cristian Mauro') && existing.barber !== page.name && existing.barber !== 'Qualquer um') {
    return res.status(403).json({ error: 'Sem permissão para alterar este agendamento.' });
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw error;

  return res.json({ booking: data });
});

app.get('/api/admin/schedule-settings', requireAuth, rateLimit(120, 60 * 1000), async (_req: Request, res: Response) => {
  const [weeklySchedule, blockedSlots] = await Promise.all([getWeeklySchedule(), listBlockedSlots()]);
  return res.json({ weeklySchedule, blockedSlots });
});

app.put('/api/admin/schedule-settings', requireAuth, rateLimit(120, 60 * 1000), async (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  const raw = body.weeklySchedule;
  if (!raw || typeof raw !== 'object') {
    return res.status(400).json({ error: 'Cronograma inválido.' });
  }
  const clean = await saveWeeklySchedule(raw as WeeklySchedule);
  return res.json({ weeklySchedule: clean });
});

app.post('/api/admin/blocked-slots', requireAuth, rateLimit(120, 60 * 1000), async (req: Request, res: Response) => {
  const body = (req.body || {}) as Record<string, unknown>;
  const date = body.date;
  const barber = typeof body.barber === 'string' ? body.barber : '';
  const reason = typeof body.reason === 'string' && body.reason.trim() ? body.reason.trim() : null;

  if (!isValidDateStr(date)) {
    return res.status(400).json({ error: 'Data inválida.' });
  }
  if (barber !== 'Todos' && barber !== 'João Neto' && barber !== 'Cristian Mauro') {
    return res.status(400).json({ error: 'Barbeiro inválido.' });
  }

  let time: string | null = null;
  if (typeof body.time === 'string' && body.time !== '' && body.time !== 'full_day') {
    if (!isValidTimeStr(body.time)) {
      return res.status(400).json({ error: 'Horário inválido para o bloqueio.' });
    }
    time = body.time;
  }

  const { error } = await supabase
    .from('blocked_slots')
    .insert({ date, time, barber, reason });
  if (error) throw error;

  const blockedSlots = await listBlockedSlots();
  return res.status(201).json({ blockedSlots });
});

app.delete('/api/admin/blocked-slots/:id', requireAuth, rateLimit(180, 60 * 1000), async (req: Request, res: Response) => {
  const { error } = await supabase.from('blocked_slots').delete().eq('id', req.params.id);
  if (error) throw error;

  const blockedSlots = await listBlockedSlots();
  return res.json({ blockedSlots });
});

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir, { index: false }));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    next();
  });
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server]', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Erro interno no servidor. Tente novamente em instantes.' });
});

app.listen(PORT, () => {
  console.log(`Barbearia Elite rodando em http://localhost:${PORT}`);
});