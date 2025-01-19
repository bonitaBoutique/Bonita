import  { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createExpense } from '../../Redux/Actions/actions'; // Asegúrate de tener esta acción definida

//crear descripcion de gasto. 
//agregar en el select pago seguridad social
// agregar select Nequi bancolombia efectivo y otro
const CargarGastos = () => {
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(state => state.expenses);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createExpense({ date, type, amount }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6 bg-gray-300 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Crear Gasto</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-300 focus:border-pink-400 sm:text-sm"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Tipo de Gasto</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Seleccione un tipo</option>
            <option value="Impuestos">Impuestos</option>
            <option value="Nomina Colaboradores">Nomina Colaboradores</option>
            <option value="Nomina Contratistas Externos">Nomina Contratistas Externos</option>
            <option value="Publicidad">Publicidad</option>
            <option value="Servicio Agua">Servicio Agua</option>
            <option value="Servicio Energia">Servicio Energia</option>
            <option value="Servicio Internet">Servicio Internet</option>
            <option value="Suministros">Suministros</option>
            <option value="Viaticos y Transportes">Viaticos y Transportes</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Monto</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-300 hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Crear Gasto'}
          </button>
        </div>
        {success && <div className="col-span-2 text-green-500">Gasto creado exitosamente!</div>}
        {error && <div className="col-span-2 text-red-500">{error}</div>}
      </form>
    </div>
  );
};

export default CargarGastos;