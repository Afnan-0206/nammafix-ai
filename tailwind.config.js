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
        card: '0 2px 4px rgba(0,0,0,0.06), 0 0 0 1px #CBD5E1',
        gov: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        govHover: '0 12px 20px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        teal: '0 4px 12px rgba(10, 37, 64, 0.2)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite alternate',
        criticalPulse: 'criticalPulse 2s infinite',
        pageIn: 'pageIn 250ms ease both',
        barIn: 'barIn 800ms ease-out both',
      },
      keyframes: {
        float: { from: { transform: 'translateY(-6px)' }, to: { transform: 'translateY(0)' } },
        criticalPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.4)' },
          '70%': { boxShadow: '0 0 0 6px rgba(220, 38, 38, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0)' },
        },
        pageIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        barIn: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
    },
  },
  plugins: [],
}
