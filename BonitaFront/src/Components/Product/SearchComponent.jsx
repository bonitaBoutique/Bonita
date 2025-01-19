import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchFilteredProducts, fetchProducts } from '../../Redux/Actions/actions';
import { FaSearch } from 'react-icons/fa';

const SearchComponent = () => {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = { search };
    dispatch(fetchFilteredProducts(filters));
  };

  const handleShowAll = () => {
    setSearch('');
    dispatch(fetchProducts());
  };

  return (
    <div className="w-full bg-colorBeigeClaro opacity-65 p-4 shadow-md">
      <form onSubmit={handleSearch} className="flex items-center justify-center space-x-4 border-spacing-1 border-colorFooter p-3 rounded-3xl bg-rose-300 shadow-md max-w-5xl mx-auto">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border-none rounded-l-full w-full focus:outline-none focus:ring-2 "
        />
        <button
          type="submit"
          className="p-2  text-colorFooter rounded-r-full  flex items-center"
        >
          <FaSearch className="mr-2" />
        </button>
        <button
          onClick={handleShowAll}
          className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
        >
          Ver todo
        </button>
      </form>
    </div>
  );
};

export default SearchComponent;

