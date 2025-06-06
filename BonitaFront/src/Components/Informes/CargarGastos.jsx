import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createExpense } from "../../Redux/Actions/actions";
// ✅ Importar utilidades de fecha para Colombia
import {
  getColombiaDate,
  formatDateForDisplay,
  isValidDate,
} from "../../utils/dateUtils";
import Swal from "sweetalert2";

const CargarGastos = () => {
  // ✅ Estado de fecha inicializado con fecha de Colombia
  const [date, setDate] = useState(() => getColombiaDate());
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");
  const [destinatario, setDestinatario] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, success, error } = useSelector((state) => state.expenses);

  const handleBack = () => {
    navigate(-1);
  };

  // ✅ Manejar cambios de fecha con validación
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (!isValidDate(selectedDate)) {
      Swal.fire({
        icon: "error",
        title: "Fecha inválida",
        text: "Por favor selecciona una fecha válida.",
      });
      return;
    }

    // Validar que no sea una fecha futura
    const today = new Date(getColombiaDate());
    const selected = new Date(selectedDate);

    if (selected > today) {
      Swal.fire({
        icon: "warning",
        title: "Fecha futura",
        text: "No se pueden registrar gastos con fecha futura.",
      });
      return;
    }

    // Validar que no sea muy antigua (más de 1 año)
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    if (selected < oneYearAgo) {
      Swal.fire({
        icon: "warning",
        title: "Fecha muy antigua",
        text: "No se pueden registrar gastos con más de 1 año de antigüedad.",
      });
      return;
    }

    setDate(selectedDate);
    console.log("Fecha de gasto seleccionada (Colombia):", selectedDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validaciones mejoradas incluyendo fecha
    if (!isValidDate(date)) {
      Swal.fire({
        icon: "error",
        title: "Error en la fecha",
        text: "Por favor selecciona una fecha válida.",
      });
      return;
    }

    if (!type.trim()) {
      Swal.fire({
        icon: "error",
        title: "Tipo de gasto requerido",
        text: "Por favor selecciona un tipo de gasto.",
      });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Swal.fire({
        icon: "error",
        title: "Monto inválido",
        text: "El monto debe ser mayor a 0.",
      });
      return;
    }

    if (!paymentMethods.trim()) {
      Swal.fire({
        icon: "error",
        title: "Método de pago requerido",
        text: "Por favor selecciona un método de pago.",
      });
      return;
    }

    try {
      // ✅ Mostrar loading
      Swal.fire({
        title: "Creando gasto...",
        text: "Por favor espera mientras procesamos la información",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      // ✅ Datos con fecha validada de Colombia
      const expenseData = {
        date: date, // Ya está validada
        type: type.trim(),
        amount: Number(amount),
        paymentMethods: paymentMethods.trim(),
        description: description.trim() || null,
        destinatario: destinatario.trim() || null,
      };

      console.log("Enviando gasto con fecha de Colombia:", expenseData);

      await dispatch(createExpense(expenseData));

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: `Gasto registrado para el ${formatDateForDisplay(date)}`,
        confirmButtonText: "Ok",
      });

      // ✅ Resetear campos con fecha de Colombia
      setDate(getColombiaDate());
      setType("");
      setAmount("");
      setDescription("");
      setPaymentMethods("");
      setDestinatario("");
    } catch (err) {
      console.error("Error al crear gasto:", err);
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

      {/* ✅ Información de fecha actual de Colombia */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Fecha actual de Colombia:</strong>{" "}
          {formatDateForDisplay(getColombiaDate())}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Fecha predeterminada configurada para hoy
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* ✅ Campo de fecha mejorado */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha del Gasto *
          </label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            min={
              new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            } // Hasta 1 año atrás
            max={getColombiaDate()} // No fechas futuras
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-300 focus:border-pink-400 sm:text-sm"
            required
          />
          {/* ✅ Mostrar fecha formateada */}
          <p className="text-sm text-gray-600 mt-1">
            Fecha seleccionada: {formatDateForDisplay(date)}
          </p>
        </div>

        {/* Tipo de Gasto */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Gasto *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Seleccione un tipo</option>
            <option value="Impuestos">Impuestos</option>
            <option value="Nomina Colaboradores">Nómina Colaboradores</option>
            <option value="Nomina Contratistas Externos">
              Nómina Contratistas Externos
            </option>
            <option value="Seguridad Social">Seguridad Social</option>
            <option value="Publicidad">Publicidad</option>
            <option value="Servicio Agua">Servicio Agua</option>
            <option value="Servicio Energia">Servicio Energía</option>
            <option value="Servicio Internet">Servicio Internet</option>
            <option value="Suministros">Suministros</option>
            <option value="Viaticos y Transportes">
              Viáticos y Transportes
            </option>
            <option value="Inventario">Inventario</option>
            <option value="Arriendo">Arriendo</option>
            <option value="Proveedores">Proveedores</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        {/* Descripción */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ingrese una descripción detallada del gasto..."
            rows="4"
            maxLength="2000" // ✅ AUMENTAR EL LÍMITE
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/2000 caracteres
          </p>
        </div>

        {/* Monto */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto *
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="0.00"
            required
          />
          {amount && Number(amount) > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Monto:{" "}
              {Number(amount).toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
            </p>
          )}
        </div>

        {/* Método de Pago */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago *
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
            <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
            <option value="Transferencia">Transferencia Bancaria</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Destinatario */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destinatario (Opcional)
          </label>
          <input
            type="text"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Nombre o entidad a quien se dirige el gasto"
            maxLength="100"
          />
          <p className="text-xs text-gray-500 mt-1">
            {destinatario.length}/100 caracteres
          </p>
        </div>

        {/* Botones */}
        <div className="col-span-2 space-y-4">
          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            disabled={loading}
          >
            {loading ? "Creando gasto..." : "Crear Gasto"}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
          >
            Volver
          </button>
        </div>
      </form>

      {/* ✅ Información adicional */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">
          Importante:
        </h3>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Los gastos se registran en hora de Colombia</li>
          <li>• No se permiten fechas futuras</li>
          <li>• El monto debe ser mayor a $0</li>
          <li>• Todos los campos marcados con * son obligatorios</li>
        </ul>
      </div>
    </div>
  );
};

export default CargarGastos;
