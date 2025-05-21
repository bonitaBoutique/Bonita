const { OrderDetail } = require("./src/data"); // Ajusta la ruta según tu configuración

const deleteOnlineOrders = async () => {
  try {
    // Eliminar todas las órdenes con pointOfSale = 'Online'
    const result = await OrderDetail.destroy({
      where: {
        pointOfSale: "Online",
      },
    });

    console.log(`Órdenes Online eliminadas: ${result}`);
  } catch (error) {
    console.error("Error al eliminar órdenes Online:", error);
  }
};

deleteOnlineOrders();