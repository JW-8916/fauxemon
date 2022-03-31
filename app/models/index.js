const dbConfig = require("../config/db.config.js");

const {Sequelize} = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    port: dbConfig.PORT,
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    //operatorsAliases: 0,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    logging:false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.abilities = require("./ability.model.js")(sequelize, Sequelize)
db.fakemons = require("./fakemon.model.js")(sequelize, Sequelize)
db.moves = require("./move.model.js")(sequelize, Sequelize)
db.possibleabilities = require("./possibleability.model.js")(sequelize, Sequelize)
db.possiblemoves = require("./possiblemove.model.js")(sequelize, Sequelize)
db.users = require("./user.model.js")(sequelize, Sequelize);


module.exports = db;