const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('SellerData', {
   
    wlegalorganizationtype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sfiscalresponsibilities: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sdocno: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sdoctype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ssellername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ssellerbrand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scontactperson: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    saddresszip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wdepartmentcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wtowncode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scityname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Campos de jcontact con prefijo
    contact_selectronicmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Campos de jregistrationaddress con prefijo
    registration_wdepartmentcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_scityname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_saddressline1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_scountrycode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_wprovincecode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_szip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_sdepartmentname: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
};
