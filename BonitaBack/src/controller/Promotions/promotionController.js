/**
 * Controlador: Promotions
 * Descripción: Gestión de promociones globales con descuentos
 * Autor: Sistema de Promociones
 */

const { Promotion } = require("../../data"); // ✅ Importar desde data/index.js
const { Op } = require("sequelize");

/**
 * Obtener la promoción activa vigente
 * GET /api/promotions/active
 */
const getActivePromotion = async (req, res) => {
  console.log("🔍 Obteniendo promoción activa...");
  
  try {
    const promotion = await Promotion.getActivePromotion();
    
    if (!promotion) {
      return res.status(200).json({
        success: true,
        message: "No hay promoción activa en este momento",
        data: null,
      });
    }
    
    console.log("✅ Promoción activa encontrada:", promotion.title);
    
    return res.status(200).json({
      success: true,
      message: "Promoción activa obtenida exitosamente",
      data: {
        id_promotion: promotion.id_promotion,
        title: promotion.title,
        description: promotion.description,
        discount_percentage: parseFloat(promotion.discount_percentage),
        image_url: promotion.image_url,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        created_at: promotion.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener promoción activa:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error al obtener la promoción activa",
      error: error.message,
    });
  }
};

/**
 * Obtener todas las promociones (historial)
 * GET /api/promotions
 */
const getAllPromotions = async (req, res) => {
  console.log("📋 Obteniendo todas las promociones...");
  
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: promotions } = await Promotion.findAndCountAll({
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    console.log(`✅ ${count} promociones encontradas`);
    
    return res.status(200).json({
      success: true,
      message: "Promociones obtenidas exitosamente",
      data: {
        promotions: promotions.map((p) => ({
          id_promotion: p.id_promotion,
          title: p.title,
          description: p.description,
          discount_percentage: parseFloat(p.discount_percentage),
          image_url: p.image_url,
          is_active: p.is_active,
          start_date: p.start_date,
          end_date: p.end_date,
          created_at: p.created_at,
          updated_at: p.updated_at,
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error al obtener las promociones",
      error: error.message,
    });
  }
};

/**
 * Crear una nueva promoción
 * POST /api/promotions
 */
const createPromotion = async (req, res) => {
  console.log("➕ Creando nueva promoción...");
  console.log("📝 Datos recibidos:", req.body);
  
  try {
    const {
      title,
      description,
      discount_percentage,
      image_url,
      is_active = false,
      start_date,
      end_date,
    } = req.body;
    
    // Validaciones básicas
    if (!title || !description || !discount_percentage) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: title, description, discount_percentage",
      });
    }
    
    const discount = parseFloat(discount_percentage);
    
    if (isNaN(discount) || discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "El porcentaje de descuento debe estar entre 0 y 100",
      });
    }
    
    // Validar fechas si se proporcionan
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          message: "La fecha de fin debe ser posterior a la fecha de inicio",
        });
      }
    }
    
    // Crear promoción
    const newPromotion = await Promotion.create({
      title,
      description,
      discount_percentage: discount,
      image_url: image_url || null,
      is_active,
      start_date: start_date || null,
      end_date: end_date || null,
    });
    
    console.log("✅ Promoción creada exitosamente:", newPromotion.id_promotion);
    
    return res.status(201).json({
      success: true,
      message: "Promoción creada exitosamente",
      data: {
        id_promotion: newPromotion.id_promotion,
        title: newPromotion.title,
        description: newPromotion.description,
        discount_percentage: parseFloat(newPromotion.discount_percentage),
        image_url: newPromotion.image_url,
        is_active: newPromotion.is_active,
        start_date: newPromotion.start_date,
        end_date: newPromotion.end_date,
        created_at: newPromotion.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error al crear promoción:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error al crear la promoción",
      error: error.message,
    });
  }
};

/**
 * Actualizar una promoción existente
 * PUT /api/promotions/:id
 */
const updatePromotion = async (req, res) => {
  const { id } = req.params;
  console.log(`✏️ Actualizando promoción ${id}...`);
  console.log("📝 Datos recibidos:", req.body);
  
  try {
    const promotion = await Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promoción no encontrada",
      });
    }
    
    const {
      title,
      description,
      discount_percentage,
      image_url,
      start_date,
      end_date,
    } = req.body;
    
    // Validar descuento si se proporciona
    if (discount_percentage !== undefined) {
      const discount = parseFloat(discount_percentage);
      
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return res.status(400).json({
          success: false,
          message: "El porcentaje de descuento debe estar entre 0 y 100",
        });
      }
    }
    
    // Actualizar campos
    const updateData = {};
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (discount_percentage !== undefined) updateData.discount_percentage = parseFloat(discount_percentage);
    if (image_url !== undefined) updateData.image_url = image_url || null;
    if (start_date !== undefined) updateData.start_date = start_date || null;
    if (end_date !== undefined) updateData.end_date = end_date || null;
    
    await promotion.update(updateData);
    
    console.log("✅ Promoción actualizada exitosamente");
    
    return res.status(200).json({
      success: true,
      message: "Promoción actualizada exitosamente",
      data: {
        id_promotion: promotion.id_promotion,
        title: promotion.title,
        description: promotion.description,
        discount_percentage: parseFloat(promotion.discount_percentage),
        image_url: promotion.image_url,
        is_active: promotion.is_active,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        updated_at: promotion.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Error al actualizar promoción:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la promoción",
      error: error.message,
    });
  }
};

/**
 * Activar/Desactivar una promoción
 * PATCH /api/promotions/:id/toggle
 */
const togglePromotion = async (req, res) => {
  const { id } = req.params;
  console.log(`🔄 Cambiando estado de promoción ${id}...`);
  
  try {
    const promotion = await Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promoción no encontrada",
      });
    }
    
    const newState = !promotion.is_active;
    
    await promotion.update({ is_active: newState });
    
    console.log(`✅ Promoción ${newState ? "activada" : "desactivada"} exitosamente`);
    
    return res.status(200).json({
      success: true,
      message: `Promoción ${newState ? "activada" : "desactivada"} exitosamente`,
      data: {
        id_promotion: promotion.id_promotion,
        title: promotion.title,
        is_active: promotion.is_active,
      },
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado de promoción:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error al cambiar el estado de la promoción",
      error: error.message,
    });
  }
};

/**
 * Eliminar una promoción
 * DELETE /api/promotions/:id
 */
const deletePromotion = async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Eliminando promoción ${id}...`);
  
  try {
    const promotion = await Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promoción no encontrada",
      });
    }
    
    // No permitir eliminar promoción activa
    if (promotion.is_active) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar una promoción activa. Desactívala primero.",
      });
    }
    
    await promotion.destroy();
    
    console.log("✅ Promoción eliminada exitosamente");
    
    return res.status(200).json({
      success: true,
      message: "Promoción eliminada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar promoción:", error);
    
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la promoción",
      error: error.message,
    });
  }
};

module.exports = {
  getActivePromotion,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion,
};
