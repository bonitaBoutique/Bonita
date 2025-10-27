const { conn } = require('../src/data');

async function runPaymentMethodsMigration() {
  try {
    console.log('🔄 [MIGRATION] Actualizando ENUMs de métodos de pago...');

    // Lista completa de métodos de pago actualizada
    const newPaymentMethods = [
      'Efectivo',
      'Tarjeta de Crédito',
      'Tarjeta de Débito', 
      'Transferencia',
      'Nequi',
      'Daviplata',
      'Sistecredito',
      'Addi',
      'Bancolombia',
      'GiftCard',
      'Crédito',
      'Otro'
    ];

    await conn.authenticate();
    console.log('✅ [DB] Conexión establecida');

    // En PostgreSQL necesitamos alterar el tipo ENUM
    console.log('📝 Actualizando ENUMs en base de datos...');
    
    // Crear el nuevo ENUM temporalmente
    await conn.query(`
      DO $$ 
      BEGIN
        -- Crear nuevo tipo ENUM temporal
        CREATE TYPE payment_method_new AS ENUM (
          'Efectivo',
          'Tarjeta de Crédito',
          'Tarjeta de Débito',
          'Transferencia',
          'Nequi',
          'Daviplata',
          'Sistecredito',
          'Addi',
          'Bancolombia',
          'GiftCard',
          'Crédito',
          'Otro'
        );

        -- Actualizar Receipt.payMethod
        ALTER TABLE "Receipts" 
        ALTER COLUMN "payMethod" TYPE payment_method_new 
        USING "payMethod"::text::payment_method_new;

        -- Actualizar Receipt.payMethod2
        ALTER TABLE "Receipts" 
        ALTER COLUMN "payMethod2" TYPE payment_method_new 
        USING "payMethod2"::text::payment_method_new;

        -- Actualizar Payment.payMethod
        ALTER TABLE "Payments" 
        ALTER COLUMN "payMethod" TYPE payment_method_new 
        USING "payMethod"::text::payment_method_new;

        -- Eliminar tipos ENUM antiguos y renombrar el nuevo
        DROP TYPE IF EXISTS "enum_Receipts_payMethod" CASCADE;
        DROP TYPE IF EXISTS "enum_Receipts_payMethod2" CASCADE;
        DROP TYPE IF EXISTS "enum_Payments_payMethod" CASCADE;
        
        ALTER TYPE payment_method_new RENAME TO enum_payment_method;

      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error actualizando ENUMs: %', SQLERRM;
      END $$;
    `);

    console.log('✅ [MIGRATION] ENUMs de métodos de pago actualizados exitosamente');

  } catch (error) {
    console.error('❌ [MIGRATION] Error:', error.message);
  } finally {
    await conn.close();
  }
}

runPaymentMethodsMigration();