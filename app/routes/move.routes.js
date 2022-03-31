const controller = require("../controllers/ability.controller");
module.exports = app => {
    const controller = require("../controllers/move.controller");
    let router = require('express').Router();
    router.get('/json/move',controller.findAll);
    router.get('/json/move/:id',controller.findOne);
    router.get('/move',controller.findAllTable);
    router.get('/move/:id',controller.findOneTable);

    app.use("/", router)
};