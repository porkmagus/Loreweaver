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
        void: 'rgb(var(--color-void) / <alpha-value>)',
        depth: 'rgb(var(--color-depth) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ridge: 'rgb(var(--color-ridge) / <alpha-value>)',
        shingle: 'rgb(var(--color-shingle) / <alpha-value>)',
        parchment: 'rgb(var(--color-parchment) / <alpha-value>)',
        ash: 'rgb(var(--color-ash) / <alpha-value>)',
        dust: 'rgb(var(--color-dust) / <alpha-value>)',
        ghost: 'rgb(var(--color-ghost) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        'gold-dim': 'rgb(var(--color-gold-dim) / <alpha-value>)',
        sage: 'rgb(var(--color-sage) / <alpha-value>)',
        ember: 'rgb(var(--color-ember) / <alpha-value>)',
        silver: 'rgb(var(--color-silver) / <alpha-value>)',
        mist: 'rgb(var(--color-mist) / <alpha-value>)',
        trust: 'rgb(var(--color-trust) / <alpha-value>)',
        fear: 'rgb(var(--color-fear) / <alpha-value>)',
        memory: 'rgb(var(--color-memory) / <alpha-value>)',
        'parchment-bg': 'rgb(var(--color-parchment-bg) / <alpha-value>)',
        'parchment-surface': 'rgb(var(--color-parchment-surface) / <alpha-value>)',
        'parchment-ridge': 'rgb(var(--color-parchment-ridge) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        soot: 'rgb(var(--color-soot) / <alpha-value>)',
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.15', letterSpacing: '0' }],
        'h1': ['1.875rem', { lineHeight: '1.2', letterSpacing: '0' }],
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
        'surface-grad': 'linear-gradient(180deg, rgb(var(--color-surface)) 0%, rgb(var(--color-surface-muted)) 100%)',
        'depth-grad': 'linear-gradient(180deg, rgb(var(--color-depth)) 0%, rgb(var(--color-depth-muted)) 100%)',
      },
    },
  },
  plugins: [],
};
