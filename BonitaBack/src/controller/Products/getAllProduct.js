const { Product, Image } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
  try {
    const { search, priceSell, colors, sizes, description, marca, sortPrice } = req.query;
    console.log('Recibido sortPrice:', sortPrice);

    let whereClause = {};
    const conditions = [];

    if (search) {
      if (!isNaN(search)) {
        // Si `search` es un número, busca en `priceSell`
        conditions.push({ priceSell: { [Op.eq]: parseFloat(search) } });
      } else {
        // Si `search` es texto, busca en `description` o `marca`
        conditions.push({
          [Op.or]: [
            { description: { [Op.iLike]: `%${search}%` } },
            { marca: { [Op.iLike]: `%${search}%` } },
            { colors: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }
    }

    if (priceSell) {
      conditions.push({ priceSell: { [Op.lte]: priceSell } });
    }

    if (colors) {
      conditions.push({ colors: { [Op.iLike]: `%${colors}%` } });
    }

    if (sizes) {
      conditions.push({ sizes: { [Op.iLike]: `%${sizes}%` } });
    }

    if (description) {
      conditions.push({ description: { [Op.iLike]: `%${description}%` } });
    }

    if (marca) {
      conditions.push({ marca: { [Op.iLike]: `%${marca}%` } });
    }

    if (conditions.length > 0) {
      whereClause[Op.and] = conditions;
    }

    let order = [];
if (sortPrice === 'asc') {
  order = [['priceSell', 'ASC']];
} else if (sortPrice === 'desc') {
  order = [['priceSell', 'DESC']];
}
console.log("Consulta con orden:", order);

    

    const products = await Product.findAll({
      where: whereClause,
      include: [{ model: Image }],
      order: order,  // Aplicar la ordenación
    });

    response(res, 200, {
      products: products,
    });
  } catch (error) {
    response(res, 500, { error: error.message });
  }
};


