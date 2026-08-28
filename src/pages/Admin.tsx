import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getStoredAdminSession, 
  loginWithToken,
  clearAdminSession, 
  checkServerSession,
  AdminUserSession 
} from '../lib/auth';
import PageTransition from '../components/PageTransition';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Scissors, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  LogOut, 
  DollarSign, 
  TrendingUp, 
  Printer, 
  ShieldCheck, 
  KeyRound, 
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  List,
  Download,
  BarChart3,
  Settings
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  WeeklySchedule, 
  DEFAULT_BUSINESS_HOURS 
} from '../lib/businessHours';
import { ThemeToggleButton } from '../lib/theme';

export interface BookingRecord {
  id: number | string;
  barber: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  status: 'confirmado' | 'concluido' | 'cancelado';
  notes?: string;
  created_at?: string;
}

const SERVICE_PRICES: Record<string, number> = {
  'Cabelo': 35,
  'Barba': 30,
  'Cabelo & Barba': 60
};

const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

function formatDateLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Admin({ onNavigate }: { onNavigate?: (page: any) => void }) {
  // Session & Auth State
  const [session, setSession] = useState<AdminUserSession | null>(null);
  
  const [tokenInput, setTokenInput] = useState('');
  
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Tab View Selection: 'bookings' | 'availability' | 'analytics'
  const [activeTab, setActiveTab] = useState<'bookings' | 'availability' | 'analytics'>('bookings');

  // Bookings Data & Filters
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'all' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('');
  const [selectedBarber, setSelectedBarber] = useState<'all' | 'João Neto' | 'Cristian Mauro'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'confirmado' | 'concluido' | 'cancelado'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Schedule & Availability Management State
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(DEFAULT_BUSINESS_HOURS);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState('');

  // Helper de headers autenticados para a API
  const getAuthHeaders = useCallback(() => {
    const current = session || getStoredAdminSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (current?.token) {
      headers['Authorization'] = `Bearer ${current.token}`;
    }
    return headers;
  }, [session]);

  // Checa sessão existente ao montar
  useEffect(() => {
    async function initSession() {
      const local = getStoredAdminSession();
      if (local) {
        setSession(local);
        const verified = await checkServerSession();
        if (verified) {
          setSession(verified);
        }
      }
    }
    initSession();
  }, []);

  const getTodayStr = () => formatDateLocal(new Date());

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateLocal(d);
  };

  // Carrega agendamentos da API segura no backend
  const fetchBookings = useCallback(async () => {
    if (!session) return;
    setIsLoadingData(true);
    try {
      const params = new URLSearchParams();
      const todayStr = getTodayStr();

      if (dateFilter === 'today') {
        params.append('date', todayStr);
      } else if (dateFilter === 'tomorrow') {
        params.append('date', getTomorrowStr());
      } else if (dateFilter === 'custom' && customDate) {
        params.append('date', customDate);
      } else if (dateFilter === 'week') {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        params.append('startDate', todayStr);
        params.append('endDate', formatDateLocal(nextWeek));
      }

      if (selectedBarber !== 'all') {
        params.append('barber', selectedBarber);
      }
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        if (res.status === 401) {
          clearAdminSession();
          setSession(null);
          return;
        }
        throw new Error('Erro ao buscar agendamentos');
      }

      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [session, dateFilter, customDate, selectedBarber, selectedStatus, searchTerm, getAuthHeaders]);

  // Carrega configurações de horários e bloqueios
  const fetchScheduleSettings = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/admin/schedule-settings', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.weeklySchedule) setWeeklySchedule(data.weeklySchedule);
      }
    } catch (err) {
      console.error('Erro ao carregar horários:', err);
    }
  }, [session, getAuthHeaders]);

  useEffect(() => {
    if (session) {
      fetchBookings();
      fetchScheduleSettings();
      
      // Auto-refresh every 15 seconds
      const interval = setInterval(() => {
        fetchBookings();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [session, fetchBookings, fetchScheduleSettings]);

  // Atualiza status do agendamento
  const handleUpdateStatus = async (id: number | string, newStatus: 'confirmado' | 'concluido' | 'cancelado') => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar status');
      }

      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      alert('Não foi possível atualizar o status do agendamento.');
    }
  };

  // Salva o cronograma semanal de funcionamento
  const handleSaveWeeklySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSchedule(true);
    setScheduleSuccessMsg('');

    try {
      const res = await fetch('/api/admin/schedule-settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ weeklySchedule })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar horários.');

      setScheduleSuccessMsg('Horários de funcionamento semanais salvos com sucesso no Supabase!');
      setTimeout(() => setScheduleSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar.');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Login com Senha no Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthLoading(true);

    try {
      const res = await loginWithToken(tokenInput);
      if (res.error) {
        setAuthError(res.error);
      } else if (res.session) {
        setSession(res.session);
      }
    } catch {
      setAuthError('Falha ao conectar com o servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAdminSession();
    setSession(null);
    setTokenInput('');
  };

  // Métricas Calculadas
  const metrics = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmado').length;
    const completed = bookings.filter(b => b.status === 'concluido').length;
    const canceled = bookings.filter(b => b.status === 'cancelado').length;

    const estimatedRevenue = bookings
      .filter(b => b.status !== 'cancelado')
      .reduce((sum, b) => sum + (SERVICE_PRICES[b.service] || 35), 0);

    const completedRevenue = bookings
      .filter(b => b.status === 'concluido')
      .reduce((sum, b) => sum + (SERVICE_PRICES[b.service] || 35), 0);

    const myCount = bookings.filter(b => (b.barber === session?.name || b.barber === 'Qualquer um') && b.status !== 'cancelado').length;
    const qualquerUmCount = bookings.filter(b => b.barber === 'Qualquer um' && b.status !== 'cancelado').length;

    // Agrupamento por dia para gráfico
    const dailyMap: Record<string, { date: string; total: number; revenue: number }> = {};
    bookings.forEach(b => {
      if (!dailyMap[b.date]) {
        dailyMap[b.date] = { date: b.date.slice(5), total: 0, revenue: 0 };
      }
      if (b.status !== 'cancelado') {
        dailyMap[b.date].total += 1;
        dailyMap[b.date].revenue += (SERVICE_PRICES[b.service] || 35);
      }
    });

    const chartData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      total,
      confirmed,
      completed,
      canceled,
      estimatedRevenue,
      completedRevenue,
      myCount,
      qualquerUmCount,
      chartData
    };
  }, [bookings, session]);

  // Exportar Agenda em CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('Não há agendamentos para exportar no filtro atual.');
      return;
    }

    const headers = ['Data', 'Horario', 'Barbeiro', 'Servico', 'Cliente', 'Telefone', 'Status', 'Valor', 'Observacoes'];
    const rows = bookings.map(b => [
      b.date,
      b.time,
      b.barber,
      b.service,
      `"${b.name.replace(/"/g, '""')}"`,
      b.phone,
      b.status,
      SERVICE_PRICES[b.service] || 35,
      `"${(b.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos_barbearia_elite_${formatDateLocal(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // VIEW: TELA DE LOGIN SUPABASE (AUTORIZADOS)
  // ==========================================
  if (!session) {
    return (
      <PageTransition>
        <section className="min-h-screen flex flex-col items-center justify-center bg-matte relative overflow-hidden px-6">
          {/* Ambient Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-crimson/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
          
          <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center justify-center">
            
            <div className="w-full mb-12 text-center">
              <span className="block text-crimson font-sans uppercase tracking-[0.4em] text-[10px] font-bold mb-4">
                Acesso Restrito
              </span>
              <h1 className="font-sans font-bold text-4xl md:text-5xl text-offwhite uppercase tracking-tighter leading-[0.9]">
                Portal Admin
              </h1>
            </div>

            {authError && (
              <div className="w-full mb-8 p-4 bg-red-900/10 border-l-2 border-red-500/50 flex items-start gap-3 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </div>
            )}

            {authSuccessMsg && (
              <div className="w-full mb-8 p-4 bg-emerald-900/10 border-l-2 border-emerald-500/50 flex items-start gap-3 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-8">
              <div className="space-y-2 relative group">
                <label className="text-[10px] font-sans uppercase tracking-[0.2em] text-muted font-bold flex items-center gap-2 justify-center">
                  Token de Acesso
                </label>
                <div className="relative flex justify-center">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50 group-focus-within:text-crimson transition-colors" />
                  <input
                    type="password"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-matte-lighter px-12 py-3 text-center text-sm tracking-[0.5em] text-offwhite focus:outline-none focus:border-crimson transition-colors placeholder:text-muted/30 placeholder:tracking-normal"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading || !tokenInput}
                className="w-full mt-4 bg-offwhite hover:bg-white text-matte px-6 py-4 text-xs font-sans uppercase tracking-[0.2em] font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {authLoading ? (
                  <span className="animate-pulse">Validando...</span>
                ) : (
                  <>
                    <span className="relative z-10">Acessar Painel</span>
                    <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                    <div className="absolute inset-0 bg-crimson scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
                    <span className="absolute z-20 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center inset-0 gap-3">
                      Acessar Painel <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-16 flex items-center justify-center gap-4 text-[10px] text-muted uppercase tracking-[0.2em] font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
              <span>Acesso Criptografado</span>
            </div>

            {onNavigate && (
              <button 
                onClick={() => onNavigate('home')}
                className="mt-12 group flex items-center justify-center gap-3 text-[10px] font-sans uppercase tracking-[0.2em] text-muted hover:text-offwhite transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Voltar ao site
              </button>
            )}
          </div>
        </section>
      </PageTransition>
    );
  }

  // ==========================================
  // VIEW: PAINEL PRINCIPAL DO BARBEIRO
  // ==========================================
  return (
    <PageTransition>
      <div className="min-h-screen bg-matte text-offwhite flex flex-col md:flex-row font-sans">
        
        {/* DESKTOP SIDEBAR & MOBILE BOTTOM NAV */}
        <nav className="fixed bottom-0 md:sticky md:top-0 left-0 w-full md:w-[280px] md:h-screen bg-matte-light/95 md:bg-matte border-t md:border-t-0 md:border-r border-matte-lighter backdrop-blur-xl md:backdrop-blur-none z-40 flex flex-col justify-between">
          
          <div className="hidden md:block px-8 pt-12 pb-8">
            <span className="block text-crimson uppercase tracking-[0.4em] text-[10px] font-bold mb-2">
              Painel Admin
            </span>
            <h1 className="font-bold text-2xl text-offwhite uppercase tracking-tighter leading-[0.9]">
              Barbearia Elite
            </h1>
            <p className="text-[11px] text-muted uppercase tracking-widest mt-4">
              {session.name}
            </p>
          </div>

          <div className="flex-1 flex md:flex-col items-center md:items-stretch justify-around md:justify-start px-2 py-3 md:px-6 md:py-0 gap-2 w-full max-w-md mx-auto md:max-w-none">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 md:w-full flex md:justify-start items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-crimson text-white md:shadow-lg shadow-crimson/10'
                  : 'text-muted hover:text-offwhite hover:bg-matte-light'
              }`}
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold hidden sm:block md:block">Agenda</span>
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={`flex-1 md:w-full flex md:justify-start items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'availability'
                  ? 'bg-crimson text-white md:shadow-lg shadow-crimson/10'
                  : 'text-muted hover:text-offwhite hover:bg-matte-light'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold hidden sm:block md:block">Horários</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 md:w-full flex md:justify-start items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-crimson text-white md:shadow-lg shadow-crimson/10'
                  : 'text-muted hover:text-offwhite hover:bg-matte-light'
              }`}
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold hidden sm:block md:block">Métricas</span>
            </button>
          </div>

          <div className="hidden md:flex flex-col gap-4 p-8">
            <ThemeToggleButton />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all cursor-pointer w-full group"
            >
              <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Sair do Painel</span>
            </button>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8 md:py-12 md:px-12 pb-24 md:pb-12 min-h-screen">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="flex md:hidden justify-between items-center mb-8">
             <div>
                <span className="text-crimson uppercase tracking-[0.4em] text-[10px] font-bold">Painel Admin</span>
                <h1 className="font-bold text-xl text-offwhite uppercase tracking-tighter leading-none mt-1">Barbearia Elite</h1>
             </div>
             <div className="flex items-center gap-2">
               <ThemeToggleButton />
               <button onClick={handleLogout} className="p-2.5 bg-red-950/20 text-red-400 rounded-xl cursor-pointer">
                  <LogOut className="w-4 h-4" />
               </button>
             </div>
          </div>

          {/* =========================================
              TAB: BOOKINGS
          ========================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-8 md:space-y-12">
              
              {/* Header & Quick Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-offwhite">Agendamentos</h2>
                  <p className="text-xs text-muted uppercase tracking-widest mt-2">Visão Geral e Gestão</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={fetchBookings} disabled={isLoadingData} className="p-3 bg-matte-light hover:bg-matte-lighter rounded-xl text-muted hover:text-offwhite transition-colors cursor-pointer" title="Recarregar dados">
                    <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-crimson' : ''}`} />
                  </button>
                  <button onClick={handleExportCSV} className="p-3 bg-matte-light hover:bg-matte-lighter rounded-xl text-muted hover:text-offwhite transition-colors cursor-pointer" title="Exportar CSV">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => window.print()} className="p-3 bg-matte-light hover:bg-matte-lighter rounded-xl text-muted hover:text-offwhite transition-colors cursor-pointer hidden md:flex" title="Imprimir">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-matte-light/50 p-6 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold mb-4">Total Agendados</span>
                  <div className="text-4xl md:text-5xl font-bold text-offwhite tracking-tighter">{metrics.total}</div>
                </div>
                <div className="bg-matte-light/50 p-6 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold mb-4">Faturamento (R$)</span>
                  <div className="text-4xl md:text-5xl font-bold text-emerald-400 tracking-tighter">{metrics.estimatedRevenue}</div>
                </div>
                <div className="bg-matte-light/50 p-6 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold mb-4">Meus Agendamentos</span>
                  <div className="text-4xl md:text-5xl font-bold text-offwhite tracking-tighter">{metrics.myCount}</div>
                </div>
                <div className="bg-matte-light/50 p-6 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold mb-4">Qualquer um</span>
                  <div className="text-4xl md:text-5xl font-bold text-offwhite tracking-tighter">{metrics.qualquerUmCount}</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center bg-matte-light/30 p-2 md:p-4 rounded-2xl">
                
                {/* Search */}
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full bg-matte-light rounded-xl pl-12 pr-4 py-3.5 text-xs text-offwhite placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-crimson transition-all"
                  />
                </div>

                {/* Date Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                  {[
                    { id: 'today', label: 'Hoje' },
                    { id: 'tomorrow', label: 'Amanhã' },
                    { id: 'week', label: '7 Dias' },
                    { id: 'all', label: 'Todos' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDateFilter(tab.id as any)}
                      className={`px-4 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all cursor-pointer ${
                        dateFilter === tab.id
                          ? 'bg-crimson text-white'
                          : 'bg-matte-light text-muted hover:text-offwhite'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <div className="relative shrink-0">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        setDateFilter('custom');
                      }}
                      className={`w-10 h-10 md:w-auto md:h-auto opacity-0 md:opacity-100 absolute md:static inset-0 px-4 py-3 bg-matte-light rounded-xl text-[10px] uppercase tracking-widest font-bold text-offwhite focus:outline-none focus:ring-1 focus:ring-crimson transition-all cursor-pointer ${
                         dateFilter === 'custom' ? 'ring-1 ring-crimson text-crimson' : ''
                      }`}
                    />
                    <button className="md:hidden w-10 h-10 flex items-center justify-center bg-matte-light rounded-xl pointer-events-none">
                      <Calendar className={`w-4 h-4 ${dateFilter === 'custom' ? 'text-crimson' : 'text-muted'}`} />
                    </button>
                  </div>
                </div>

                {/* Dropdowns & View Switch */}
                <div className="flex gap-2">
                  <select
                    value={selectedBarber}
                    onChange={(e) => setSelectedBarber(e.target.value as any)}
                    className="flex-1 bg-matte-light rounded-xl px-4 py-3.5 text-[10px] uppercase tracking-widest font-bold text-muted focus:text-offwhite focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="all">Filtro de Barbeiro</option>
                    {session?.name === 'João Neto' && <option value="João Neto">João Neto</option>}
                    {session?.name === 'Cristian Mauro' && <option value="Cristian Mauro">Cristian Mauro</option>}
                    {session?.name !== 'João Neto' && session?.name !== 'Cristian Mauro' && (
                      <>
                        <option value="João Neto">João Neto</option>
                        <option value="Cristian Mauro">Cristian Mauro</option>
                      </>
                    )}
                    <option value="Qualquer um">Qualquer um</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="flex-1 bg-matte-light rounded-xl px-4 py-3.5 text-[10px] uppercase tracking-widest font-bold text-muted focus:text-offwhite focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="all">Status</option>
                    <option value="confirmado">Pendentes</option>
                    <option value="concluido">Concluídos</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                  
                  <div className="hidden sm:flex items-center gap-1 bg-matte-light p-1 rounded-xl">
                    <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-crimson text-white' : 'text-muted hover:text-offwhite'}`}><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-crimson text-white' : 'text-muted hover:text-offwhite'}`}><List className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Data Display */}
              {isLoadingData ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-crimson mb-4" />
                  <p className="text-[10px] uppercase tracking-widest text-muted">Sincronizando Banco de Dados...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center bg-matte-light/30 rounded-3xl">
                  <Calendar className="w-10 h-10 text-muted/30 mb-4" />
                  <p className="text-xs uppercase tracking-widest font-bold text-muted">Nenhum agendamento encontrado.</p>
                </div>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {bookings.map((booking) => {
                    const price = SERVICE_PRICES[booking.service] || 35;
                    const isToday = booking.date === getTodayStr();
                    return (
                      <div
                        key={booking.id}
                        className={`bg-matte-light/40 rounded-2xl p-6 transition-all relative flex flex-col justify-between ${
                          booking.status === 'concluido' ? 'opacity-60' : booking.status === 'cancelado' ? 'opacity-40' : isToday ? 'ring-1 ring-crimson/50 shadow-lg shadow-crimson/5 bg-matte-light/80' : ''
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-crimson" />
                                <span className="text-xl font-bold tracking-tighter text-offwhite">{booking.time}</span>
                              </div>
                              <span className="text-[10px] uppercase tracking-widest text-muted">{booking.date.split('-').reverse().join('/')}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                              booking.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400' : booking.status === 'cancelado' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="mb-6">
                            <span className="font-bold text-lg text-offwhite truncate block mb-1">{booking.name}</span>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-crimson/70" /> {booking.phone}</span>
                              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-crimson/70" /> {booking.barber}</span>
                              <span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-crimson/70" /> {booking.service}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-matte-lighter/50">
                           <span className="text-sm font-bold text-emerald-400">R$ {price},00</span>
                           {booking.status === 'confirmado' && (
                             <div className="flex items-center gap-2">
                               <button onClick={() => handleUpdateStatus(booking.id, 'concluido')} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors" title="Marcar como Concluído"><CheckCircle2 className="w-4 h-4" /></button>
                               <button onClick={() => handleUpdateStatus(booking.id, 'cancelado')} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors" title="Cancelar Agendamento"><XCircle className="w-4 h-4" /></button>
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-matte-light/40 rounded-3xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-matte-lighter/50 text-[10px] uppercase tracking-widest text-muted">
                        <th className="p-5 font-bold">Data/Hora</th>
                        <th className="p-5 font-bold">Cliente</th>
                        <th className="p-5 font-bold">Serviço/Barbeiro</th>
                        <th className="p-5 font-bold">Status</th>
                        <th className="p-5 font-bold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {bookings.map((booking) => (
                         <tr key={booking.id} className="border-b border-matte-lighter/10 hover:bg-matte-light/80 transition-colors">
                           <td className="p-5 whitespace-nowrap">
                             <div className="font-bold text-offwhite text-base">{booking.time}</div>
                             <div className="text-[10px] text-muted tracking-widest">{booking.date.split('-').reverse().join('/')}</div>
                           </td>
                           <td className="p-5">
                             <div className="font-bold text-offwhite">{booking.name}</div>
                             <div className="text-[10px] text-muted">{booking.phone}</div>
                           </td>
                           <td className="p-5">
                             <div className="text-offwhite">{booking.service}</div>
                             <div className="text-[10px] text-muted">{booking.barber}</div>
                           </td>
                           <td className="p-5">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${booking.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400' : booking.status === 'cancelado' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {booking.status}
                             </span>
                           </td>
                           <td className="p-5">
                              {booking.status === 'confirmado' && (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleUpdateStatus(booking.id, 'concluido')} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'cancelado')} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"><XCircle className="w-4 h-4" /></button>
                                </div>
                              )}
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* =========================================
              TAB: AVAILABILITY
          ========================================= */}
          {activeTab === 'availability' && (
            <div className="max-w-4xl space-y-12">
               <div>
                  <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-offwhite">Horários de Operação</h2>
                  <p className="text-xs text-muted uppercase tracking-widest mt-2">Configure o expediente da barbearia</p>
               </div>

              {scheduleSuccessMsg && (
                <div className="p-4 bg-emerald-900/10 border-l-2 border-emerald-500/50 flex items-start gap-3 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{scheduleSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveWeeklySchedule} className="bg-matte-light/40 rounded-3xl p-6 md:p-8">
                <div className="space-y-4 mb-8">
                  {([0, 1, 2, 3, 4, 5, 6] as (keyof WeeklySchedule)[]).map((dayKey) => {
                    const config = weeklySchedule[dayKey];
                    return (
                      <div key={String(dayKey)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-matte-lighter/30 rounded-2xl bg-matte/50">
                        <div className="flex items-center gap-4 min-w-[140px]">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={config.isOpen}
                              onChange={(e) => {
                                setWeeklySchedule(prev => ({
                                  ...prev,
                                  [dayKey]: { ...config, isOpen: e.target.checked }
                                }));
                              }}
                            />
                            <div className="w-9 h-5 bg-matte-lighter peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-crimson"></div>
                          </label>
                          <span className="text-sm font-bold uppercase tracking-widest text-offwhite">{DAY_NAMES[Number(dayKey)]}</span>
                        </div>

                        {config.isOpen ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                            <div className="flex items-center justify-between sm:justify-start gap-2 bg-matte-light sm:bg-transparent p-2 sm:p-0 rounded-xl">
                              <span className="text-[10px] uppercase tracking-widest text-muted pl-2 sm:pl-0">Abre</span>
                              <input
                                type="time"
                                value={config.open}
                                onChange={(e) => setWeeklySchedule(prev => ({ ...prev, [dayKey]: { ...config, open: e.target.value } }))}
                                className="bg-matte border border-matte-lighter rounded-lg px-3 py-2 text-xs font-bold text-offwhite focus:outline-none focus:border-crimson w-28 text-center"
                              />
                            </div>
                            <span className="text-muted text-xs hidden sm:block">-</span>
                            <div className="flex items-center justify-between sm:justify-start gap-2 bg-matte-light sm:bg-transparent p-2 sm:p-0 rounded-xl">
                              <span className="text-[10px] uppercase tracking-widest text-muted pl-2 sm:pl-0">Fecha</span>
                              <input
                                type="time"
                                value={config.close}
                                onChange={(e) => setWeeklySchedule(prev => ({ ...prev, [dayKey]: { ...config, close: e.target.value } }))}
                                className="bg-matte border border-matte-lighter rounded-lg px-3 py-2 text-xs font-bold text-offwhite focus:outline-none focus:border-crimson w-28 text-center"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest text-muted bg-matte-light px-3 py-2 rounded-xl w-full sm:w-auto text-center mt-3 sm:mt-0 font-bold">Fechado</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                   <button type="submit" disabled={isSavingSchedule} className="px-8 py-4 bg-offwhite hover:bg-white text-matte text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50">
                     {isSavingSchedule ? 'Salvando...' : 'Salvar Cronograma'}
                   </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================
              TAB: ANALYTICS
          ========================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-12">
               <div>
                  <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-offwhite">Métricas de Sucesso</h2>
                  <p className="text-xs text-muted uppercase tracking-widest mt-2">Volume e faturamento dos últimos 7 dias</p>
               </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Appointments Chart */}
                <div className="bg-matte-light/40 p-8 rounded-3xl">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-8 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-crimson" /> Evolução de Atendimentos
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics.chartData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#922B21" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#922B21" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#222222', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#F5F5F5' }} />
                        <Area type="monotone" dataKey="total" stroke="#922B21" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Agendamentos" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Evolution Chart */}
                <div className="bg-matte-light/40 p-8 rounded-3xl">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-8 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Faturamento Estimado (R$)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.chartData}>
                        <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#222222', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#10B981' }} />
                        <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} name="Faturamento (R$)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </PageTransition>
  );
}
