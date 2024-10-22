const { OrderDetail, Product } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { n_document } = req.params;

    if (!n_document) {
      return response(res, 400, { error: "No se proporcionó n_document." });
    }

    const orders = await OrderDetail.findAll({
      where: { n_document },
      include: {
        model: Product,
        as: 'products',
        attributes: ['id_product'],
      }
    });

    const formattedOrders = orders.map(order => ({
      id_orderDetail: order.id_orderDetail,
      date: order.date,
      amount: order.amount,
      quantity: order.quantity,
      state_order: order.state_order,
      trackingNumber:order.trackingNumber,
      product_ids: order.products.map(product => product.id_product),
    }));

    return response(res, 200, { orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return response(res, 500, { error: error.message });
  }
};

