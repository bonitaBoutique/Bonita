/**
 * Modelo: Promotion
 * Descripción: Gestiona promociones con descuentos globales
 * Autor: Sistema de Promociones
 */

const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Promotion = sequelize.define(
    "Promotion",
    {
      id_promotion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "El título de la promoción es requerido",
          },
          len: {
            args: [3, 100],
            msg: "El título debe tener entre 3 y 100 caracteres",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "La descripción de la promoción es requerida",
          },
          len: {
            args: [10, 1000],
            msg: "La descripción debe tener entre 10 y 1000 caracteres",
          },
        },
      },
      discount_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "El descuento no puede ser negativo",
          },
          max: {
            args: [100],
            msg: "El descuento no puede ser mayor a 100%",
          },
          isDecimal: {
            msg: "El descuento debe ser un número válido",
          },
        },
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrl: {
            msg: "La URL de la imagen debe ser válida",
          },
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: {
            msg: "La fecha de inicio debe ser una fecha válida",
          },
        },
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: {
            msg: "La fecha de fin debe ser una fecha válida",
          },
          isAfterStart(value) {
            if (value && this.start_date && new Date(value) < new Date(this.start_date)) {
              throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
            }
          },
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "updated_at",
      },
    },
    {
      tableName: "promotions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        // Hook para asegurar que solo haya una promoción activa
        beforeCreate: async (promotion) => {
          if (promotion.is_active) {
            await Promotion.update(
              { is_active: false },
              { where: { is_active: true } }
            );
            console.log("✅ Promociones anteriores desactivadas automáticamente");
          }
        },
        beforeUpdate: async (promotion) => {
          if (promotion.is_active && promotion.changed("is_active")) {
            await Promotion.update(
              { is_active: false },
              { 
                where: { 
                  is_active: true,
                  id_promotion: { [Op.ne]: promotion.id_promotion }
                } 
              }
            );
            console.log("✅ Promociones anteriores desactivadas automáticamente");
          }
        },
      },
    }
  );

  // Método de instancia para calcular precio con descuento
  Promotion.prototype.calculateDiscountedPrice = function(originalPrice) {
    const discount = parseFloat(this.discount_percentage);
    const price = parseFloat(originalPrice);
    
    if (isNaN(discount) || isNaN(price)) {
      return originalPrice;
    }
    
    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;
    
    return Math.round(finalPrice); // Redondear al entero más cercano
  };

  // Método de instancia para verificar si la promoción está vigente
  Promotion.prototype.isValid = function() {
    const now = new Date();
    
    // Si no tiene fechas, está vigente si está activa
    if (!this.start_date && !this.end_date) {
      return this.is_active;
    }
    
    // Verificar rango de fechas
    const isAfterStart = !this.start_date || now >= new Date(this.start_date);
    const isBeforeEnd = !this.end_date || now <= new Date(this.end_date);
    
    return this.is_active && isAfterStart && isBeforeEnd;
  };

  // Método estático para obtener la promoción activa vigente
  Promotion.getActivePromotion = async function() {
    try {
      const promotion = await Promotion.findOne({
        where: { is_active: true },
      });
      
      // Verificar si está dentro del rango de fechas
      if (promotion && promotion.isValid()) {
        return promotion;
      }
      
      // Si está fuera del rango, desactivarla automáticamente
      if (promotion && !promotion.isValid()) {
        await promotion.update({ is_active: false });
        console.log("⚠️ Promoción desactivada automáticamente (fuera de rango de fechas)");
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error al obtener promoción activa:", error);
      return null;
    }
  };

  return Promotion;
};
