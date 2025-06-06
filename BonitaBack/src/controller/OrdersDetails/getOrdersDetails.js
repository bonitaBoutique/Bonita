const { OrderDetail, Product, User, Receipt } = require('../../data'); // ✅ Agregar Receipt
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { latest } = req.query;
    console.log('Latest query param:', latest);
    let orders;
    
    // ✅ CONFIGURACIÓN DE INCLUDES MEJORADA
    const includeConfig = [
      {
        model: Product,
        as: 'products',
        attributes: ['id_product', 'description', 'price', 'priceSell', 'isDian', 'tiendaOnLine', 'codigoBarra', 'images'],
        through: { attributes: [] }
      },
      {
        model: User,
        attributes: ['n_document', 'first_name', 'last_name'], // ✅ Incluir n_document para búsqueda
        required: false
      },
      {
        model: Receipt, // ✅ AGREGAR Receipt
        attributes: ['id_receipt', 'total_amount', 'payMethod', 'date', 'buyer_name'],
        required: false // LEFT JOIN - opcional si no tiene recibo
      }
    ];

    if (latest === 'true') {
      const latestOrder = await OrderDetail.findOne({
        include: includeConfig,
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
          'discount',
          'n_document',
        ],
        order: [['date', 'DESC']],
        limit: 1
      });
      console.log('Latest order found:', latestOrder);
      orders = latestOrder ? [latestOrder] : [];
    } else {
      orders = await OrderDetail.findAll({
        include: includeConfig,
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
          'discount',
          'pointOfSale',
          'n_document',
        ],
        order: [['date', 'DESC']]
      });
    }

    if (!orders || orders.length === 0) {
      return response(res, 200, { orders: [] });
    }

    // ✅ FORMATEAR LA RESPUESTA INCLUYENDO RECEIPT
    const formattedOrders = orders.map(order => {
      const userData = order.User ? {
        n_document: order.User.n_document,
        first_name: order.User.first_name,
        last_name: order.User.last_name
      } : null;

      // ✅ Información del recibo si existe
      const receiptData = order.Receipt ? {
        id_receipt: order.Receipt.id_receipt,
        total_amount: order.Receipt.total_amount,
        payMethod: order.Receipt.payMethod,
        receipt_date: order.Receipt.date,
        buyer_name: order.Receipt.buyer_name
      } : null;

      return {
        ...order.dataValues,
        User: undefined, // Eliminar el objeto User completo de Sequelize
        Receipt: undefined, // Eliminar el objeto Receipt completo de Sequelize
        user_info: userData, // ✅ Datos del usuario formateados
        receipt_info: receiptData, // ✅ Datos del recibo formateados
        products: order.products ? order.products.map(product => ({
          id_product: product.id_product,
          description: product.description,
          price: product.price,
          priceSell: product.priceSell,
          isDian: product.isDian,
          tiendaOnLine: product.tiendaOnLine,
          codigoBarra: product.codigoBarra,
          images: product.images
        })) : []
      };
    });

    return response(res, 200, { orders: formattedOrders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    if (error.message.includes("no existe la columna")) {
      console.error("Parece que Sequelize está buscando una columna inexistente:", error.message);
    }
    return response(res, 500, { error: error.message });
  }
};

