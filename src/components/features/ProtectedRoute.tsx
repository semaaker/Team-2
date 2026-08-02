import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store';
import { LoadingState } from '@/components/ui';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  /** Belirtilirse yalnızca bu role sahip kullanıcılar erişebilir. */
  role?: UserRole;
}

/**
 * Korumalı rota sarmalayıcısı.
 *
 * Oturum geri yüklenirken (`isInitializing`) yönlendirme yapılmaz — aksi hâlde
 * sayfa yenilendiğinde kullanıcı bir anlığına giriş ekranına atılırdı.
 * Yetkisiz erişimde kullanıcı, geldiği adres saklanarak `/giris`e gönderilir.
 */
export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, user, homePathFor } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <LoadingState label="Oturum doğrulanıyor..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/giris" state={{ from: location.pathname }} replace />;
  }

  if (role && user?.role !== role) {
    // Doğru panele yönlendir — yanlış rolle gelen kullanıcıyı 403'te bırakma.
    return <Navigate to={homePathFor(user?.role)} replace />;
  }

  return <Outlet />;
}
