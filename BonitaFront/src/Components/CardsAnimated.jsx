import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import manitoDiamante from '../assets/img/manitoDiamante.png';
import pesos from '../assets/img/pesos.png';
import card1 from '../assets/img/an1.png';
import card2 from '../assets/img/an2.png';
import card3 from '../assets/img/an3.png';
import card4 from '../assets/img/an4.png';

const CardsAnimated = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

 
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true); // El componente está en vista, activamos la animación
        } else {
          setIsInView(false); // El componente está fuera de vista
        }
      },
      { threshold: 0.8 } // Se activará cuando el 80% del componente esté visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Limpiar el observador cuando se desmonte el componente
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  // Variants con ajustes para dispositivos grandes y pequeños
  const variants = {
    initial1: { scale: 1.6, opacity: 1, x: 60, y: -120 },
    initial2: { scale: 1.6, opacity: 1, x: 20, y: 210 },
    initial3: { scale: 1.4, opacity: 1, x: 320, y: -190 },
    initial4: { scale: 1.9, opacity: 0.8, x: 330, y: 125 },

    // Ajustes para animaciones más lentas y adaptables a pantallas pequeñas
    animate1: {
      scale: 1.6,
      opacity: 1,
      x: 0,
      y: -30,
      transition: { duration: 3, yoyo: Infinity },
    },
    animate2: {
      scale: 1.3,
      opacity: 1,
      x: 0,
      y: 50,
      transition: { duration: 3, yoyo: Infinity },
    },
    animate3: {
      scale: 1.4,
      opacity: 1,
      x: 120,
      y: -50,
      transition: { duration: 3, yoyo: Infinity },
    },
    animate4: {
      scale: 1.3,
      opacity: 1,
      x: 120,
      y: 50,
      transition: { duration: 3, yoyo: Infinity },
    },
  };

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 p-6 md:p-60">
      {/* Columna izquierda: Texto */}
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-nunito font-semibold mb-4 text-center">
          Por qué comprar nuestros<br /> accesorios
        </h2>

        {/* logo manitoDiamante */}
        <img
          src={manitoDiamante}
          alt="Manito Diamante"
          className="mx-auto w-20 h-20 md:w-28 md:h-28 -mt-4"
        />

        <div className="flex items-center justify-center mb-6">
          <p className="text-xl md:text-2xl font-nunito font-semibold text-center">
            Productos de calidad<br />
            Sabemos que necesitas accesorios<br />
            de alta calidad y nosotros te<br />
            ofrecemos un producto que<br />
            puedes gozar de una garantía<br />
            dándote tranquilidad.<br />
            {/* logo pesos */}
            <img
              src={pesos}
              alt="Pesos"
              className="mx-auto w-14 h-14 md:w-20 md:h-20"
            />
            Precios a tu medida<br />
            En Aznara Store encontrarás el<br />
            precio indicado
          </p>
        </div>
      </div>

      {/* Columna derecha: Tarjetas con animación */}
      <div className="relative flex justify-center items-center">
        {/* Tarjeta 1 */}
        <motion.div
          className="absolute w-36 h-48 md:w-48 md:h-72 rounded-lg"
          variants={variants}
          initial="animate1"
          animate={isInView ? "initial1" : "animate1"} // Cambiar la animación cuando está en vista
        >
          <img src={card1} alt="Accesorio 1" className="w-full h-full rounded-lg object-contain" />
        </motion.div>

        {/* Tarjeta 2 */}
        <motion.div
          className="absolute w-40 h-32 md:w-60 md:h-40 rounded-lg"
          variants={variants}
          initial="animate2"
          animate={isInView ? "initial2" : "animate2"}
        >
          <img src={card2} alt="Accesorio 2" className="w-full h-full rounded-lg object-contain" />
        </motion.div>

        {/* Tarjeta 3 */}
        <motion.div
          className="absolute w-28 h-40 md:w-40 md:h-56 rounded-lg"
          variants={variants}
          initial="animate3"
          animate={isInView ? "initial3" : "animate3"}
        >
          <img src={card3} alt="Accesorio 3" className="w-full h-full rounded-lg object-contain" />
        </motion.div>

        {/* Tarjeta 4 */}
        <motion.div
          className="absolute w-28 h-28 md:w-40 md:h-40 rounded-lg"
          variants={variants}
          initial="animate4"
          animate={isInView ? "initial4" : "animate4"}
        >
          <img src={card4} alt="Accesorio 4" className="w-full h-full rounded-lg object-contain" />
        </motion.div>
      </div>
    </div>
  );
};

export default CardsAnimated;





