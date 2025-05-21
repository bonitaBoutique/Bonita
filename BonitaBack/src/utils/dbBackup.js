const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, '../../backups');
console.log("Ruta absoluta de backup:", BACKUP_DIR);

// Extraer datos de la URL de conexión
const dbUrl = process.env.DB_DEPLOY;
const url = new URL(dbUrl);

const DB_USER = url.username;
const DB_PASSWORD = url.password;
const DB_HOST = url.hostname;
const DB_PORT = url.port || 5432;
const DB_NAME = url.pathname.replace('/', '');

const isWin = process.platform === "win32";

// Programa el backup para que corra todos los días a las 2:00am
cron.schedule('0 2 * * *', () => {
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${date}.sql`);

  // Comando para hacer el backup (compatible con Windows y Linux)
  const cmd = isWin
    ? `set PGPASSWORD=${DB_PASSWORD}&& pg_dump -h ${DB_HOST} -U ${DB_USER} -p ${DB_PORT} -F c -b -v -f "${backupFile}" ${DB_NAME}`
    : `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -U ${DB_USER} -p ${DB_PORT} -F c -b -v -f "${backupFile}" ${DB_NAME}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error haciendo backup: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      // No retornes aquí, pg_dump puede escribir en stderr aunque el backup sea exitoso
    }
    console.log(`Backup realizado correctamente: ${backupFile}`);
  });
});

console.log('Tarea de backup programada.');