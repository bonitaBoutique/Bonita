import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        colorLogo: "#ffb422",
        colorDetalle: "#2e5059",
        colorBeige: "#8F8074",
        colorBeigeClaro: "#95867b",
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
  variants: {
    extend: {},
    aspectRatio,
  plugins: [
    aspectRatio,
  ],
}
}