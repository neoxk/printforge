import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/*/src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}' 
  ],
  theme: {
    extend: {
      colors: {
        'surface':                    '#fcf8f9',
        'surface-dim':                '#dcd9da',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#f6f3f4',
        'surface-container':          '#f0edee',
        'surface-container-high':     '#eae7e8',
        'surface-container-highest':  '#e5e2e3',
        'on-surface':                 '#1c1b1c',
        'on-surface-variant':         '#45464c',
        'outline':                    '#76777c',
        'outline-variant':            '#c6c6cc',
        'primary':                    '#030612',
        'on-primary':                 '#ffffff',
        'primary-container':          '#1a1f2c',
        'on-primary-container':       '#828697',
        'secondary':                  '#0050cc',
        'on-secondary':               '#ffffff',
        'secondary-container':        '#0266ff',
        'on-secondary-container':     '#f9f7ff',
        'background':                 '#fcf8f9',
        'error':                      '#ba1a1a',
        'error-container':            '#ffdad6',
        'on-error-container':         '#93000a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        'xs':                   '4px',
        'sm':                   '8px',
        'md':                   '16px',
        'lg':                   '24px',
        'xl':                   '32px',
        'gutter':               '16px',
        'margin-admin':         '24px',
        'margin-configurator':  '64px',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'sm':      '0.25rem',
        'md':      '0.75rem',
        'lg':      '1rem',
        'xl':      '1.5rem',
      },
    },
  },
}

export default config