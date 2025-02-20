const fs = require('fs');

// Lee el archivo JSON
let jsonData = JSON.parse(fs.readFileSync('inventario.json', 'utf8'));

// Modifica cada elemento del array
jsonData = jsonData.map(item => {
    // Extrae B seguido de números al final del codigoBarra
    const idMatch = item.codigoBarra.match(/B\d+$/);
    if (idMatch) {
        item.id_product = idMatch[0];
    }

    // Extrae la primera letra después de los números iniciales
    const sizeMatch = item.codigoBarra.match(/^\d+([A-Z])/);
    if (sizeMatch) {
        item.sizes = sizeMatch[1];
    }

    // Extrae las letras entre la talla y la B
    const colorMatch = item.codigoBarra.match(/[A-Z]([A-Z]+)B\d+$/);
    if (colorMatch) {
        item.colors = colorMatch[1];
    }

    return item;
});

// Guarda el JSON modificado
fs.writeFileSync('inventario_modificado.json', JSON.stringify(jsonData, null, 2));
console.log('Archivo JSON modificado correctamente');