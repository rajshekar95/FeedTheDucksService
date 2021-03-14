const Sequelize = require('sequelize')
const db = require('../database/db.js')

module.exports = db.sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    personFullName: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    lastUpdatedOn: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    role: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false
  }
)
