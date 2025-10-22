# Migración 007: Agregar Métodos de Pago al Enum

## 📋 Descripción
Esta migración agrega nuevos métodos de pago al enum `enum_Receipts_payMethod`:
- **Tarjeta de Crédito**
- **Tarjeta de Débito**
- **Transferencia**
- **Daviplata**

## 🚀 Ejecución en Desarrollo

### Opción 1: Usando psql (Recomendado)
```bash
# Conectarse a la base de datos
psql -U postgres -d bonita

# Ejecutar el archivo de migración
\i C:/Users/merce/Desktop/desarrollo/Bonita/BonitaBack/migrations/007-add-payment-methods-to-enum.sql

# Salir de psql
\q
```

### Opción 2: Desde línea de comandos
```bash
psql -U postgres -d bonita -f C:/Users/merce/Desktop/desarrollo/Bonita/BonitaBack/migrations/007-add-payment-methods-to-enum.sql
```

### Opción 3: Usando pgAdmin
1. Abre pgAdmin
2. Conéctate a tu servidor PostgreSQL
3. Selecciona la base de datos `bonita`
4. Abre Query Tool (Tools > Query Tool)
5. Copia y pega el contenido de `007-add-payment-methods-to-enum.sql`
6. Ejecuta la consulta (F5 o botón Execute)

## 🌐 Ejecución en Producción (Azure)

### Opción 1: Azure Cloud Shell con psql
```bash
# Conectarse a Azure Database for PostgreSQL
psql "host=tu-servidor.postgres.database.azure.com port=5432 dbname=bonita user=tu-usuario@tu-servidor sslmode=require"

# Ejecutar el archivo
\i /ruta/al/archivo/007-add-payment-methods-to-enum.sql
```

### Opción 2: Azure Portal Query Editor
1. Ve al Azure Portal
2. Navega a tu Azure Database for PostgreSQL
3. Abre el Query Editor
4. Copia y pega el contenido del archivo SQL
5. Ejecuta la consulta

### Opción 3: Desde tu máquina local conectándote a Azure
```bash
# Asegúrate de tener psql instalado
# Descarga el certificado SSL de Azure si es necesario

psql "host=tu-servidor.postgres.database.azure.com port=5432 dbname=bonita user=tu-usuario@tu-servidor sslmode=require" -f 007-add-payment-methods-to-enum.sql
```

## ✅ Verificación

Después de ejecutar la migración, verifica que los nuevos valores se agregaron correctamente:

```sql
-- Ver todos los valores del enum
SELECT enumlabel as metodo_pago 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'enum_Receipts_payMethod'
)
ORDER BY enumlabel;
```

Deberías ver una lista que incluya:
- Addi
- Bancolombia
- Crédito
- **Daviplata** ⬅️ NUEVO
- Efectivo
- GiftCard
- Nequi
- Otro
- Sistecredito
- Tarjeta
- **Tarjeta de Crédito** ⬅️ NUEVO
- **Tarjeta de Débito** ⬅️ NUEVO
- **Transferencia** ⬅️ NUEVO

## ⚠️ Notas Importantes

1. **No se pueden eliminar valores de un enum** en PostgreSQL sin recrear el tipo completo
2. **Esta migración es idempotente**: Puedes ejecutarla múltiples veces sin problemas
3. **No requiere downtime**: Los valores existentes siguen funcionando
4. **Compatibilidad hacia atrás**: Los valores antiguos como "Tarjeta" siguen siendo válidos

## 🔄 Rollback

Si necesitas revertir esta migración (muy difícil con enums de PostgreSQL), tendrías que:
1. Verificar que NO hay registros usando los nuevos valores
2. Recrear el tipo enum sin los nuevos valores (DESTRUCTIVO)

**Recomendación:** NO hacer rollback. Los valores adicionales no causan problemas.

## 📝 Cambios Relacionados

Esta migración está sincronizada con:
- **Backend:** `BonitaBack/src/data/models/Receipt.js`
- **Frontend:** 
  - `BonitaFront/src/Components/Recibo.jsx`
  - `BonitaFront/src/Components/stock/ReturnManagment.jsx`

## 🐛 Troubleshooting

### Error: "type already exists"
- **Causa:** El enum ya fue modificado previamente
- **Solución:** No es un error, la migración es idempotente

### Error: "permission denied"
- **Causa:** Usuario sin permisos para modificar tipos
- **Solución:** Ejecutar como superusuario (postgres) o con permisos adecuados

### Error: "cannot alter type because it is in use"
- **Causa:** Tabla bloqueada por transacción activa
- **Solución:** Esperar a que terminen las transacciones activas o reiniciar el servidor de base de datos
