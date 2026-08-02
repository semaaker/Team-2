/**
 * SponsorMatch AI — Tasarım Sistemi ("Executive Bridge")
 *
 * Bu dosya, Stitch tasarım çıktısındaki `tailwind.config` bloğunun birebir
 * karşılığıdır. Renk isimleri, tipografi ölçeği, köşe yarıçapları ve spacing
 * anahtarları tasarımdan sapmadan aktarılmıştır; böylece tasarımdaki sınıf
 * adları (`text-display-lg`, `px-margin-desktop`, `gap-gutter` vb.) doğrudan
 * çalışır ve piksel sadakati korunur.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Yüzeyler ---
        surface: '#f9f9f9',
        'surface-dim': '#dadada',
        'surface-bright': '#f9f9f9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f3f4',
        'surface-container': '#eeeeee',
        'surface-container-high': '#e8e8e8',
        'surface-container-highest': '#e2e2e2',
        'surface-variant': '#e2e2e2',
        'surface-tint': '#476083',
        background: '#f9f9f9',

        // --- Metin ---
        'on-surface': '#1a1c1c',
        'on-surface-variant': '#43474e',
        'on-background': '#1a1c1c',
        'inverse-surface': '#2f3131',
        'inverse-on-surface': '#f0f1f1',

        // --- Çizgiler ---
        outline: '#74777f',
        'outline-variant': '#c4c6cf',

        // --- Birincil (Deep Navy) ---
        primary: '#000613',
        'on-primary': '#ffffff',
        'primary-container': '#001f3f',
        'on-primary-container': '#6f88ad',
        'inverse-primary': '#afc8f0',
        'primary-fixed': '#d4e3ff',
        'primary-fixed-dim': '#afc8f0',
        'on-primary-fixed': '#001c3a',
        'on-primary-fixed-variant': '#2f486a',

        // --- İkincil (Slate) ---
        secondary: '#5a5f62',
        'on-secondary': '#ffffff',
        'secondary-container': '#dce0e4',
        'on-secondary-container': '#5e6367',
        'secondary-fixed': '#dfe3e7',
        'secondary-fixed-dim': '#c3c7cb',
        'on-secondary-fixed': '#171c1f',
        'on-secondary-fixed-variant': '#43474b',

        // --- Üçüncül ---
        tertiary: '#000511',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#0e1f33',
        'on-tertiary-container': '#77879f',
        'tertiary-fixed': '#d3e4fe',
        'tertiary-fixed-dim': '#b7c8e1',
        'on-tertiary-fixed': '#0b1c30',
        'on-tertiary-fixed-variant': '#38485d',

        // --- Durum ---
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        success: '#059669',
        'success-bg': '#d1fae5',
        'green-status': '#059669',
        'green-status-bg': '#d1fae5',
        'ice-blue': '#f0f4f8',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      spacing: {
        base: '8px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        'container-max': '1280px',
        gutter: '24px',
      },
      maxWidth: {
        'container-max': '1280px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'display-lg': ['Inter', 'sans-serif'],
        'display-lg-mobile': ['Inter', 'sans-serif'],
        'headline-md': ['Inter', 'sans-serif'],
        'headline-sm': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'label-md': ['Inter', 'sans-serif'],
        'label-sm': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1.2', fontWeight: '600' }],
      },
      boxShadow: {
        soft: '0px 4px 20px rgba(0, 31, 63, 0.05)',
        glass: '0 10px 40px -10px rgba(0, 31, 63, 0.1)',
        'lift-hover': '0 4px 12px rgba(0, 31, 63, 0.2)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'toast-in': 'toast-in 0.25s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
