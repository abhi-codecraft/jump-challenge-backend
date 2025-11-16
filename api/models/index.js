const sequelize = require('../config/database');

// const Users = require('./Users');

// Define associations after all models are loaded

// EquipmentCategory.hasMany(Equipments, { as: 'equipments', foreignKey: 'category_id' });
// Equipments.belongsTo(EquipmentCategory, { foreignKey: 'category_id', as: 'category' });


module.exports = {
  // Users,
  sequelize
};
