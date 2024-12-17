const { OrderDetail, Product } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { latest } = req.query;

    // Verifica que las relaciones estén cargadas correctamente
    console.log('Modelos cargados:', OrderDetail, Product);

    // Consulta todas las órdenes con los productos relacionados
    const orders = await OrderDetail.findAll({
      include: {
        model: Product,
        as: 'products', // Debe coincidir con el alias definido en la relación
        attributes: ['id_product', 'description', 'price', 'isDian'], // Ajusta los campos necesarios
      },
      order: [['createdAt', 'DESC']],
    });

    // Verifica si se están obteniendo órdenes
    console.log('Órdenes obtenidas:', orders);

    if (latest === 'true') {
      if (orders.length === 0) {
        console.log('No se encontraron órdenes.');
        return response(res, 404, { error: 'No se encontraron órdenes.' });
      }

      const latestOrder = orders[0];
      console.log('Última orden:', latestOrder);

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
        products: latestOrder.products.map(product => ({
          id_product: product.id_product,
          description: product.description,
          price: product.price,
          isDian: product.isDian,
        })),
      };

      console.log('Última orden formateada:', formattedOrder);
      return response(res, 200, { orderDetail: formattedOrder });
    }

    // Mapeo de todas las órdenes
    const formattedOrders = orders.map(order => {
      console.log('Procesando orden:', order);

      const formattedProducts = order.products.map(product => {
        console.log('Producto procesado:', product);
        return {
          id_product: product.id_product,
          description: product.description,
          price: product.price,
          isDian: product.isDian,
        };
      });

      return {
        id_orderDetail: order.id_orderDetail,
        date: order.date,
        amount: order.amount,
        quantity: order.quantity,
        state_order: order.state_order,
        address: order.address,
        isFacturable: order.isFacturable,
        trackingNumber: order.trackingNumber,
        products: formattedProducts,
      };
    });

    console.log('Órdenes formateadas:', formattedOrders);
    return response(res, 200, { orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return response(res, 500, { error: error.message });
  }
};


