import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService, getToken, onUnauthorized, setToken } from '@/services';
import type { User, UserRole } from '@/types';

/**
 * Oturum durumu.
 *
 * Uygulama açılışında localStorage'daki token ile `/auth/me` çağrılır; bu
 * tamamlanana kadar `isInitializing` true kalır ve korumalı rotalar bekletilir
 * (aksi hâlde sayfa yenilendiğinde kullanıcı giriş ekranına atılırdı).
 */
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  /** Doğrulama kodu akışında adım 1'de girilen e-posta. */
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  /** Ayarlar ekranı profili güncellediğinde nav'daki bilgileri tazeler. */
  patchUser: (patch: Partial<User>) => void;
  /** Rolüne göre kullanıcının ana panel yolu. */
  homePathFor: (role?: UserRole) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PENDING_EMAIL_KEY = 'sponsormatch.pendingEmail';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [pendingEmail, setPendingEmailState] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem(PENDING_EMAIL_KEY);
    } catch {
      return null;
    }
  });

  // Açılışta mevcut token ile oturumu geri yükle.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        setIsInitializing(false);
        return;
      }

      try {
        const me = await authService.me();
        if (!cancelled) setUser(me);
      } catch {
        // Token süresi dolmuş ya da geçersiz — sessizce temizle.
        setToken(null);
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // API katmanı 401 gördüğünde oturumu düşür.
  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const setPendingEmail = useCallback((email: string | null) => {
    setPendingEmailState(email);
    try {
      if (email) window.sessionStorage.setItem(PENDING_EMAIL_KEY, email);
      else window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
    } catch {
      /* sessionStorage kapalıysa yalnızca bellekte tut */
    }
  }, []);

  const signIn = useCallback(
    (nextUser: User) => {
      setUser(nextUser);
      setPendingEmail(null);
    },
    [setPendingEmail],
  );

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setPendingEmail(null);
  }, [setPendingEmail]);

  const patchUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const homePathFor = useCallback(
    (role?: UserRole) => ((role ?? user?.role) === 'sponsor' ? '/sponsor' : '/organizator'),
    [user?.role],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      pendingEmail,
      setPendingEmail,
      signIn,
      signOut,
      patchUser,
      homePathFor,
    }),
    [user, isInitializing, pendingEmail, setPendingEmail, signIn, signOut, patchUser, homePathFor],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth, AuthProvider içinde kullanılmalıdır.');
  return context;
}
