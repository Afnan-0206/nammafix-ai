/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F14', panel: '#111820', raised: '#1A2433', line: '#1E2D42', civic: '#00C9A7', mint: '#00C9A7', amber: '#F5A623', danger: '#E5534B',
      },
      fontFamily: { display: ['Space Grotesk', 'sans-serif'], body: ['Inter', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      boxShadow: { card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px #1E2D42', teal: '0 0 24px rgba(0,201,167,0.35)' },
      animation: { float: 'float 3s ease-in-out infinite alternate', criticalPulse: 'criticalPulse 2s infinite', pageIn: 'pageIn 250ms ease both', barIn: 'barIn 800ms ease-out both' },
      keyframes: {
        float: { from: { transform: 'translateY(-8px)' }, to: { transform: 'translateY(0)' } },
        criticalPulse: { '0%': { boxShadow: '0 0 0 0 rgba(229,83,75,.4)' }, '70%': { boxShadow: '0 0 0 6px rgba(229,83,75,0)' }, '100%': { boxShadow: '0 0 0 0 rgba(229,83,75,0)' } },
        pageIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        barIn: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
    },
  },
  plugins: [],
}
