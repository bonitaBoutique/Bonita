const { SellerData } = require('../../data');

// Crear los datos del comercio
const getOrCreateSellerData = async (req, res) => {
  try {
    const { sdocno } = req.body; // Asumimos que el DNI viene en el body

    // Buscar por el DNI en la base de datos
    let sellerData = await SellerData.findOne({ where: { sdocno } });

    if (!sellerData) {
      // Si no se encuentra, crear un nuevo registro con los datos del body
      sellerData = await SellerData.create(req.body);
      return res.status(201).json({ 
        message: 'Datos del comercio creados exitosamente', 
        data: sellerData 
      });
    }

    // Si se encuentra, devolver los datos encontrados
    res.status(200).json({ 
      message: 'Datos del comercio encontrados exitosamente', 
      data: sellerData 
    });

  } catch (error) {
    console.error('Error al obtener o crear los datos del comercio:', error);
    res.status(500).json({ 
      message: 'Error al obtener o crear los datos del comercio', 
      error: error.message 
    });
  }
};

const updateSellerData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID recibido para actualizar:", id);
    console.log("Datos recibidos para actualizar:", req.body);

    const updatedData = await SellerData.update(req.body, {
      where: { id },
      returning: true,
    });

    if (updatedData[0] === 0) {
      return res.status(404).json({ message: 'Datos no encontrados' });
    }
    res.status(200).json({ message: 'Datos del comercio actualizados exitosamente', data: updatedData[1][0] });
  } catch (error) {
    console.error('Error al actualizar los datos del comercio:', error);
    res.status(500).json({ message: 'Error al actualizar los datos del comercio', error: error.message });
  }
};




module.exports = {
  getOrCreateSellerData,
  updateSellerData,
  
};
