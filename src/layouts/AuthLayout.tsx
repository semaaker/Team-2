import { Outlet } from 'react-router-dom';
import { COPYRIGHT } from '@/utils/constants';

/**
 * Kimlik doğrulama ekranlarının kabuğu.
 * Tasarımda bu akış "işlemsel" kabul edildiği için üst navigasyon ve
 * alt bilgi bilinçli olarak sadeleştirilmiştir.
 */
export function AuthLayout() {
  return (
    <div className="bg-pattern relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-surface-bright px-margin-mobile py-12 md:px-margin-desktop">
      {/* Dekoratif arka plan lekeleri */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute right-[-5%] top-[-10%] h-[40vw] w-[40vw] rounded-full bg-primary-container/5 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-surface-tint/5 blur-3xl" />
      </div>

      <main className="z-10 w-full max-w-md">
        <Outlet />
      </main>

      <p className="z-10 mt-8 text-center font-label-sm text-label-sm text-outline">{COPYRIGHT}</p>
    </div>
  );
}
