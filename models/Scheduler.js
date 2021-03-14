const Sequelize = require('sequelize')
const db = require('../database/db.js')

module.exports = db.sequelize.define(
  'scheduler',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    location: {
      type: Sequelize.STRING
    },
    foodTypeId: {
      type: Sequelize.INTEGER
    },
    quantity: {
      type: Sequelize.INTEGER
    },
    time: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    totalNoOfDucks: {
      type: Sequelize.INTEGER
    },
    userId: {
       type: Sequelize.INTEGER
    }
  },
  {
    timestamps: false
  }


)
