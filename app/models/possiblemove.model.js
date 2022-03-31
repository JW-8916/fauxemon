module.exports = (sequelize,Sequelize)=>{
    const PossibleMove = sequelize.define('possiblemove', {
        fakemonName: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        moveName: {
            type: Sequelize.STRING,
            primaryKey: true
        }
    },{
        timestamps: false,
        tableName:"possiblemoves"
    });
    return PossibleMove;
}