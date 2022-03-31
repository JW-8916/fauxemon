const controller = require("../controllers/ability.controller");
module.exports = app => {
    const controller = require("../controllers/possiblemove.controller");
    let router = require('express').Router();
    router.get('/json/possiblemove',controller.findAll);
    router.get('/json/possiblemove/:fakemonname/:movename',controller.findOne);
    router.get('/json/possiblemove/:fakemonname',controller.findByName);
    router.get('/possiblemove',controller.findAllTable);
    router.get('/possiblemove/:fakemonname/:movename',controller.findOneTable);

    app.use("/", router)
};