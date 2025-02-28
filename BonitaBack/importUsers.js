
// filepath: /c:/Users/merce/Desktop/Bonita/BonitaBack/scripts/importUsers.js
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { User } = require("./src/data");

// Función para generar una contraseña aleatoria de 8 caracteres
function generatePassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Función para generar un email si no existe
function generateEmail(firstName, lastName, n_document) {
  const cleanName = firstName.replace(/\s+/g, "").toLowerCase();
  return `${cleanName}${n_document}@example.com`;
}

async function importUsers() {
  const filePath = path.resolve(__dirname, "output.json");
  const fileContent = fs.readFileSync(filePath, "utf8");
  const usersData = JSON.parse(fileContent);

  for (let user of usersData) {
    // Si el email está vacío, se genera automáticamente
    if (!user.email || user.email.trim() === "") {
      user.email = generateEmail(user.first_name, user.last_name, user.n_document);
    }

    // Si no se dispone de contraseña, se genera una aleatoria
    let plainPassword;
    if (!user.password || user.password.trim() === "") {
      plainPassword = generatePassword();
      console.log(`Usuario ${user.first_name}: password temporal - ${plainPassword}`);
    }

    const hashedPassword = await bcrypt.hash(plainPassword || user.password, 10);

    try {
      // Opcional: puedes verificar si el usuario ya existe (por documento o email)
      await User.create({
        first_name: user.first_name,
        last_name: user.last_name,
        n_document: user.n_document,
        phone: user.phone,
        email: user.email,
        password: hashedPassword
      });
      console.log(`Usuario ${user.first_name} importado correctamente.`);
    } catch (error) {
      console.error(`Error al importar el usuario ${user.first_name}:`, error);
    }
  }

  console.log("Importación de usuarios completada.");
}

importUsers().catch(err => console.error(err));