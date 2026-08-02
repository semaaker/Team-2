import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@/components/features';
import {
  AuthLayout,
  OrganizerLayout,
  PublicLayout,
  SettingsLayout,
  SponsorLayout,
} from '@/layouts';
import {
  BillingPage,
  DealRoomPage,
  DiscoverPage,
  EventDetailPage,
  ForgotPasswordPage,
  LandingPage,
  LegalPage,
  LoginEmailPage,
  LoginVerifyPage,
  MatchesPage,
  MessagesPage,
  MyEventsPage,
  MySponsorshipsPage,
  NotFoundPage,
  NotificationSettingsPage,
  OrganizerDashboardPage,
  ProfileSettingsPage,
  PublicEventDetailPage,
  RegisterPage,
  SecuritySettingsPage,
  SponsorDashboardPage,
  SponsorProfilePage,
  SupportPage,
} from '@/pages';

/** Rota değişiminde sayfayı başa sarar. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}

/**
 * Uygulama rota ağacı.
 *
 * - `PublicLayout`  : herkese açık sayfalar (üst nav + footer)
 * - `AuthLayout`    : giriş / kayıt akışı (sadeleştirilmiş kabuk)
 * - `OrganizerLayout` / `SponsorLayout` : role göre korumalı paneller
 */
export function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ------------------------------ Herkese açık ------------------------------ */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="kesfet" element={<DiscoverPage />} />
          <Route path="etkinlik/:id" element={<PublicEventDetailPage />} />
          <Route path="gizlilik" element={<LegalPage />} />
          <Route path="kosullar" element={<LegalPage />} />
          <Route path="kvkk" element={<LegalPage />} />
          <Route path="destek" element={<SupportPage />} />
        </Route>

        {/* --------------------------- Kimlik doğrulama --------------------------- */}
        <Route element={<AuthLayout />}>
          <Route path="giris" element={<LoginEmailPage />} />
          <Route path="giris/dogrulama" element={<LoginVerifyPage />} />
          <Route path="kayit" element={<RegisterPage />} />
          <Route path="sifremi-unuttum" element={<ForgotPasswordPage />} />
        </Route>

        {/* ------------------------------ Organizatör ------------------------------ */}
        <Route element={<ProtectedRoute />}>
          <Route path="organizator" element={<OrganizerLayout />}>
            <Route index element={<OrganizerDashboardPage />} />
            <Route path="etkinlikler" element={<MyEventsPage />} />
            <Route path="etkinlikler/:id" element={<EventDetailPage />} />
            <Route path="mesajlar" element={<MessagesPage />} />
            <Route path="faturalandirma" element={<BillingPage />} />

            <Route path="ayarlar" element={<SettingsLayout />}>
              <Route index element={<ProfileSettingsPage />} />
              <Route path="bildirimler" element={<NotificationSettingsPage />} />
              <Route path="guvenlik" element={<SecuritySettingsPage />} />
            </Route>
          </Route>

          {/* -------------------------------- Sponsor -------------------------------- */}
          <Route path="sponsor" element={<SponsorLayout />}>
            <Route index element={<SponsorDashboardPage />} />
            <Route path="eslesmeler" element={<MatchesPage />} />
            <Route path="sponsorluklar" element={<MySponsorshipsPage />} />
            <Route path="deal-room/:id" element={<DealRoomPage />} />
            <Route path="profil/:id" element={<SponsorProfilePage />} />
            <Route path="mesajlar" element={<MessagesPage />} />
          </Route>
        </Route>

        {/* Eski/kısayol adresler */}
        <Route path="login" element={<Navigate to="/giris" replace />} />
        <Route path="register" element={<Navigate to="/kayit" replace />} />

        {/* --------------------------------- 404 --------------------------------- */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
