import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        'royal-purple': '#6D28D9',
        'deep-violet': '#5B21B6',
        'soft-violet': '#8B5CF6',
        'lavender': '#F0EEFF',
        'mist-grey': '#F4F3F7',
        'cool-grey': '#F8F8FA',
        'charcoal': '#18181B',
        'zinc-grey': '#71717A',
        'df-border': '#E4E4E7',
        'status-present': '#22C55E',
        'status-pending': '#F59E0B',
        'status-error': '#EF4444',
        'status-leave': '#3B82F6',
        'status-halfday': '#A855F7',
        'status-inactive': '#A1A1AA',
      },
    },
  },
  plugins: [],
}

export default config
