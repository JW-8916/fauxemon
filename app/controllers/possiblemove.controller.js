const db = require("../models"); // models path depend on your structure
const PossibleMove = db.possiblemoves;

exports.findAll = (req,res) =>{
    if(req.session.loggedin){
        PossibleMove.findAll()
            .then( data =>{
                console.log('data returned from findAll');
                res.send(data);
            })
            .catch(err =>{
                res.status(500).send({
                        message:
                            err.message || "Some error occurred retrieving PossibleMoves"
                    }
                );
            });
    }
    else{
        res.status(400).send({message: "Please log in to see this resource"})
    }

};

exports.findOne = (req,res) => {
    if(req.session.loggedin){
        PossibleMove.findAll({where:{fakemonName: req.params.fakemonname, moveName: req.params.movename}})
            .then(data=>{
                console.log('data returned from find one PossibleMove: ', data.toJSON);
                res.send(data);
            })
            .catch(err =>{
                res.status(500).send({
                    message: 'Error retrieving customer with PossibleMove:' +
                        req.params.fakemonname +""+ req.params.movename
                });
            });
    }
    else{
        res.status(400).send({message: "Please log in to see this resource"})
    }
}

exports.findByName = (req, res) => {
    if (req.session.loggedin) {
        PossibleMove.findAll({where: {fakemonName: req.params.fakemonname}})
            .then(data => {
                //console.log('data returned from find one PossibleMove: ', data.toJSON);
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message: 'Error retrieving customer with PossibleAbility:' +
                        req.params.fakemonname
                });
            });
    } else {
        res.status(400).send({message: "Please log in to see this resource"})
    }
}

exports.findAllTable = (req,res) =>{
    if(req.session.loggedin){
        PossibleMove.findAll()
            .then( data =>{
                let content = []
                for(let i = 0; i< data.length; i++){
                    content.push(data[i]["dataValues"])
                }
                console.log('data returned from findAll');
                res.render("content", {head: "Possible Moves", d: content});
            })
            .catch(err =>{
                res.status(500).send({
                        message:
                            err.message || "Some error occurred retrieving Possible Moves"
                    }
                );
            });
    }
    else{
        res.status(400).send({message: "Please log in to see this resource"})
    }
};

exports.findOneTable = (req,res) =>{
    if(req.session.loggedin){
        PossibleMove.findByPk(req.params.id)
            .then( data =>{
                let content = []
                content.push(data["dataValues"])
                res.render("content", {head: "Possible Moves", d: content});
            })
            .catch(err =>{
                res.status(500).render("notfound");
            });
    }
    else{
        res.status(400).render("loginerror", {error:"You're not logged in! Log in to view this resource"})
    }
};