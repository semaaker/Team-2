import { Outlet } from 'react-router-dom';
import { Footer, TopNavBar } from '@/components/features';

/** Herkese açık sayfalar: üst navigasyon + içerik + alt bilgi. */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased">
      <TopNavBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
