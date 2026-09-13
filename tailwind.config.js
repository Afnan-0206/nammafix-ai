/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#F8FAFC',
        'ink-dark': '#0F172A',
        panel: '#FFFFFF',
        raised: '#F1F5F9',
        line: '#CBD5E1',
        civic: '#0A2540',
        govblue: '#1D4ED8',
        saffron: '#D97706',
        mint: '#047857',
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        gov: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        govHover: '0 12px 20px -3px rgba(0, 0, 0, 0.09), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite alternate',
        pageIn: 'pageIn 200ms ease both',
        barIn: 'barIn 800ms ease-out both',
        radarPulse: 'radarPulse 2.5s ease-out infinite',
      },
      keyframes: {
        float: { from: { transform: 'translateY(-4px)' }, to: { transform: 'translateY(0)' } },
        pageIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        barIn: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        radarPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
