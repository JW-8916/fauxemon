module.exports = (sequelize,Sequelize)=>{
    const PossibleAbility = sequelize.define('possibleability', {
        fakemonName: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        abilityName: {
            type: Sequelize.STRING,
            primaryKey: true
        }
    },{
        timestamps: false,
        tableName:"possibleabilities"
    });
    return PossibleAbility;
}