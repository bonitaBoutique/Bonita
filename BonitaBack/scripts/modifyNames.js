const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "output.json");

// Leer el archivo JSON
let users = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// Recorrer y modificar cada usuario
users = users.map(user => {
  // Solo modificar si first_name existe y last_name está vacío
  if (user.first_name && (!user.last_name || user.last_name.trim() === "")) {
    const parts = user.first_name.trim().split(" ");
    if (parts.length > 1) {
      user.first_name = parts[0];
      user.last_name = parts.slice(1).join(" ");
    } else {
      user.last_name = "desconocido";
    }
  }
  return user;
});

// Guardar el resultado en el mismo archivo o en otro si lo deseas
fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
console.log("Archivo actualizado correctamente.");