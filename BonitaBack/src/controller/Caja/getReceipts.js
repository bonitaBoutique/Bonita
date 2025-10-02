const { Receipt, OrderDetail, Product } = require("../../data");
const { Op } = require("sequelize");

// ✅ NUEVA: Función para manejar fechas de Colombia (igual que en StockMovements y Balance)
const parseDateForColombia = (dateString, isEndDate = false) => {
  if (!dateString) return null;
  
  console.log(`🕒 [getReceipts] Input: ${dateString}, isEndDate: ${isEndDate}`);
  
  // Si es formato YYYY-MM-DD, interpretar como fecha local de Colombia
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    if (isEndDate) {
      // Para dateTo: 23:59:59.999 del día seleccionado
      const endDate = new Date(`${dateString}T23:59:59.999`);
      console.log(`📅 [getReceipts dateTo] ${dateString} → ${endDate.toISOString()}`);
      return endDate;
    } else {
      // Para dateFrom: 00:00:00 del día seleccionado  
      const startDate = new Date(`${dateString}T00:00:00.000`);
      console.log(`📅 [getReceipts dateFrom] ${dateString} → ${startDate.toISOString()}`);
      return startDate;
    }
  }
  
  return new Date(dateString);
};

module.exports = async (req, res) => {
  try {
    console.log("🔍 Obteniendo recibos con parámetros:", req.query);

    // ✅ MEJORAR PARÁMETROS DE PAGINACIÓN
    const { 
      page = 1, 
      limit = 50, // ✅ Aumentar límite por defecto
      all = false, // ✅ Opción para traer todos los recibos
      cashier_document,
      date_from,
      date_to
    } = req.query;

    let queryOptions = {
      order: [["id_receipt", "DESC"]], // Más recientes primero
      where: {
        // ✅ FILTRAR RECIBOS NO ELIMINADOS EXPLÍCITAMENTE
        deletedAt: null
      },
      include: [
        {
          model: OrderDetail,
          required: false, // ✅ LEFT JOIN para incluir recibos sin OrderDetail
          include: [
            {
              model: Product,
              as: "products",
              required: false, // ✅ LEFT JOIN para incluir órdenes sin productos
              through: { 
                attributes: ['quantity'] // ✅ Incluir cantidad de la tabla intermedia
              },
              attributes: [
                'id_product',
                'description',
                'priceSell',
                'stock',
                'marca',
                'codigoBarra',
                'sizes',
                'colors'
              ]
            },
          ],
        },
      ],
    };

    // ✅ FILTROS OPCIONALES CON ZONA HORARIA DE COLOMBIA
    if (cashier_document) {
      queryOptions.where.cashier_document = cashier_document;
    }

    // ✅ FILTROS DE FECHA CORREGIDOS
    if (date_from || date_to) {
      queryOptions.where.date = {};
      
      if (date_from) {
        queryOptions.where.date[Op.gte] = parseDateForColombia(date_from, false);
        console.log("📅 [getReceipts] Fecha desde:", date_from);
      }

      if (date_to) {
        queryOptions.where.date[Op.lte] = parseDateForColombia(date_to, true);
        console.log("📅 [getReceipts] Fecha hasta:", date_to);
      }
    }

    // ✅ DECIDIR SI USAR PAGINACIÓN O TRAER TODOS
    if (all === 'true' || all === true) {
      console.log("📋 Trayendo TODOS los recibos (sin paginación)");
      
      const receipts = await Receipt.findAll(queryOptions);
      
      console.log(`✅ ${receipts.length} recibos encontrados`);

      return res.status(200).json({
        total: receipts.length,
        pages: 1,
        currentPage: 1,
        receipts: receipts,
        message: `${receipts.length} recibos encontrados`
      });
    } else {
      console.log(`📋 Trayendo recibos con paginación: página ${page}, límite ${limit}`);
      
      const offset = (page - 1) * limit;
      queryOptions.limit = parseInt(limit);
      queryOptions.offset = parseInt(offset);

      const receipts = await Receipt.findAndCountAll(queryOptions);

      console.log(`✅ ${receipts.count} recibos totales, ${receipts.rows.length} en esta página`);

      return res.status(200).json({
        total: receipts.count,
        pages: Math.ceil(receipts.count / limit),
        currentPage: parseInt(page),
        receipts: receipts.rows,
        message: `Página ${page} de ${Math.ceil(receipts.count / limit)}`
      });
    }

  } catch (error) {
    console.error("💥 Error al obtener los recibos:", error);
    console.error("💥 Stack trace:", error.stack);
    
    return res.status(500).json({ 
      status: "error",
      message: "Error al obtener los recibos",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};