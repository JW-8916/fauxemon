const controller = require("../controllers/ability.controller");
module.exports = app => {
    const controller = require("../controllers/ability.controller");
    let router = require('express').Router();
    router.get('/json/ability',controller.findAll);
    router.get('/json/ability/:id',controller.findOne);
    router.get('/ability',controller.findAllTable);
    router.get('/ability/:id',controller.findOneTable);

    app.use("/", router)
};