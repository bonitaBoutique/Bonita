import React from "react";

const ZoomCard = ({ image, title, onClick }) => {
  return (
    <div
      className="relative overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {/* Imagen con efecto de zoom */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      {/* Título centrado */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-50 transition duration-300">
        <h3 className="text-pink-200 text-2xl md:text-4xl font-bold">
          {title.toUpperCase()}
        </h3>
      </div>
    </div>
  );
};

export default ZoomCard;
