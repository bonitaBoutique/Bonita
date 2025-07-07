const { Receipt, OrderDetail, Product } = require("../../data");

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

    // ✅ FILTROS OPCIONALES
    if (cashier_document) {
      queryOptions.where.cashier_document = cashier_document;
    }

    if (date_from) {
      queryOptions.where.date = {
        ...queryOptions.where.date,
        [Op.gte]: date_from
      };
    }

    if (date_to) {
      queryOptions.where.date = {
        ...queryOptions.where.date,
        [Op.lte]: date_to
      };
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