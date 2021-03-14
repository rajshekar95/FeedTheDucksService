const Sequelize = require('sequelize')
const db = {}
const config = require('./config.json');

const sequelize = new Sequelize(config.db, config.username, config.password, {
  host: config.host,
  dialect: 'mysql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
