/**
 * Migration: Create Promotions Table
 * Descripción: Crea tabla para gestionar promociones con descuentos globales
 * Autor: Sistema de Promociones
 * Fecha: 2025-01-22
 */

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log("🚀 Iniciando migración: Crear tabla promotions");

    // ✅ Verificar si la tabla ya existe
    const tableExists = await queryInterface.showAllTables().then((tables) =>
      tables.includes("promotions")
    );

    if (!tableExists) {
      await queryInterface.createTable("promotions", {
        id_promotion: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: "Título de la promoción (ej: 'Black Friday 2025')",
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: "Descripción detallada para mostrar en el popup/banner",
        },
        discount_percentage: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          validate: {
            min: 0,
            max: 100,
          },
          comment: "Porcentaje de descuento (0-100)",
        },
        image_url: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: "URL de la imagen promocional en Cloudinary",
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: "Solo puede haber una promoción activa a la vez",
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: "Fecha de inicio de la promoción",
        },
        end_date: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: "Fecha de fin de la promoción",
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
      console.log("✅ Tabla promotions creada exitosamente");
    } else {
      console.log("⏭️  Tabla promotions ya existe, saltando creación");
    }

    // ✅ Intentar crear índice único (ignorar si ya existe)
    try {
      await queryInterface.addIndex("promotions", ["is_active"], {
        name: "idx_active_promotion",
        where: {
          is_active: true,
        },
        unique: true,
      });
      console.log("✅ Índice único para promoción activa configurado");
    } catch (error) {
      if (error.original?.code === "42P07") {
        console.log("⏭️  Índice idx_active_promotion ya existe, saltando creación");
      } else {
        throw error;
      }
    }

    console.log("✅ Migración completada exitosamente");
  },

  down: async (queryInterface, Sequelize) => {
    console.log("🔄 Revirtiendo migración: Eliminar tabla promotions");

    await queryInterface.removeIndex("promotions", "idx_active_promotion");
    await queryInterface.dropTable("promotions");

    console.log("✅ Tabla promotions eliminada");
  },
};
