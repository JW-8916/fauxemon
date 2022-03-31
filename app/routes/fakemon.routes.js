const controller = require("../controllers/ability.controller");
module.exports = app => {
    const controller = require("../controllers/fakemon.controller");
    let router = require('express').Router();
    router.get('/json/fakemon',controller.findAll);
    router.get('/json/fakemon/:id',controller.findOne);
    router.get('/fakemon',controller.findAllTable);
    router.get('/fakemon/:id',controller.findOneTable);

    app.use("/", router)
};