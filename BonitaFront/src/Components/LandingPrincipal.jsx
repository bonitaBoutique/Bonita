import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import banner3 from "./../assets/img/BannerPrincipal/banner10.png";
import banner4 from "./../assets/img/BannerPrincipal/banner5.png";
import efecti from "../assets/img/pagos/efecty.png";
import logoAmeric from "../assets/img/pagos/logoAmeric.png";
import logoVisa from "../assets/img/pagos/logoVisa.png";
import logosiste from "../assets/img/pagos/logosiste.png";
import contraentrega from "../assets/img/pagos/contraentrega.png";
import master from "../assets/img/pagos/master.png";

import ProductsList from "./Product/ProducstList";
import Navbar from "./Navbar";



const LandingPrincipal = () => {
  const logos = [
    { src: efecti, alt: "Efecti" },
    { src: logoAmeric, alt: "American Express" },
    { src: master, alt: "Mastercard" },
    { src: logoVisa, alt: "Visa" },
    { src: logosiste, alt: "siste" },
    { src: contraentrega, alt: "contraentrega" },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black">
        {/* Carrusel de banners */}
        <div className="flex justify-center items-center h-screen p-2 ">
          <div className="w-full h-full max-w-screen-xl overflow-hidden relative rounded-lg mt-28 sm:mt-28">
            <Carousel
              autoPlay
              infiniteLoop
              showThumbs={false}
              showStatus={false}
              className="carousel"
            >
              <div className="relative">
                <img
                  src={banner3}
                  alt="Banner 1"
                  className="w-full h-auto object-cover rounded-lg"
                />
                {/* Frase sobre la imagen */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-rose-200 text-end">
                  <h1 className="text-3xl sm:text-4xl md:text-4xl font-extrabold leading-tight font-monserrat">
                    ENCUENTRA EL MEJOR OUTFIT EN <br />
                    <span className="text-3xl sm:text-5xl md:text-6xl">
                      BONITA BOUTIQUE
                    </span>
                  </h1>
                </div>
              </div>
              <div className="relative">
                <img
                  src={banner4}
                  alt="Banner 2"
                  className="w-full h-auto object-cover rounded-lg"
                />
                {/* Frase sobre la imagen */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-rose-200 text-end">
                  <h1 className="text-3xl sm:text-4xl md:text-4xl font-extrabold leading-tight font-monserrat">
                    ENCUENTRA EL MEJOR OUTFIT EN <br />
                    <span className="text-3xl sm:text-5xl md:text-6xl">
                      BONITA BOUTIQUE
                    </span>
                  </h1>
                </div>
              </div>
            </Carousel>
          </div>
        </div>

        {/* Logos sin fondo debajo de la imagen principal */}
        
          <div className="flex w-full overflow-hidden relative">
            <div className="flex flex-nowrap space-x-4 sm:space-x-8 marquee">
              {/* Duplica los logos varias veces para que se repitan */}
              {[...Array(5)].map((_, i) => (
                <React.Fragment key={i}>
                  {logos.map((logo, index) => (
                    <img
                      key={index}
                      src={logo.src}
                      alt={logo.alt}
                      className="h-16 sm:h-20 w-auto object-contain"
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        

       
          <ProductsList />
        

        {/* Carrusel de logos de pago */}
        <div className="bg-black py-4 overflow-hidden relative">
          <div className="flex w-full overflow-hidden relative">
            <div className="flex flex-nowrap space-x-4 sm:space-x-8 marquee">
              {/* Duplica los logos varias veces para que se repitan */}
              {[...Array(5)].map((_, i) => (
                <React.Fragment key={i}>
                  {logos.map((logo, index) => (
                    <img
                      key={index}
                      src={logo.src}
                      alt={logo.alt}
                      className="h-16 sm:h-20 w-auto object-contain"
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPrincipal;