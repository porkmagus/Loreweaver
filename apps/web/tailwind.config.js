/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: '#0A0B0F',
        depth: '#111318',
        surface: '#181A21',
        ridge: '#22242D',
        shingle: '#2D303A',
        parchment: '#E8E4DC',
        ash: '#A8A29E',
        dust: '#6B6560',
        ghost: '#4A4540',
        gold: '#C9A96E',
        'gold-dim': '#A0834A',
        sage: '#5A7A6A',
        ember: '#8B5A3C',
        silver: '#8A8F98',
        mist: '#5E6B7A',
        trust: '#6B8E6B',
        fear: '#8B4557',
        memory: '#7B6B9A',
        'parchment-bg': '#F5F1EA',
        'parchment-surface': '#EDE8DF',
        'parchment-ridge': '#D4CFC6',
        ink: '#2A2520',
        soot: '#5A554E',
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h1': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['1.5rem', { lineHeight: '1.25' }],
        'h3': ['1.25rem', { lineHeight: '1.3' }],
        'body': ['0.9375rem', { lineHeight: '1.65' }],
        'small': ['0.8125rem', { lineHeight: '1.5' }],
        'tiny': ['0.75rem', { lineHeight: '1.4' }],
        'mono-sm': ['0.8125rem', { lineHeight: '1.5' }],
      },
      spacing: {
        'section': '32px',
        'card': '20px',
        'inner': '20px',
        'compact': '12px',
        'micro': '8px',
      },
      borderRadius: {
        'card': '6px',
      },
      transitionTimingFunction: {
        'archive': 'ease-out',
      },
      transitionDuration: {
        'archive': '200ms',
      },
      boxShadow: {
        'gold-glow': '0 0 0 2px rgba(201, 169, 110, 0.15)',
        'depth': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'surface-grad': 'linear-gradient(180deg, #181A21 0%, #15171E 100%)',
        'depth-grad': 'linear-gradient(180deg, #111318 0%, #0E1015 100%)',
      },
    },
  },
  plugins: [],
};
