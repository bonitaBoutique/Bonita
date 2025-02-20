const { OrderDetail, Product, User } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { latest } = req.query;
    console.log('Latest query param:', latest);
    let orders;
    if (latest === 'true') {
      const latestOrder = await OrderDetail.findOne({
        include: [
          {
            model: Product,
            as: 'products',
            attributes: ['id_product', 'description', 'price', 'priceSell', 'isDian', 'tiendaOnLine', 'codigoBarra'],
            through: { attributes: [] }
          }
        ],
        attributes: [
          'id_orderDetail',
          'date',
          'quantity',
          'amount',
          'address',
          'deliveryAddress',
          'state_order',
          'integritySignature',
          'transaction_status',
          'shipping_status',
          'tracking_number',
          'shipping_company',
          'estimated_delivery_date',
          'isFacturable',
          'status',
          'pointOfSale',
          'n_document',
          'createdAt' // Ensure createdAt is included
        ],
        order: [['createdAt', 'DESC']],
        limit: 1
      });
      console.log('Latest order found:', latestOrder);
      orders = latestOrder ? [latestOrder] : [];
    } else {
      orders = await OrderDetail.findAll({
        include: [
          {
            model: Product,
            as: 'products',
            attributes: ['id_product', 'description', 'price', 'priceSell', 'isDian', 'tiendaOnLine', 'codigoBarra'],
            through: { attributes: [] }
          }
        ],
        attributes: [
          'id_orderDetail',
          'date',
          'quantity',
          'amount',
          'address',
          'deliveryAddress',
          'state_order',
          'integritySignature',
          'transaction_status',
          'shipping_status',
          'tracking_number',
          'shipping_company',
          'estimated_delivery_date',
          'isFacturable',
          'status',
          'pointOfSale',
          'n_document',
          'createdAt' // Ensure createdAt is included
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    if (!orders || orders.length === 0) {
      return response(res, 200, { orders: [] }); // Changed to 200 for empty results
    }

    const formattedOrders = orders.map(order => ({
      ...order.dataValues,
      products: order.products ? order.products.map(product => ({
        id_product: product.id_product,
        description: product.description,
        price: product.price,
        priceSell:product.priceSell,
        isDian: product.isDian,
        tiendaOnLine: product.tiendaOnLine,
        codigoBarra: product.codigoBarra
      })) : []
    }));

    return response(res, 200, { orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return response(res, 500, { error: error.message });
  }
};


