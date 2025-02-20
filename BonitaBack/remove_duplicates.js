const fs = require('fs');

// Lee el archivo JSON
let jsonData = JSON.parse(fs.readFileSync('inventario_modificado.json', 'utf8'));

// Crear un objeto para rastrear los id_product ya vistos
const seen = new Set();

// Filtrar el array manteniendo solo la primera ocurrencia de cada id_product
const uniqueData = jsonData.filter(item => {
    // Si el item no tiene id_product o está vacío, lo mantenemos
    if (!item.id_product) return true;
    
    // Si no hemos visto este id_product antes, lo guardamos y mantenemos el item
    if (!seen.has(item.id_product)) {
        seen.add(item.id_product);
        return true;
    }
    
    // Si ya hemos visto este id_product, lo filtramos
    return false;
});

// Guarda el JSON sin duplicados
fs.writeFileSync('inventario_sin_duplicados.json', JSON.stringify(uniqueData, null, 2));
console.log('Archivo JSON sin duplicados creado correctamente');