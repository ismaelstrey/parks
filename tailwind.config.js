/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Share Tech Mono', 'monospace'],
        display: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        cyan: {
          DEFAULT: '#00e5ff',
          dim: '#00b8cc',
        },
        green: {
          neon: '#00ff88',
          dim: '#00cc6a',
        },
        orange: {
          neon: '#ff6b00',
        },
        red: {
          neon: '#ff3355',
        },
        bg: {
          deep: '#020d1a',
          panel: '#04192e',
          card: '#061e35',
          input: '#071f30',
        },
        border: {
          DEFAULT: 'rgba(0,229,255,0.18)',
          hover: 'rgba(0,229,255,0.5)',
        }
      },
      animation: {
        'scan': 'scan 3s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.3s ease',
        'slideUp': 'slideUp 0.4s ease',
      },
      keyframes: {
        scan: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 6px #00ff88' },
          '50%': { opacity: '0.4', boxShadow: 'none' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
