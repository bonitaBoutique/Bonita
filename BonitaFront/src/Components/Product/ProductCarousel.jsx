import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFilteredProducts, setCategoryFilter } from '../../Redux/Actions/actions';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; 
import 'swiper/css/navigation'; 
import 'swiper/css/pagination'; 
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const ProductCarousel = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products || []);
  const categoryFilter = useSelector((state) => state.products.categoryFilter || '');

  useEffect(() => {
   
    dispatch(setCategoryFilter(''));

   
    dispatch(fetchFilteredProducts('', null, ''));
  }, [dispatch]);


  const filteredProducts = categoryFilter === ''
    ? products
    : products.filter((product) => product.category === categoryFilter);

  return (
    <div className="carousel-container p-8 mt-20">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]} 
        navigation
        pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={1} 
        autoplay={{ // Configuración del autoplay
          delay: 1500, // 3 segundos entre cada slide
          disableOnInteraction: false, // Para que siga reproduciendo después de una interacción
        }}
        breakpoints={{
          640: { slidesPerView: 1 }, 
          768: { slidesPerView: 2 }, 
          1024: { slidesPerView: 4 } 
        }}
      >
        {filteredProducts.length > 0
          ? filteredProducts.map((product) => (
              <SwiperSlide key={product.id_product}>
                <Link to={`/product/${product.id_product}`}>
                <div className="w-80 mb-14 p-4 bg-colorFooter rounded-lg shadow-lg text-center ml-12">
                  {product.isOffer && (
                    <span className="absolute  font-semibold top-0 left-8 bg-gray-500 text-colorLogo text-xl px-2 py-0 rounded-md">
                      OFERTA
                    </span>
                  )}
                   <h3 className="mt-2 -mb-4 text-lg font-semibold font-nunito text-slate-800 bg-yellow-600 p-2 rounded">{product.name}</h3>
                  <img
                    src={product.Images[0]?.url || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-full h-80 object-contain rounded-2xl mb-2" // object-contain asegura que la imagen no se recorte
                  />
                 
                  <p className="text-gray-400 font-nunito text-3xl font-semibold">${product.price}</p>
                </div>
                </Link>
              </SwiperSlide>
            ))
          : (
            <SwiperSlide>
              <div className="w-64 p-4 bg-gray-800 rounded-lg shadow-lg text-center">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Placeholder"
                  className="w-full h-72 object-contain rounded-2xl mb-4"
                />
                <h3 className="mt-2 text-lg font-semibold text-white font-nunito">Producto no disponible</h3>
                <p className="text-gray-400">$0.00</p>
              </div>
            </SwiperSlide>
          )}
      </Swiper>
    </div>
  );
};

export default ProductCarousel;









