const { OrderDetail, Product, User } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { latest } = req.query;

    // Consulta todas las órdenes con los productos y el usuario relacionado
    const orders = await OrderDetail.findAll({
      include: [
        {
          model: Product,
          as: 'products', // Debe coincidir con el alias definido en la relación
          attributes: ['id_product', 'description', 'price', 'isDian', 'tiendaOnLine', 'codigoBarra'], // Ajusta los campos necesarios
        },
        {
          model: User,
          attributes: [ 'n_document'], // Solo incluye los campos necesarios del usuario
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (latest === 'true') {
      if (orders.length === 0) {
        return response(res, 404, { error: 'No se encontraron órdenes.' });
      }

      const latestOrder = orders[0];

      const formattedOrder = {
        id_orderDetail: latestOrder.id_orderDetail,
        date: latestOrder.date,
        amount: latestOrder.amount,
        quantity: latestOrder.quantity,
        state_order: latestOrder.state_order,
        address: latestOrder.address,
        deliveryAddress: latestOrder.deliveryAddress,
        isFacturable: latestOrder.isFacturable,
        trackingNumber: latestOrder.trackingNumber,
        n_document: latestOrder.User.n_document, // Incluye el n_document del usuario
        products: latestOrder.products.map(product => ({
          id_product: product.id_product,
          description: product.description,
          price: product.price,
          isDian: product.isDian,
          tiendaOnLine:product.tiendaOnLine,
          codigoBarra:product.codigoBarra
        })),
      };

      return response(res, 200, { orderDetail: formattedOrder });
    }

    // Mapeo de todas las órdenes
    const formattedOrders = orders.map(order => ({
      id_orderDetail: order.id_orderDetail,
      date: order.date,
      amount: order.amount,
      quantity: order.quantity,
      state_order: order.state_order,
      address: order.address,
      isFacturable: order.isFacturable,
      trackingNumber: order.trackingNumber,
      n_document: order.User.n_document, // Incluye el n_document del usuario
      products: order.products.map(product => ({
        id_product: product.id_product,
        description: product.description,
        price: product.price,
        isDian: product.isDian,
        tiendaOnLine:product.tiendaOnLine,
        codigoBarra:product.codigoBarra
      })),
    }));

    return response(res, 200, { orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return response(res, 500, { error: error.message });
  }
};



