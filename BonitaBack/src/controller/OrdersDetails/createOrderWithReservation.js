const { OrderDetail, Product, StockMovement } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { formatDateForDB } = require("../../utils/dateUtils");
const secretoIntegridad = "prod_integrity_LpUoK811LHCRNykBpQQp67JwmjESi7OD";

function generarFirmaIntegridad(referencia, montoEnCentavos, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${referencia}${montoEnCentavos}${moneda}${secretoIntegridad}`;
  console.log("Cadena para firma:", cadenaConcatenada);
  return crypto.createHash("sha256").update(cadenaConcatenada).digest("hex");
}

module.exports = async (req, res) => {
  try {
    const { orderId } = req.params; // ID de la orden desde la URL
    
    const {
      // Campos básicos de orden
      date,
      amount,
      quantity,
      state_order,
      products,
      address,
      
      // Campos opcionales
      deliveryAddress,
      shippingCost = 0,
      n_document,
      pointOfSale,
      discount = 0,
      
      // ✅ CAMPOS ESPECÍFICOS DE RESERVA
      partialPayment,
      dueDate,
      id_orderDetail, // Si viene este campo, es reserva de orden existente
      isReservation,   // Flag adicional
      
      // Campos adicionales
      cashier_document,
      buyer_name,
      buyer_email,
      buyer_phone,
      paymentMethod
    } = req.body;

    console.log('🟣 [BACK] Procesando petición de reserva');
    console.log('🟣 [BACK] orderId desde params:', orderId);
    console.log('🟣 [BACK] id_orderDetail desde body:', id_orderDetail);
    console.log('🟣 [BACK] isReservation:', isReservation);
    console.log('🟣 [BACK] partialPayment:', partialPayment);
    console.log('🟣 [BACK] Body completo:', req.body);

    // ✅ DETECTAR SI ES RESERVA DE ORDEN EXISTENTE
    const isExistingOrderReservation = (orderId && (id_orderDetail === orderId)) || 
                                       (isReservation === true) || 
                                       (partialPayment && dueDate);

    if (isExistingOrderReservation) {
      console.log('🟣 [BACK] ✅ Procesando como reserva de orden existente');
      
      // ✅ VERIFICAR QUE LA ORDEN EXISTE
      const existingOrder = await OrderDetail.findByPk(orderId, {
        include: [
          {
            model: Product,
            through: { attributes: ['quantity'] }
          },
          {
            model: User,
            attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']
          }
        ]
      });

      if (!existingOrder) {
        console.log('🔴 [BACK] Orden no encontrada:', orderId);
        return response(res, 404, { error: "Orden no encontrada" });
      }

      console.log('🟢 [BACK] Orden existente encontrada:', existingOrder.id_orderDetail);

      // ✅ VALIDAR DATOS MÍNIMOS PARA RESERVA
      if (!partialPayment || !dueDate || !n_document) {
        console.log('🔴 [BACK] Faltan datos mínimos para reserva');
        return response(res, 400, { error: "Faltan datos mínimos para la reserva: partialPayment, dueDate, n_document" });
      }

      // ✅ VERIFICAR QUE NO EXISTE YA UNA RESERVA PARA ESTA ORDEN
      const existingReservation = await Reservation.findOne({
        where: { id_orderDetail: orderId }
      });

      if (existingReservation) {
        console.log('🔴 [BACK] Ya existe una reserva para esta orden');
        return response(res, 400, { error: "Ya existe una reserva para esta orden" });
      }

      // ✅ CREAR LA RESERVA SIN VERIFICAR STOCK
      const reservationData = {
        id_orderDetail: orderId,
        n_document: n_document,
        partialPayment: Number(partialPayment),
        dueDate: formatDateForDB(dueDate),
        totalPaid: Number(partialPayment),
        remainingAmount: Number(existingOrder.amount) - Number(partialPayment),
        status: 'Pendiente',
        paymentMethod: paymentMethod || 'Efectivo',
        
        // Datos adicionales
        buyer_name: buyer_name,
        buyer_email: buyer_email,
        buyer_phone: buyer_phone,
        cashier_document: cashier_document
      };

      console.log('🟣 [BACK] Creando reserva con datos:', reservationData);

      const newReservation = await Reservation.create(reservationData);

      // ✅ ACTUALIZAR ESTADO DE LA ORDEN A "Reserva a Crédito"
      await existingOrder.update({
        state_order: 'Reserva a Crédito',
        transaction_status: 'Reservado'
      });

      console.log('🟢 [BACK] Reserva creada exitosamente:', newReservation.id);

      return response(res, 201, {
        message: 'Reserva creada exitosamente',
        reservation: {
          id: newReservation.id,
          id_orderDetail: newReservation.id_orderDetail,
          partialPayment: newReservation.partialPayment,
          remainingAmount: newReservation.remainingAmount,
          dueDate: formatDateForDisplay(newReservation.dueDate),
          status: newReservation.status
        },
        order: {
          id_orderDetail: existingOrder.id_orderDetail,
          state_order: existingOrder.state_order,
          amount: existingOrder.amount
        }
      });
    }

    // ✅ SI NO ES RESERVA DE ORDEN EXISTENTE, PROCESAR COMO ORDEN NUEVA
    console.log('🟣 [BACK] Procesando como nueva orden con reserva');

    // Validaciones originales para orden nueva
    if (!date || !amount || !quantity || !state_order || !products || !address) {
      console.log('🔴 [BACK] Missing Ordering Data para nueva orden');
      return response(res, 400, { error: "Missing Ordering Data" });
    }

    // ✅ RESTO DEL CÓDIGO ORIGINAL PARA CREAR ORDEN NUEVA...
    // (Aquí va todo el código original del controlador para crear órdenes nuevas)
    
    console.log('🟣 [BACK] Código para orden nueva no implementado en este ejemplo');
    return response(res, 501, { error: "Crear orden nueva con reserva no implementado" });

  } catch (error) {
    console.error('🔴 [BACK] Error en createOrderWithReservation:', error);
    console.error('🔴 [BACK] Stack trace:', error.stack);
    
    return response(res, 500, { 
      error: "Error interno del servidor", 
      details: error.message 
    });
  }
};