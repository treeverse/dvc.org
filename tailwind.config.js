import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  content: ['./src/**/*.{ts,js,tsx,jsx}', './content/**/*.json'],
  theme: {
    extend: {
      screens: {
        xxsMax: { max: '376px' },
        xsMax: { max: '572px' },
        smMax: { max: '768px' },
        mdMax: { max: '1004px' },
        xs: '572px',
        lg: '1005px',
        xl: '1200px'
      },
      colors: {
        gray: { hover: '#40364d', dark: 'rgb(26, 30, 35)' },
        purple: { DEFAULT: '#945dd6' },
        blue: { DEFAULT: '#13ADC7', hover: '#13a3bd' },
        orange: { DEFAULT: '#F46737' },
        indigo: { DEFAULT: '#4B2E70' },
        dark: { DEFAULT: '#1A1E23' },
        light: { DEFAULT: '#EEF4F8' }
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50.2%, 0, 0)' }
        }
      },
      animation: {
        slide: 'slide 80s linear infinite',
        'slide-fast': 'slide 40s linear infinite'
      },
      backgroundImage: {
        'gradient-126': 'linear-gradient(126deg, var(--tw-gradient-stops))'
      }
    },
    fontFamily: {
      sans: ['BrandonGrotesque', 'Tahoma', 'Arial', 'sans-serif'],
      mono: ['Consolas', '"Liberation Mono"', 'Menlo', 'Courier', 'monospace']
    }
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        '.hover': {
          '&:hover': {
            opacity: 0.7
          }
        },
        '.focus': {
          '&:focus': {
            color: 'var(--color-orange)'
          }
        },
        '.active': {
          '&:active': {
            position: 'relative',
            top: '1px',
            left: '1px'
          }
        }
      })
    },
    tailwindcssAnimate
  ]
}
