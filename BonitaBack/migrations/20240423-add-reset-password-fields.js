module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Users', 'passwordResetToken', {
        type: Sequelize.STRING,
        allowNull: true,
      });
      await queryInterface.addColumn('Users', 'passwordResetExpires', {
        type: Sequelize.BIGINT,
        allowNull: true,
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Users', 'passwordResetToken');
      await queryInterface.removeColumn('Users', 'passwordResetExpires');
    }
  };