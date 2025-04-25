import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createExpense } from "../../Redux/Actions/actions";
import Swal from "sweetalert2";

const CargarGastos = () => {
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");
  const [destinatario, setDestinatario] = useState(""); // <-- 1. Nuevo estado
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, success, error } = useSelector((state) => state.expenses);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // <-- 3. Incluir destinatario en el dispatch
      await dispatch(createExpense({ date, type, amount, paymentMethods, description, destinatario }));

      Swal.fire({
        icon: "success",
        title: "Éxito!",
        text: "Gasto creado exitosamente!",
        confirmButtonText: "Ok",
      });

      // <-- 4. Resetear todos los campos
      setDate("");
      setType("");
      setAmount("");
      setDescription("");
      setPaymentMethods("");
      setDestinatario(""); // <-- Resetear destinatario
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Hubo un problema al crear el gasto.",
        confirmButtonText: "Ok",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6 bg-gray-300 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Crear Gasto</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* ... Campos Fecha, Tipo, Descripción, Monto ... */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-300 focus:border-pink-400 sm:text-sm"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Gasto
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Seleccione un tipo</option>
            <option value="Impuestos">Impuestos</option>
            <option value="Nomina Colaboradores">Nomina Colaboradores</option>
            <option value="Nomina Contratistas Externos">
              Nomina Contratistas Externos
            </option>
            <option value="Seguridad Social">Seguridad Social</option>
            <option value="Publicidad">Publicidad</option>
            <option value="Servicio Agua">Servicio Agua</option>
            <option value="Servicio Energia">Servicio Energia</option>
            <option value="Servicio Internet">Servicio Internet</option>
            <option value="Suministros">Suministros</option>
            <option value="Viaticos y Transportes">
              Viaticos y Transportes
            </option>
            <option value="Inventario">Inventario</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ingrese una descripción del gasto..."
            rows="3"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Monto
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Metodo de Pago
          </label>
          <select
            value={paymentMethods}
            onChange={(e) => setPaymentMethods(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Seleccione un método</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Bancolombia">Bancolombia</option>
            <option value="Nequi">Nequi</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* <-- 2. Nuevo Input para Destinatario --> */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Destinatario (Opcional)
          </label>
          <input
            type="text"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Nombre o entidad a quien se dirige el gasto"
          />
        </div>

        {/* ... Botones ... */}
        <div className="col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-300 hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Crear Gasto"}
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 mt-4 hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
};

export default CargarGastos;