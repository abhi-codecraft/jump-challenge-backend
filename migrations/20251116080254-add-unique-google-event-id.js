'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("calendar_events", {
      fields: ["google_event_id"],
      type: "unique",
      name: "unique_google_event_id"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "CalendarEvents",
      "unique_google_event_id"
    );
  }
};
