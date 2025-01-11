export default {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors:{
        colorFooter:"#2B2B2B",
        colorPreguntas:"#cccccc",
        colorLogo:"#ffb422",
        colorDetalle:"#2e5059",
        colorBeige:"#8F8074",
        colorBeigeClaro:"#95867b",
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'], 

      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

