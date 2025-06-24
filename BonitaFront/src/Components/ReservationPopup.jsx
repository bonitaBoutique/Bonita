import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ReservationPopup = ({ orderId, totalAmount, onClose, onSubmit }) => {
  const [partialPayment, setPartialPayment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [errors, setErrors] = useState({});

  // ✅ Establecer fecha mínima (hoy + 1 día) y máxima (hoy + 30 días)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    
    // Establecer fecha por defecto a 7 días desde hoy
    const defaultDate = new Date(today);
    defaultDate.setDate(today.getDate() + 7);
    
    setDueDate(defaultDate.toISOString().split('T')[0]);
  }, []);

  // ✅ Validar pago parcial en tiempo real
  const handlePartialPaymentChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPartialPayment(e.target.value);
    
    // Validar que no sea mayor al total
    if (value > totalAmount) {
      setErrors(prev => ({
        ...prev,
        partialPayment: `El pago inicial no puede ser mayor al total ($${totalAmount.toLocaleString('es-CO')})`
      }));
    } else if (value <= 0) {
      setErrors(prev => ({
        ...prev,
        partialPayment: 'El pago inicial debe ser mayor a cero'
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.partialPayment;
        return newErrors;
      });
    }
  };

  // ✅ Validar fecha
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    
    setDueDate(e.target.value);
    
    if (selectedDate <= today) {
      setErrors(prev => ({
        ...prev,
        dueDate: 'La fecha de vencimiento debe ser posterior a hoy'
      }));
    } else if (selectedDate > maxDate) {
      setErrors(prev => ({
        ...prev,
        dueDate: 'La fecha de vencimiento no puede ser mayor a 30 días'
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dueDate;
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ✅ Validaciones finales
    const finalPartialPayment = parseFloat(partialPayment) || 0;
    const remainingAmount = totalAmount - finalPartialPayment;
    
    if (finalPartialPayment <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El pago inicial debe ser mayor a cero'
      });
      return;
    }
    
    if (finalPartialPayment >= totalAmount) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El pago inicial debe ser menor al total para crear una reserva'
      });
      return;
    }
    
    if (!dueDate) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar una fecha de vencimiento'
      });
      return;
    }
    
    if (Object.keys(errors).length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor corrija los errores antes de continuar'
      });
      return;
    }

    // ✅ Confirmación antes de crear la reserva
    Swal.fire({
      title: '¿Confirmar Reserva?',
      html: `
        <div class="text-left">
          <p><strong>Orden:</strong> ${orderId}</p>
          <p><strong>Total:</strong> $${totalAmount.toLocaleString('es-CO')}</p>
          <p><strong>Pago inicial:</strong> $${finalPartialPayment.toLocaleString('es-CO')}</p>
          <p><strong>Saldo pendiente:</strong> $${remainingAmount.toLocaleString('es-CO')}</p>
          <p><strong>Método de pago:</strong> ${paymentMethod}</p>
          <p><strong>Vence:</strong> ${new Date(dueDate).toLocaleDateString('es-CO')}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear reserva',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        onSubmit({
          partialPayment: finalPartialPayment,
          dueDate,
          paymentMethod,
          remainingAmount,
          orderId
        });
      }
    });
  };

  // ✅ Calcular valores en tiempo real
  const partialPaymentNum = parseFloat(partialPayment) || 0;
  const remainingAmount = totalAmount - partialPaymentNum;
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Crear Reserva a Crédito</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Información de la orden */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Orden:</strong> {orderId}
            </p>
            <p className="text-lg font-semibold text-gray-800">
              <strong>Total:</strong> ${totalAmount.toLocaleString('es-CO')}
            </p>
          </div>

          {/* ✅ Pago inicial */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pago Inicial *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={totalAmount - 1}
              value={partialPayment}
              onChange={handlePartialPaymentChange}
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${
                errors.partialPayment ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 50000"
              required
            />
            {errors.partialPayment && (
              <p className="text-red-500 text-xs mt-1">{errors.partialPayment}</p>
            )}
          </div>

          {/* ✅ Mostrar saldo pendiente */}
          {partialPaymentNum > 0 && partialPaymentNum < totalAmount && !errors.partialPayment && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Saldo pendiente:</strong> ${remainingAmount.toLocaleString('es-CO')}
              </p>
            </div>
          )}

          {/* ✅ Método de pago */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago Inicial *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta de Débito o Crédito</option>
              <option value="Nequi">Nequi</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Sistecredito">Sistecredito</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* ✅ Fecha de vencimiento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Vencimiento *
            </label>
            <input
              type="date"
              min={today}
              max={maxDateString}
              value={dueDate}
              onChange={handleDateChange}
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Máximo 30 días desde hoy
            </p>
          </div>

          {/* ✅ Nota importante */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>⚠️ Importante:</strong> El cliente debe completar el pago antes de la fecha de vencimiento para retirar los productos.
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={Object.keys(errors).length > 0 || !partialPayment || !dueDate}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Crear Reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReservationPopup.propTypes = {
  orderId: PropTypes.string.isRequired,
  totalAmount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ReservationPopup;