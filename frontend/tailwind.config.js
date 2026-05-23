/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#2563eb',
        success: '#059669',
        danger: '#dc2626',
        brand: {
          navy: '#0b1220',
          ink: '#111827',
          slate: '#1e293b',
          mist: '#f1f5f9',
          snow: '#f8fafc',
          accent: '#10b981',
          'accent-dark': '#059669',
          gold: '#d4a853',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 8px -2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 40px -8px rgba(15, 23, 42, 0.12), 0 4px 16px -4px rgba(15, 23, 42, 0.06)',
        glow: '0 0 48px -8px rgba(16, 185, 129, 0.35)',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37, 99, 235, 0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 50%), linear-gradient(180deg, #0b1220 0%, #111827 45%, #0f172a 100%)',
      },
    },
  },
  plugins: [],
};
