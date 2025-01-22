import React from 'react';

const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      <h2 className="text-2xl font-semibold text-pink-500 ml-4">Bonita Boutique</h2>
    </div>
  );
};

export default Loading;