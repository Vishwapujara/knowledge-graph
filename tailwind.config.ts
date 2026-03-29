import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ptp: {
          cream:    '#FAF7F4',
          orange:   '#E07B39',
          'orange-light': '#F5A470',
          'orange-dark':  '#C4612A',
          green:    '#4A7C59',
          'green-light':  '#6AAB7A',
          'green-dark':   '#2F5C3A',
          brown:    '#5C3D2E',
          sand:     '#F0E9DF',
          muted:    '#8C7B6E',
          border:   '#E8DDD4',
          text:     '#2D2D2D',
          'text-light': '#6B6B6B',
        }
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      animation: {
        'path-draw':    'pathDraw 2s ease-in-out forwards',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'slide-in':     'slideIn 0.4s ease-out forwards',
        'fade-up':      'fadeUp 0.5s ease-out forwards',
        'dash-move':    'dashMove 1.5s linear infinite',
        'float':        'float 3s ease-in-out infinite',
      },
      keyframes: {
        pathDraw: {
          '0%':   { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(224,123,57,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(224,123,57,0)' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        dashMove: {
          '0%':   { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-20' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'ptp-card': '0 2px 16px rgba(92,61,46,0.08)',
        'ptp-elevated': '0 8px 32px rgba(92,61,46,0.12)',
        'ptp-glow': '0 0 24px rgba(224,123,57,0.3)',
      },
      borderRadius: {
        'ptp': '16px',
      }
    },
  },
  plugins: [],
}
export default config
