// 💳 MÉTODOS DE PAGO CENTRALIZADOS
// Este archivo contiene todos los métodos de pago utilizados en la aplicación

/**
 * Métodos de pago para CAJA (Recibo.jsx)
 * Incluye todos los métodos disponibles incluyendo GiftCard y Crédito
 */
export const PAYMENT_METHODS_CAJA = [
  "Efectivo",
  "Tarjeta de Crédito",
  "Tarjeta de Débito",
  "Transferencia",
  "Nequi",
  "Daviplata",
  "Sistecredito",
  "Addi",
  "Bancolombia",
  "GiftCard",        // ✅ Solo en caja
  "Crédito",         // ✅ Solo en caja
  "Otro"
];

/**
 * Métodos de pago para DEVOLUCIONES (ReturnManagement.jsx)
 * Excluye GiftCard y Crédito
 */
export const PAYMENT_METHODS_RETURNS = [
  "Efectivo",
  "Tarjeta de Crédito",
  "Tarjeta de Débito",
  "Transferencia",
  "Nequi",
  "Daviplata",
  "Sistecredito",
  "Addi",
  "Bancolombia",
  "Otro"
];

/**
 * Métodos de pago para GASTOS (CargarGastos.jsx)
 * Los gastos usan los mismos métodos que devoluciones
 */
export const PAYMENT_METHODS_EXPENSES = PAYMENT_METHODS_RETURNS;

/**
 * Todos los métodos de pago (para referencias y validaciones)
 */
export const ALL_PAYMENT_METHODS = PAYMENT_METHODS_CAJA;

/**
 * Renderizar opciones de métodos de pago para select
 * @param {Array<string>} methods - Array de métodos de pago
 * @param {boolean} includeEmpty - Si incluir opción vacía
 * @returns {JSX.Element[]}
 */
export const renderPaymentMethodOptions = (methods = ALL_PAYMENT_METHODS, includeEmpty = true) => {
  const options = methods.map((method) => (
    <option key={method} value={method}>
      {method}
    </option>
  ));

  if (includeEmpty) {
    return [
      <option key="empty" value="" disabled>
        Seleccione un método
      </option>,
      ...options
    ];
  }

  return options;
};

/**
 * Validar si un método de pago es válido
 * @param {string} method - Método de pago a validar
 * @param {Array<string>} validMethods - Array de métodos válidos
 * @returns {boolean}
 */
export const isValidPaymentMethod = (method, validMethods = ALL_PAYMENT_METHODS) => {
  return validMethods.includes(method);
};
