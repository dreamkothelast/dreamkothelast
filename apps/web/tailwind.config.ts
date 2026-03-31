import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#a8302f',
        'on-primary': '#ffffff',
        'primary-container': '#ffdad7',
        'on-primary-container': '#410002',
        secondary: '#1b6d24',
        'on-secondary': '#ffffff',
        'secondary-container': '#a4f5a6',
        'on-secondary-container': '#002106',
        tertiary: '#605b51',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#e6dfd4',
        'on-tertiary-container': '#1d1a13',
        background: '#fcf9f8',
        'on-background': '#1c1b1b',
        surface: '#fcf9f8',
        'on-surface': '#1c1b1b',
        'surface-variant': '#f4e0dc',
        'on-surface-variant': '#534340',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#fff0ee',
        'surface-container': '#fce8e5',
        'surface-container-high': '#f7e2e0',
        'surface-container-highest': '#f1dcda',
        outline: '#857371',
        'outline-variant': '#d8c2bf',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Public Sans', 'system-ui', 'sans-serif'],
        numeric: ['Albert Sans', 'Public Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        sm: '0.125rem',
        md: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '9999px',
      },
      boxShadow: {
        hard: '2px 2px 0px 0px rgba(28,27,27,1)',
        'hard-sm': '1px 1px 0px 0px rgba(28,27,27,1)',
      },
    },
  },
} satisfies Config
