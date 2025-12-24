# 🔧 Solución: Duplicación de GiftCards

## 📋 Diagnóstico

### ✅ Código Backend: NO tiene errores de duplicación
Ambos flujos de creación están correctamente implementados:

1. **Compra directa de GiftCard** (`createReceipt.js`)
   - Crea 1 Receipt + 1 Payment + 1 GiftCard
   - Funciona correctamente

2. **Devolución con crédito** (`returnProducts.js`)
   - Crea 1 GiftCard cuando `difference < 0`
   - Usa transacciones correctamente

### ⚠️ Causas Probables de Duplicación

1. **Frontend llamando 2 veces al endpoint** (MÁS PROBABLE)
   - Doble clic en botón
   - Re-render de React
   - Falta de estado `loading`

2. **Endpoint `/giftcard/createGift` usado incorrectamente**
   - Este endpoint NO debería usarse directamente
   - No está protegido contra duplicados

3. **Condiciones de carrera en requests simultáneos**
   - Múltiples requests antes de que el primero termine

---

## 🛠️ Soluciones Implementadas

### ✅ 1. Validación en Backend (COMPLETADO)

**Archivos modificados:**

#### `returnProducts.js`
- Agregada verificación antes de crear GiftCard en devoluciones
- Busca si ya existe una GiftCard con `reference_id` + `reference_type`
- Si existe, retorna la existente sin crear duplicado

#### `createReceipt.js`
- Agregada verificación antes de crear GiftCard en compras
- Busca si ya existe una GiftCard con `id_receipt`
- Si existe, retorna advertencia sin crear duplicado

#### `createGiftCard.js`
- Endpoint directo ahora valida duplicados antes de crear
- Retorna error 409 (Conflict) si ya existe
- Requiere `reference_id` y `reference_type` para seguridad

---

### ✅ 2. Migración de Base de Datos (CREADA)

**Archivo:** `migrations/008-add-unique-giftcard-reference.js`

**Agrega índices únicos:**
- `reference_id` + `reference_type` → Previene duplicados en devoluciones
- `id_receipt` → Previene duplicados en compras

**⚠️ IMPORTANTE:** Ejecutar DESPUÉS de limpiar duplicados existentes

---

### ✅ 3. Script de Limpieza (CREADO)

**Archivo:** `scripts/clean-duplicate-giftcards.js`

**Uso:**

```bash
# 1. PRIMERO: Ver duplicados sin eliminar (modo simulación)
node scripts/clean-duplicate-giftcards.js

# 2. DESPUÉS: Eliminar duplicados (modo ejecución)
node scripts/clean-duplicate-giftcards.js --execute
```

**Qué hace:**
- Identifica GiftCards duplicadas por:
  - `id_receipt`
  - `reference_id` + `reference_type`
- Mantiene la GiftCard más antigua
- Elimina las duplicadas más recientes

---

## 📝 Pasos para Solucionar

### Paso 1: Identificar duplicados actuales

```bash
cd BonitaBack
node scripts/clean-duplicate-giftcards.js
```

Esto mostrará un reporte como:

```
📊 REPORTE DE DUPLICADOS:

❌ Duplicados por id_receipt: 3
   Recibo 1234: 2 GiftCards
     ✅ MANTENER: ID 10, Saldo: $200000, Estado: activa
     🗑️  ELIMINAR: ID 15, Saldo: $200000, Estado: activa
```

### Paso 2: Limpiar duplicados (BACKUP PRIMERO)

⚠️ **ANTES de ejecutar, hacer backup de la base de datos:**

```bash
# Crear backup manual
pg_dump -h localhost -U tu_usuario -d bonita > backup-before-cleanup.sql
```

```bash
# Ejecutar limpieza
node scripts/clean-duplicate-giftcards.js --execute
```

### Paso 3: Aplicar migración

```bash
# Ejecutar migración para agregar índices únicos
node scripts/run-migrations.js
```

### Paso 4: Verificar en producción

```bash
# Reiniciar servidor
npm start

# Verificar logs
tail -f logs/app.log
```

---

## 🔍 Verificación Frontend

### Buscar en tu código React/Vue:

```javascript
// ❌ PROBLEMA: Botón sin protección
<button onClick={procesarDevolucion}>
  Procesar
</button>

// ✅ SOLUCIÓN: Botón con loading state
<button 
  onClick={procesarDevolucion} 
  disabled={loading}
>
  {loading ? 'Procesando...' : 'Procesar'}
</button>
```

### Revisar llamadas a la API:

```javascript
// ❌ PROBLEMA: useEffect sin dependencias correctas
useEffect(() => {
  if (shouldProcess) {
    createGiftCard(); // Se ejecuta múltiples veces
  }
}, []); // Dependencias incorrectas

// ✅ SOLUCIÓN: Control de ejecución
useEffect(() => {
  let executed = false;
  if (shouldProcess && !executed) {
    createGiftCard();
    executed = true;
  }
}, [shouldProcess]);
```

---

## 📊 Logs para Debugging

### Ver si hay duplicados en tiempo real:

```sql
-- Query para ver duplicados por recibo
SELECT 
  id_receipt, 
  COUNT(*) as cantidad,
  STRING_AGG(CAST(id_giftcard AS TEXT), ', ') as ids
FROM "GiftCards"
WHERE id_receipt IS NOT NULL
GROUP BY id_receipt
HAVING COUNT(*) > 1;

-- Query para ver duplicados por referencia
SELECT 
  reference_id,
  reference_type,
  COUNT(*) as cantidad,
  STRING_AGG(CAST(id_giftcard AS TEXT), ', ') as ids
FROM "GiftCards"
WHERE reference_id IS NOT NULL
GROUP BY reference_id, reference_type
HAVING COUNT(*) > 1;
```

### Ver últimas GiftCards creadas:

```sql
SELECT 
  id_giftcard,
  buyer_email,
  saldo,
  payment_method,
  reference_type,
  id_receipt,
  "createdAt"
FROM "GiftCards"
ORDER BY "createdAt" DESC
LIMIT 20;
```

---

## 🎯 Prevención Futura

### En Backend (YA IMPLEMENTADO):
- ✅ Validación de duplicados antes de crear
- ✅ Índices únicos en base de datos
- ✅ Logs detallados de creación

### En Frontend (PENDIENTE):
- [ ] Agregar estados de loading
- [ ] Deshabilitar botones durante proceso
- [ ] Debounce en funciones de submit
- [ ] Implementar idempotency keys

### Ejemplo de idempotency key:

```javascript
// Frontend
const idempotencyKey = `return-${receiptId}-${Date.now()}`;

fetch('/api/product/return', {
  method: 'POST',
  headers: {
    'Idempotency-Key': idempotencyKey
  },
  body: JSON.stringify(data)
});

// Backend (opcional)
// Guardar idempotencyKey y retornar misma respuesta si se repite
```

---

## 📞 Soporte

Si después de aplicar estas soluciones sigues viendo duplicados:

1. Revisar logs del servidor: `tail -f logs/app.log`
2. Activar logging de Sequelize: `logging: console.log`
3. Revisar Network tab en Chrome DevTools
4. Verificar que la migración se aplicó: 
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'GiftCards';
   ```

---

## ✅ Checklist de Implementación

- [x] Modificar `returnProducts.js` con validación
- [x] Modificar `createReceipt.js` con validación
- [x] Modificar `createGiftCard.js` con validación
- [x] Crear migración de índices únicos
- [x] Crear script de limpieza de duplicados
- [ ] Ejecutar script de limpieza (tú)
- [ ] Aplicar migración (tú)
- [ ] Verificar en producción (tú)
- [ ] Revisar código Frontend (tú)
- [ ] Agregar protección en Frontend (tú)

---

## 🔗 Archivos Modificados

1. `BonitaBack/src/controller/Products/returnProducts.js`
2. `BonitaBack/src/controller/Caja/createReceipt.js`
3. `BonitaBack/src/controller/Caja/createGiftCard.js`
4. `BonitaBack/migrations/008-add-unique-giftcard-reference.js` (NUEVO)
5. `BonitaBack/scripts/clean-duplicate-giftcards.js` (NUEVO)
