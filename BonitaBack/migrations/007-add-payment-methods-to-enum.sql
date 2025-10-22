-- =====================================================
-- Migración: Agregar nuevos métodos de pago al enum
-- Fecha: 2025-10-21
-- Descripción: Agrega Tarjeta de Crédito, Tarjeta de Débito, 
--              Transferencia y Daviplata al enum de métodos de pago
-- =====================================================

-- NOTA: En PostgreSQL, ALTER TYPE ... ADD VALUE no se puede hacer dentro de una transacción
-- Por lo tanto, estos comandos deben ejecutarse uno por uno

-- Agregar 'Tarjeta de Crédito' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Tarjeta de Crédito' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod'
        )
    ) THEN
        ALTER TYPE "enum_Receipts_payMethod" ADD VALUE 'Tarjeta de Crédito';
        RAISE NOTICE 'Agregado: Tarjeta de Crédito';
    ELSE
        RAISE NOTICE 'Ya existe: Tarjeta de Crédito';
    END IF;
END$$;

-- Agregar 'Tarjeta de Débito' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Tarjeta de Débito' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod'
        )
    ) THEN
        ALTER TYPE "enum_Receipts_payMethod" ADD VALUE 'Tarjeta de Débito';
        RAISE NOTICE 'Agregado: Tarjeta de Débito';
    ELSE
        RAISE NOTICE 'Ya existe: Tarjeta de Débito';
    END IF;
END$$;

-- Agregar 'Transferencia' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Transferencia' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod'
        )
    ) THEN
        ALTER TYPE "enum_Receipts_payMethod" ADD VALUE 'Transferencia';
        RAISE NOTICE 'Agregado: Transferencia';
    ELSE
        RAISE NOTICE 'Ya existe: Transferencia';
    END IF;
END$$;

-- Agregar 'Daviplata' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Daviplata' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod'
        )
    ) THEN
        ALTER TYPE "enum_Receipts_payMethod" ADD VALUE 'Daviplata';
        RAISE NOTICE 'Agregado: Daviplata';
    ELSE
        RAISE NOTICE 'Ya existe: Daviplata';
    END IF;
END$$;

-- =====================================================
-- Aplicar los mismos cambios a payMethod2 (si existe como enum separado)
-- =====================================================

-- Agregar 'Tarjeta de Crédito' a payMethod2 si no existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Receipts_payMethod2') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'Tarjeta de Crédito' 
            AND enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod2'
            )
        ) THEN
            ALTER TYPE "enum_Receipts_payMethod2" ADD VALUE 'Tarjeta de Crédito';
            RAISE NOTICE 'Agregado a payMethod2: Tarjeta de Crédito';
        END IF;
    END IF;
END$$;

-- Agregar 'Tarjeta de Débito' a payMethod2 si no existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Receipts_payMethod2') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'Tarjeta de Débito' 
            AND enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod2'
            )
        ) THEN
            ALTER TYPE "enum_Receipts_payMethod2" ADD VALUE 'Tarjeta de Débito';
            RAISE NOTICE 'Agregado a payMethod2: Tarjeta de Débito';
        END IF;
    END IF;
END$$;

-- Agregar 'Transferencia' a payMethod2 si no existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Receipts_payMethod2') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'Transferencia' 
            AND enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod2'
            )
        ) THEN
            ALTER TYPE "enum_Receipts_payMethod2" ADD VALUE 'Transferencia';
            RAISE NOTICE 'Agregado a payMethod2: Transferencia';
        END IF;
    END IF;
END$$;

-- Agregar 'Daviplata' a payMethod2 si no existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Receipts_payMethod2') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'Daviplata' 
            AND enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod2'
            )
        ) THEN
            ALTER TYPE "enum_Receipts_payMethod2" ADD VALUE 'Daviplata';
            RAISE NOTICE 'Agregado a payMethod2: Daviplata';
        END IF;
    END IF;
END$$;

-- =====================================================
-- Verificación: Mostrar todos los valores del enum
-- =====================================================
SELECT 'Valores actuales de enum_Receipts_payMethod:' as info;
SELECT enumlabel as metodo_pago 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod'
)
ORDER BY enumlabel;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
