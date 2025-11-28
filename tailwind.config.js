/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'github-blue': '#0366d6',
        'github-blue-dark': '#0256c0',
        'black': '#000000',
      },
      animation: {
        'slide-over': 'slideOver 0.5s forwards ease-out',
        'slide-over-slow': 'slideOver 0.7s forwards ease-out',
        'slide-in': 'slideIn 0.3s ease-out', 
        'slide-in-0.4s': 'slideIn 0.4s ease-out',
        'slide-in-0.5s': 'slideIn 0.5s ease-out',
        'slide-in-0.6s': 'slideIn 0.6s ease-out',
        'slide-in-0.7s': 'slideIn 0.7s ease-out',
        'slide-in-1s': 'slideIn 1s ease-out',
      },
      keyframes: {
        slideOver: {
          '0%': { transform: 'translateX(-100%)', opacity: '1' },
          '30%': { transform: 'translateX(0%)', opacity: '1' },
          '40%': { transform: 'translateX(20%)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '1' },
        },
        slideIn: { // Add this
          '0%': { transform: 'translateX(-50%)', opacity: '0' },
          '50%': { transform: 'translateX(-10%)', opacity: '0.1' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

