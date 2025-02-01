const { OrderDetail, Product } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { n_document } = req.params;
    console.log('Searching orders for document:', n_document);

    if (!n_document) {
      return response(res, 400, { error: "No se proporcionó n_document." });
    }

    const orders = await OrderDetail.findAll({
      where: { 
        n_document,
        deletedAt: null
      },
      include: {
        model: Product,
        as: 'products',
        attributes: ['id_product', 'description', 'codigoBarra', 'images'],
        where: {
          deletedAt: null
        }
      },
      order: [['createdAt', 'DESC']],
    });

    console.log(`Found ${orders.length} orders for document ${n_document}`);

    if (!orders || orders.length === 0) {
      return response(res, 200, { 
        orders: [],
        message: `No se encontraron órdenes para el documento ${n_document}`
      });
    }

    const formattedOrders = orders.map(order => ({
      id_orderDetail: order.id_orderDetail,
      date: order.date,
      amount: order.amount,
      quantity: order.quantity,
      state_order: order.state_order,
      trackingNumber: order.trackingNumber,
      status: order.status,
      createdAt: order.createdAt,
      products: order.products.map(product => ({
        id_product: product.id_product,
        description: product.description,
        codigoBarra: product.codigoBarra,
        firstImage: product.images ? product.images[0] : null,
      })),
    }));
    
    return response(res, 200, { orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return response(res, 500, { error: error.message });
  }
};

