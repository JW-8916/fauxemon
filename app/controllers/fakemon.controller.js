const db = require("../models"); // models path depend on your structure
const Fakemon = db.fakemons;

exports.findAll = (req,res) =>{
    if(req.session.loggedin){
        Fakemon.findAll()
            .then( data =>{
                //console.log('data returned from findAll');
                res.send(data);
            })
            .catch(err =>{
                res.status(500).send({
                        message:
                            err.message || "Some error occurred retrieving Fakemons"
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
        Fakemon.findByPk(req.params.id)
            .then(data=>{
                console.log('data returned from find one fakemon: ', data.toJSON);
                res.send(data);
            })
            .catch(err =>{
                res.status(500).send({
                    message: 'Error retrieving customer with FakemonId:' +
                        req.params.id
                });
            });
    }
    else{
        res.status(400).send({message: "Please log in to see this resource"})
    }
}

exports.findAllTable = (req,res) =>{
    if(req.session.loggedin){
        Fakemon.findAll()
            .then( data =>{
                let content = []
                for(let i = 0; i< data.length; i++){
                    content.push(data[i]["dataValues"])
                }
                console.log('data returned from findAll');
                res.render("content", {head: "Fakemons", d: content});
            })
            .catch(err =>{
                res.status(500).send({
                        message:
                            err.message || "Some error occurred retrieving fakemon"
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
        Fakemon.findByPk(req.params.id)
            .then( data =>{
                let content = []
                content.push(data["dataValues"])
                res.render("content", {head: "Fakemon", d: content});
            })
            .catch(err =>{
                res.status(500).render("notfound");
            });
    }
    else{
        res.status(400).render("loginerror", {error:"You're not logged in! Log in to view this resource"})
    }
};