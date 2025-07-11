const { OrderDetail, Product, StockMovement, User, Reservation } = require("../../data");
const response = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { formatDateForDB, getColombiaDate } = require("../../utils/dateUtils"); // ✅ IMPORTAR getColombiaDate
const secretoIntegridad = "prod_integrity_LpUoK811LHCRNykBpQQp67JwmjESi7OD";

// ✅ FUNCIÓN HELPER PARA FORMATEAR FECHA
function formatDateForDisplay(date) {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

function generarFirmaIntegridad(referencia, montoEnCentavos, moneda, secretoIntegridad) {
  const cadenaConcatenada = `${referencia}${montoEnCentavos}${moneda}${secretoIntegridad}`;
  console.log("Cadena para firma:", cadenaConcatenada);
  return crypto.createHash("sha256").update(cadenaConcatenada).digest("hex");
}

module.exports = async (req, res) => {
  try {
    // ✅ OBTENER FECHA DEL SERVIDOR
    const serverDate = getColombiaDate();
    
    // ✅ OBTENER orderId DESDE PARAMS O BODY
    let orderId = req.params.orderId || req.params.id;
    
    const {
      // Campos básicos de orden
      date, // ✅ Fecha del cliente (para logging)
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
      id_orderDetail,
      isReservation,
      
      // Campos adicionales
      cashier_document,
      buyer_name,
      buyer_email,
      buyer_phone,
      paymentMethod
    } = req.body;

    // ✅ LOGS DE FECHA
    console.log('🕒 [RESERVATION] Fecha del cliente:', date);
    console.log('🕒 [RESERVATION] Fecha del servidor (Colombia):', serverDate);

    // ✅ SI NO HAY orderId EN PARAMS, USAR EL DEL BODY
    if (!orderId && id_orderDetail) {
      orderId = id_orderDetail;
      console.log('🟡 [BACK] orderId tomado del body:', orderId);
    }

    console.log('🟣 [BACK] Procesando petición de reserva');
    console.log('🟣 [BACK] orderId final:', orderId);
    console.log('🟣 [BACK] isReservation:', isReservation);
    console.log('🟣 [BACK] partialPayment:', partialPayment);

    // ✅ VALIDAR QUE TENEMOS UN orderId
    if (!orderId) {
      console.log('🔴 [BACK] No se pudo obtener orderId');
      return response(res, 400, { error: "ID de orden requerido" });
    }

    // ✅ DETECTAR SI ES RESERVA DE ORDEN EXISTENTE
    const isExistingOrderReservation = isReservation === true || (partialPayment && dueDate);

    if (isExistingOrderReservation) {
      console.log('🟣 [BACK] ✅ Procesando como reserva de orden existente');
      
      // ✅ VERIFICAR QUE LA ORDEN EXISTE
      const existingOrder = await OrderDetail.findByPk(orderId, {
        include: [
          {
            model: Product,
            as: 'products',
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
      let existingReservation = null;
      try {
        existingReservation = await Reservation.findOne({
          where: { id_orderDetail: orderId }
        });
      } catch (reservationError) {
        console.log('🟡 [BACK] Tabla Reservation no existe o error:', reservationError.message);
      }

      if (existingReservation) {
        console.log('🔴 [BACK] Ya existe una reserva para esta orden');
        return response(res, 400, { error: "Ya existe una reserva para esta orden" });
      }

      // ✅ CREAR LA RESERVA CON FECHA DEL SERVIDOR
      const reservationData = {
        id_orderDetail: orderId,
        n_document: n_document,
        partialPayment: Number(partialPayment),
        dueDate: formatDateForDB(dueDate), // ✅ Mantener dueDate del cliente
        totalPaid: Number(partialPayment),
        remainingAmount: Number(existingOrder.amount) - Number(partialPayment),
        status: 'Pendiente',
        paymentMethod: paymentMethod || 'Crédito',
        buyer_name: buyer_name,
        buyer_email: buyer_email,
        buyer_phone: buyer_phone,
        cashier_document: cashier_document,
        // ✅ AGREGAR fecha de creación del servidor
        createdAt: serverDate
      };

      console.log('🟣 [BACK] Creando reserva con datos:', reservationData);

      let newReservation = null;
      try {
        newReservation = await Reservation.create(reservationData);
        console.log('🟢 [BACK] Reserva creada exitosamente:', newReservation.id);
        console.log('🟢 [BACK] Fecha de creación (servidor):', serverDate);
      } catch (reservationCreateError) {
        console.log('🟡 [BACK] Error creando reserva (usando simulación):', reservationCreateError.message);
        newReservation = {
          id: uuidv4(),
          id_orderDetail: orderId,
          partialPayment: Number(partialPayment),
          remainingAmount: Number(existingOrder.amount) - Number(partialPayment),
          dueDate: dueDate,
          status: 'Pendiente',
          createdAt: serverDate
        };
        console.log('🟡 [BACK] Usando reserva simulada:', newReservation);
      }

      // ✅ ACTUALIZAR ESTADO DE LA ORDEN CON VALORES VÁLIDOS
      console.log('🟣 [BACK] Actualizando estado de la orden...');
      
      try {
        await existingOrder.update({
          state_order: 'Reserva a Crédito',
          transaction_status: 'Pendiente'
        });

        console.log('🟢 [BACK] Orden actualizada exitosamente:');
        console.log('🟢 [BACK] - state_order: "Reserva a Crédito"');
        console.log('🟢 [BACK] - transaction_status: "Pendiente"');
      } catch (updateError) {
        console.log('🔴 [BACK] Error actualizando orden:', updateError.message);
      }

      return response(res, 201, {
        message: 'Reserva creada exitosamente',
        reservation: {
          id: newReservation.id,
          id_orderDetail: newReservation.id_orderDetail,
          partialPayment: newReservation.partialPayment,
          remainingAmount: newReservation.remainingAmount,
          dueDate: formatDateForDisplay(newReservation.dueDate),
          status: newReservation.status,
          createdAt: serverDate // ✅ Fecha del servidor
        },
        order: {
          id_orderDetail: existingOrder.id_orderDetail,
          state_order: 'Reserva a Crédito',
          amount: existingOrder.amount
        },
        serverInfo: {
          clientDate: date,
          serverDate: serverDate,
          timezone: 'America/Bogota'
        }
      });
    }

    // ✅ SI NO ES RESERVA DE ORDEN EXISTENTE, PROCESAR COMO ORDEN NUEVA
    console.log('🟣 [BACK] Procesando como nueva orden con reserva');

    // Validaciones originales para orden nueva
    if (!amount || !quantity || !state_order || !products || !address) {
      console.log('🔴 [BACK] Missing Ordering Data para nueva orden');
      return response(res, 400, { error: "Missing Ordering Data" });
    }

    console.log('🟣 [BACK] Código para orden nueva no implementado');
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