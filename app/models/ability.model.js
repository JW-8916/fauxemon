module.exports = (sequelize,Sequelize)=>{
    const Ability = sequelize.define('ability', {
        abilityId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        abilityName: {
            type: Sequelize.STRING,
        },
        abilityEffect: {
            type: Sequelize.STRING,
        }
    },{
        timestamps: false,
        tableName:"abilities"
    });
    return Ability;
}