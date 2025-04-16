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
            attributes: ['id_product', 'description', 'price', 'priceSell', 'isDian', 'tiendaOnLine', 'codigoBarra', 'images'],
            through: { attributes: [] }
          },
          {
            model: User, // <-- Incluir el modelo User
            attributes: ['first_name', 'last_name'], // <-- Especificar los campos deseados
            // Sequelize inferirá la asociación basada en n_document si está definida correctamente
            // Si la clave foránea tiene otro nombre en OrderDetail, necesitas especificarlo:
            // foreignKey: 'nombre_de_tu_clave_foranea_en_OrderDetail'
            required: false // Usa 'false' para que no falle si no encuentra un User (LEFT JOIN)
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
            attributes: ['id_product', 'description', 'price', 'priceSell', 'isDian', 'tiendaOnLine', 'codigoBarra','images'],
            through: { attributes: [] }
          },
          {
            model: User, // <-- Incluir el modelo User
            attributes: ['first_name', 'last_name'], // <-- Especificar los campos deseados
            // Sequelize inferirá la asociación basada en n_document si está definida correctamente
            // Si la clave foránea tiene otro nombre en OrderDetail, necesitas especificarlo:
            // foreignKey: 'nombre_de_tu_clave_foranea_en_OrderDetail'
            required: false // Usa 'false' para que no falle si no encuentra un User (LEFT JOIN)
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
      return response(res, 200, { orders: [] });
    }

    // Formatear la respuesta para incluir las imágenes del producto
    const formattedOrders = orders.map(order => {
      // Extrae los datos del usuario si existen
      const userData = order.User ? {
        first_name: order.User.first_name,
        last_name: order.User.last_name
      } : null; // O un objeto vacío {} si prefieres

      return {
        ...order.dataValues, // Copia todos los campos de OrderDetail
        User: undefined, // Elimina el objeto User completo traído por Sequelize si no lo quieres duplicado
        user_info: userData, // <-- Añade los datos del usuario formateados
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

    // Enviar la respuesta formateada
    return response(res, 200, { orders: formattedOrders });

  } catch (error) {
    // Manejo de errores
    console.error('Error fetching orders:', error);
    // Verifica si el error es el de "columna no existe"
    if (error.message.includes("no existe la columna")) {
        // Puedes loguear un mensaje más específico o simplemente devolver el error
        console.error("Parece que Sequelize está buscando una columna inexistente:", error.message);
    }
    return response(res, 500, { error: error.message });
  }
};

