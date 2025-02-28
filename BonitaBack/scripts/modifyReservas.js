const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const filePath = path.resolve(__dirname, "reservas.json");
let reservas = JSON.parse(fs.readFileSync(filePath, "utf8"));

reservas = reservas.map(item => {
  // Genera un UUID para id_reservation
  item.id_reservation = uuidv4();

  // Reemplaza id_orderDetail por otro UUID
  item.id_orderDetail = uuidv4();

  // Calcula duedate: 90 días posterior al campo date
  if (item.date) {
    const dateObj = new Date(item.date);
    if (!isNaN(dateObj)) {
      dateObj.setDate(dateObj.getDate() + 90);
      // Formatea la fecha a YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      item.duedate = `${year}-${month}-${day}`;
    } else {
      console.warn(`Formato de fecha inválido en registro: ${item.date}`);
    }
  }
  return item;
});

fs.writeFileSync(filePath, JSON.stringify(reservas, null, 2));
console.log("Reservas actualizadas correctamente.");