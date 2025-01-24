const { OrderDetail, Product, User} = require('../../data');
const response = require('../../utils/response');
module.exports = async (req, res) => {
  try {
    const { id_orderDetail } = req.params;
    if (!id_orderDetail) {
      return response(res, 400, { error: "No se proporcionó el id_orderDetail." });
    }
    const order = await OrderDetail.findOne({
      where: { id_orderDetail },
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id_product', 'codigoBarra', 'description', 'price', 'priceSell']
      }]
    });

    if (!order) {
      return response(res, 404, { error: "Orden no encontrada." });
    }

    const user = await User.findOne({
      where: { n_document: order.n_document },
      attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']
    });

    if (!user) {
      return response(res, 404, { error: "Usuario no encontrado" });
    }



    const formattedOrder = {
      id_orderDetail: order.id_orderDetail,
      date: order.date,
      amount: order.amount,
      quantity: order.quantity,
      state_order: order.state_order,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      n_document: order.n_document,
      userData: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone
      },
      products: order.products.map(product => ({
        id_product: product.id_product,
        codigoBarra: product.codigoBarra,
        description: product.description,
        priceSell: product.priceSell,
        price: product.price
      })),
      integritySignature: order.integritySignature,
      trackingNumber: order.trackingNumber
    };


    return response(res, 200, { orderDetail: formattedOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return response(res, 500, { error: error.message });
  }
};




