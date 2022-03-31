module.exports = (sequelize,Sequelize)=>{
    const Move = sequelize.define('move', {
        moveId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        moveName: {
            type: Sequelize.STRING,
        },
        moveType: {
            type: Sequelize.STRING,
        },
        moveKind: {
            type: Sequelize.STRING,
        },
        movePower: {
            type: Sequelize.INTEGER,
        },
        moveAccuracy: {
            type: Sequelize.INTEGER,
        },
        movePp: {
            type: Sequelize.INTEGER,
        },
        moveDescription: {
            type: Sequelize.STRING,
        }
    },{
        timestamps: false,
    });
    return Move;
}