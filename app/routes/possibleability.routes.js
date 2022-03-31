const controller = require("../controllers/ability.controller");
module.exports = app => {
    const controller = require("../controllers/possibleability.controller");
    let router = require('express').Router();
    router.get('/json/possibleability',controller.findAll);
    router.get('/json/possibleability/:fakemonname/:abilityname',controller.findOne);
    router.get('/json/possibleability/:fakemonname',controller.findByName);
    router.get('/possibleability',controller.findAllTable);
    router.get('/possibleability/:fakemonname/:abilityname',controller.findOneTable);

    app.use("/", router)
};