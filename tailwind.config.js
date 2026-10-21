/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f2e2c',
        paper: '#f4f2ec',
        panel: '#ffffff',
        line: '#e4dfd0',
        teal: { DEFAULT: '#13615a', dark: '#0b423d', light: '#e6f2f0' },
        amber: '#b8791a',
        red: '#a32f2f',
        muted: '#736c5c'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serifh: ['Georgia', 'Iowan Old Style', 'serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 46, 44, 0.04), 0 1px 8px rgba(15, 46, 44, 0.05)',
        pop: '0 4px 16px rgba(15, 46, 44, 0.10)'
      },
      borderRadius: {
        xl2: '14px'
      }
    }
  },
  plugins: []
};
