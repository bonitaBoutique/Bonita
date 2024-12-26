import React from "react";
import banner7 from "./../assets/img/BannerPrincipal/3.png";
import banner5 from "./../assets/img/BannerPrincipal/1.png";
import banner6 from "./../assets/img/BannerPrincipal/9.png";
import banner2 from "./../assets/img/BannerPrincipal/dorada.png";
import banner3 from "./../assets/img/BannerPrincipal/banner10.png";
import efecti from "../assets/img/pagos/efecty.png";
import logoAmeric from "../assets/img/pagos/logoAmeric.png";
import logoVisa from "../assets/img/pagos/logoVisa.png";
import master from "../assets/img/pagos/master.png";
import ZoomCard from "./ZoomCard";
import ProductsList from "./Product/ProducstList";
import Navbar from "./Navbar";

const LandingPrincipal = () => {
  return (
    <>
   <Navbar/>
    <div className="min-h-screen bg-black">
    {/* Carrusel de banners */}
    <div className="h-screen w-full overflow-hidden relative">
      <div className="carousel h-full relative">
        <img
          src={banner3}
          alt="Banner 1"
          className="w-full h-full object-cover opacity-55"
        />
        
        {/* Frase sobre la imagen */}
        <div className="absolute top-1/2 left-8 transform -translate-y-1/2 text-rose-200">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight font-nunito">
            ENCONTRÁ TODO <br /> EN EL MISMO LUGAR
          </h1>
        </div>

      </div>
      </div>

      {/* Cards de estilos de ropa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-12 px-4">
        <ZoomCard
          image={banner5}
          title="Calidad"
          onClick={() => handleCardClick("vestidos-section")}
        />
        <ZoomCard
          image={banner7}
          title="Moda"
          onClick={() => handleCardClick("blazers-section")}
        />
        <ZoomCard
          image={banner6}
          title="Tendencia"
          onClick={() => handleCardClick("jeans-section")}
        />
      </div>
      <div>
      <ProductsList />
      </div>

      {/* Carrusel de logos de pago */}
      <div className="bg-black py-4">
        <div className="flex overflow-x-auto space-x-6 items-center justify-center scrollbar-hide px-4">
          <img
            src={efecti}
            alt="Efecti"
            className="w-16 h-16 flex-shrink-0 sm:w-20 sm:h-20"
          />
          <img
            src={logoAmeric}
            alt="American Express"
            className="w-16 h-16 flex-shrink-0 sm:w-20 sm:h-20"
          />
          <img
            src={logoVisa}
            alt="Visa"
            className="w-16 h-16 flex-shrink-0 sm:w-20 sm:h-20"
          />
          <img
            src={master}
            alt="MasterCard"
            className="w-16 h-16 flex-shrink-0 sm:w-20 sm:h-20"
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default LandingPrincipal;
