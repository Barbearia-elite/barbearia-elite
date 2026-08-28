import { supabase } from './supabase';

export interface AdminUserSession {
  email: string;
  name: string;
  role: 'admin' | 'barber';
  token?: string;
  sessionExpiresAt: number;
  loginTime: string;
}

const SESSION_STORAGE_KEY = 'barbearia_elite_admin_session';

export function saveAdminSession(session: AdminUserSession) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Erro ao salvar sessão admin:', e);
  }
}

export function getStoredAdminSession(): AdminUserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AdminUserSession = JSON.parse(raw);
    
    // Check local expiration
    if (Date.now() > session.sessionExpiresAt) {
      clearAdminSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function checkServerSession(): Promise<AdminUserSession | null> {
  try {
    const saved = getStoredAdminSession();
    const headers: Record<string, string> = {};
    if (saved?.token) {
      headers['Authorization'] = `Bearer ${saved.token}`;
    }

    const res = await fetch('/api/auth/session', { headers });
    if (!res.ok) {
      clearAdminSession();
      return null;
    }
    const data = await res.json();
    if (data.authenticated && data.user) {
      return {
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'barber',
        token: saved?.token,
        sessionExpiresAt: data.user.expiresAt,
        loginTime: saved?.loginTime || new Date().toLocaleTimeString('pt-BR')
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    await supabase.auth.signOut().catch(() => {});
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  } catch (e) {
    console.error('Erro ao limpar sessão:', e);
  }
}

// 1. Login com Token
export async function loginWithToken(
  token: string
): Promise<{ session?: AdminUserSession; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim() })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Token inválido ou acesso não autorizado.' };
    }

    const session: AdminUserSession = {
      email: data.user.email,
      name: data.user.name,
      role: data.user.role || 'barber',
      token: data.token,
      sessionExpiresAt: data.user.expiresAt,
      loginTime: new Date().toLocaleTimeString('pt-BR')
    };

    saveAdminSession(session);
    return { session };
  } catch (err: any) {
    console.error('Erro no login Supabase:', err);
    return { error: 'Falha na comunicação com o servidor.' };
  }
}
