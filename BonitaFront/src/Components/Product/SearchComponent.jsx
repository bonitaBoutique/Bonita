import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProductsFilter, fetchProducts } from '../../Redux/Actions/actions';

const SearchComponent = () => {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = { search}; // Construye el objeto con los filtros
    dispatch(fetchProductsFilter(filters));
  };

  const handleShowAll = () => {
    setSearch('');
    dispatch(fetchProducts()); // Llama a la acción para traer todos los productos
  };

  
  




  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />




        <button type="submit" className="p-2 bg-slate-500 text-white rounded">
          Buscar
        </button>
      </form>

      <button onClick={handleShowAll} className="mt-2 p-2 bg-gray-500 text-white rounded">
        Mostrar todos
      </button>
    </div>
  );
};

export default SearchComponent;
