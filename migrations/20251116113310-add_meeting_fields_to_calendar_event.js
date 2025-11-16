'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("calendar_events", "meeting_link", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("calendar_events", "meeting_platform", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("calendar_events", "meeting_link");
    await queryInterface.removeColumn("calendar_events", "meeting_platform");
  },
};
