const { conn } = require('./src/data'); // Asegúrate de que apunte a tu conexión Sequelize

const clearTables = async () => {
  try {
    // Lista de tablas que NO quieres borrar
    const excludedTables = ['products', 'users'];

    // Obtener todas las tablas de la base de datos
    const [tables] = await conn.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    // Filtrar las tablas excluidas
    const tablesToClear = tables
      .map((table) => table.table_name)
      .filter((table) => !excludedTables.includes(table));

    // Borrar los datos de las tablas seleccionadas con CASCADE
    for (const table of tablesToClear) {
      await conn.query(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`Datos eliminados de la tabla: ${table}`);
    }

    console.log('Datos eliminados correctamente de las tablas seleccionadas.');
    process.exit(0);
  } catch (error) {
    console.error('Error al borrar datos:', error);
    process.exit(1);
  }
};

clearTables();