const { SellerData } = require('../../data');

// Crear los datos del comercio
const createSellerData = async (req, res) => {
  try {
    const newSeller = await SellerData.create(req.body); // Crear el registro con req.body
    res.status(201).json({ message: 'Datos del comercio creados exitosamente', data: newSeller });
  } catch (error) {
    console.error('Error al crear los datos del comercio:', error);
    res.status(500).json({ message: 'Error al crear los datos del comercio', error: error.message });
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


const getSellerData = async (req, res) => {
  try {
    const sellerData = await SellerData.findOne(); // Obtener el primer registro en la tabla (o modificar según tus necesidades)

    if (!sellerData) {
      return res.status(404).json({ message: 'Datos del comercio no encontrados' });
    }
    
    res.status(200).json({ message: 'Datos del comercio obtenidos exitosamente', data: sellerData });
  } catch (error) {
    console.error('Error al obtener los datos del comercio:', error);
    res.status(500).json({ message: 'Error al obtener los datos del comercio', error: error.message });
  }
};

module.exports = {
  createSellerData,
  updateSellerData,
  getSellerData
};
