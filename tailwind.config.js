/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff5ee',
          100: '#ffe8d5',
          200: '#ffd0aa',
          300: '#ffb178',
          400: '#fd8847',
          500: '#fc944c',
          600: '#e8783a',
          700: '#c9602a',
          800: '#a34d22',
          900: '#7d3a18',
        },
        terra: {
          50:  '#faf5f3',
          100: '#f3e8e3',
          200: '#e8d4cc',
          300: '#d9b8ac',
          400: '#c99484',
          500: '#b46c54',
          600: '#9e5a44',
          700: '#844839',
          800: '#6b3a2e',
          900: '#562f26',
        },
        warm: {
          50:  '#fdfaf8',
          100: '#f8f1ec',
          200: '#f1e3d9',
          300: '#e7cfc0',
          400: '#d4ae9a',
          500: '#bf9077',
          600: '#a47560',
          700: '#855d4b',
          800: '#664838',
          900: '#3d2b21',
        },
        cream: {
          50:  '#fffdf9',
          100: '#fef8f0',
          200: '#fdeedd',
          300: '#fbdfc2',
          400: '#f8c99a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        accent:  ['"Dancing Script"', 'cursive'],
      },
      animation: {
        'fade-in':        'fadeIn 0.5s ease-in-out',
        'slide-up':       'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-soft':    'bounceSoft 0.6s ease-in-out',
        'shimmer':        'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        bounceSoft:   { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'soft':       '0 2px 20px rgba(0,0,0,0.05)',
        'card':       '0 4px 24px rgba(180,108,84,0.10)',
        'card-hover': '0 10px 40px rgba(180,108,84,0.20)',
        'brand':      '0 4px 20px rgba(252,148,76,0.35)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
