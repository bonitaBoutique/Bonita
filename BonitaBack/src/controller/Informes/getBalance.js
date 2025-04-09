const { OrderDetail, Receipt, Expense, Payment } = require("../../data");
const { Op } = require("sequelize");

const getAllMovements = () => {
  console.log("Income Online:", income.online);
  console.log("Income Local:", income.local);
  console.log("Expenses:", expenses);

  // Combinar todos los movimientos
  const movements = [
    ...(income.online || []).map((sale) => ({
      ...sale,
      type: "Venta Online",
      amount: sale.amount,
      date: new Date(sale.date),
      paymentMethod: sale.paymentMethod || "Wompi", // Método de pago para ventas online
      pointOfSale: "Online",
      id: sale.id,
    })),
    ...(income.local || []).map((sale) => ({
      ...sale,
      type: "Venta Local",
      amount: sale.amount || 0, // Asegurarse de que el monto sea válido
      date: new Date(sale.date),
      paymentMethod: sale.paymentMethod || "Desconocido", // Método de pago para ventas locales
      pointOfSale: "Local",
      id: sale.id,
    })),
    ...(Array.isArray(expenses) ? expenses : []).map((expense) => ({
      ...expense,
      type: `Gasto - ${expense.type}`,
      amount: -expense.amount,
      date: new Date(expense.date),
      paymentMethod: expense.paymentMethods || "Desconocido",
      pointOfSale: "Local",
      id: expense.id || Math.random().toString(36).substr(2, 9),
    })),
  ];

  console.log("Combined Movements:", movements);

  // Filtrar por filtros seleccionados
  let filteredMovements = movements;

  if (filters.expenseType) {
    filteredMovements = filteredMovements.filter(
      (movement) => movement.type === `Gasto - ${filters.expenseType}`
    );
    console.log("Filtered by Expense Type:", filteredMovements);
  }

  if (filters.pointOfSale) {
    filteredMovements = filteredMovements.filter(
      (movement) => movement.pointOfSale === filters.pointOfSale
    );
    console.log("Filtered by Point of Sale:", filteredMovements);
  }

  filteredMovements.forEach((movement) => {
    console.log("Final Movement:", movement);
  });

  return filteredMovements.sort((a, b) => b.date - a.date);
};

module.exports = getBalance;