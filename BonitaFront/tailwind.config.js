import aspectRatio from '@tailwindcss/aspect-ratio';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        colorLogo: "#ffb422",
        colorDetalle: "#2e5059",
        colorBeige: "#8F8074",
        colorBeigeClaro: "#95867b",
        colorFooter: '#111827',  // Agregado para tu componente
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'], 
      },
      animation: {
        'infinite-scroll': 'scroll 40s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      }
    },
  },
  plugins: [
    aspectRatio,
  ],
}