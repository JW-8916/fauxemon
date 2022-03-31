module.exports = (sequelize, Sequelize)=>{
const User = sequelize.define('user',{
    userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: Sequelize.STRING,
    },
    userPassword: {
        type: Sequelize.STRING,
    },
    userWins: {
        type: Sequelize.STRING,
    },
    userLosses: {
        type: Sequelize.STRING,
    },
    userRegistered: {
        type: Sequelize.STRING,
    }
    },{
    timestamps: false,
    })
    return User
}