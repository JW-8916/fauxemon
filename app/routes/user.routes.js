module.exports = app => {
    const controller = require("../controllers/user.controller");
    let router = require('express').Router();
    router.get('/json/user',controller.findAll);
    //router.get('/json/user/:id',controller.findOne);

    app.use("/", router)
};