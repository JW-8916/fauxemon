module.exports = (sequelize,Sequelize)=>{
    const Fakemon = sequelize.define('fakemon', {
        fakemonId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fakemonName: {
            type: Sequelize.STRING,
        },
        fakemonHp: {
            type: Sequelize.INTEGER,
        },
        fakemonAttack: {
            type: Sequelize.INTEGER,
        },
        fakemonDefense: {
            type: Sequelize.INTEGER,
        },
        fakemonSpAttack: {
            type: Sequelize.INTEGER,
        },
        fakemonSpDefense: {
            type: Sequelize.INTEGER,
        },
        fakemonSpeed: {
            type: Sequelize.INTEGER,
        },
        fakemonTypePrimary: {
            type: Sequelize.STRING,
        },
        fakemonTypeSecondary: {
            type: Sequelize.STRING,
        }
    },{
        timestamps: false,
    });
    return Fakemon;
}