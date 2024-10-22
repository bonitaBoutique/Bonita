import React from 'react';
import banner from './../assets/img/banner.png';
import banner1 from './../assets/img/BannerPrincipal/bannerA.jpeg';
import banner2 from './../assets/img/BannerPrincipal/bannerB.jpeg';
import banner3 from './../assets/img/BannerPrincipal/bannerC.jpeg';
import efecti from '../assets/img/pagos/efecty.png';
import logoAmeric from '../assets/img/pagos/logoAmeric.png';
import logoVisa from '../assets/img/pagos/logoVisa.png';
import master from '../assets/img/pagos/master.png';
import pse from '../assets/img/PSE.png';
import envios from '../assets/img/pagos/envios.png';
import pagos from '../assets/img/pagos/pagoConEntrega.png'
import logoAz from '../assets/img/logoSolo.png'

const LandingPrincipal = () => {
  return (
    <div className="min-h-screen bg-colorFooter">
      {/* Carrusel de imágenes en movimiento */}
      <div className="relative overflow-hidden">
        <div className="carousel-container">
          <div className="carousel-content flex">
            <img src={banner1} alt="Banner 1" className="carousel-image w-full h-80 object-cover" />
            <img src={banner2} alt="Banner 2" className="carousel-image w-full h-80 object-cover" />
            <img src={banner3} alt="Banner 3" className="carousel-image w-full h-80 object-cover" />
          </div>
        </div>
      </div>
     {/* Flayer - Propaganda que se mueve hacia la izquierda */}
<div className="text-center font-nunito font-semibold overflow-hidden bg-black">
  <div className="flex justify-center items-center space-x-40 animate-marquee-right">
    {/* Primer Texto en Movimiento */}
    <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl mr-10 text-yellow-500">
      <img src={pagos} alt="Payment Logo 1" className="w-20 h-auto mr-3" />
      PAGO CONTRAENTREGA
    </div>

    {/* Segundo Texto en Movimiento */}
    <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl text-yellow-500">
      <img src={envios} alt="Payment Logo 1" className="w-20 h-auto mr-3" />
      ENVIO GRATIS A PARTIR DE $160.000
      <img src={envios} alt="Payment Logo 1" className="w-20 h-auto ml-3" />
    </div>
  </div>
</div>


      {/* Secciones divididas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Sección Caballeros */}
        <div className="relative group">
          <a href="/caballeros">
            <img
              src={banner}
              alt="Caballeros"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h2 className="text-white text-3xl md:text-4xl font-bold group-hover:underline font-nunito">
                 Caballeros
              </h2>
            </div>
          </a>
        </div>

        {/* Sección Damas */}
        <div className="relative group">
          <a href="/damas">
            <img
              src={banner}
              alt="Damas"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h2 className="text-white text-3xl md:text-4xl font-bold group-hover:underline font-nunito">
                 Damas
              </h2>
            </div>
          </a>
        </div>
      </div>
 {/* Flayer - Propaganda que se mueve hacia la izquierda */}
 <div className="text-center overflow-hidden bg-black py-4">
  <div className="flex justify-center items-center space-x-20 animate-marquee-left">
    {/* Imagen 1 */}
    <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl mr-10 text-yellow-500">
      <img src={logoAz} alt="Payment Logo 1" className="w-10 h-auto mr-3" />
      MEDIOS DE PAGO
    </div>
    
    <img src={efecti} alt="Payment Logo 1" className="payment-logo" />
   

    {/* Imagen 2 */}
    <img src={logoAmeric} alt="Payment Logo 2" className="payment-logo" />

    {/* Imagen 3 */}
    <img src={logoVisa} alt="Payment Logo 3" className="payment-logo" />

    {/* Imagen 4 */}
    <img src={master} alt="Payment Logo 4" className="payment-logo" />
    
    {/* Imagen 4 */}
    <img src={pse} alt="Payment Logo 4" className="payment-logo" />
    <div className="flex items-center whitespace-nowrap text-3xl md:text-4xl mr-10 text-yellow-500">
      
      MEDIOS DE PAGO
      <img src={logoAz} alt="Payment Logo 1" className="w-10 h-auto ml-3" />
    </div>
  </div>
</div>



    </div>
  );
};

export default LandingPrincipal;


