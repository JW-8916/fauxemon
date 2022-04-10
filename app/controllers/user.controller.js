const db = require("../models"); // models path depend on your structure
const User = db.users;

exports.findAll = (req,res) =>{
    if(req.session.loggedin){
        User.findAll()
            .then( data =>{
                console.log(data);
                for(let i = 0; i < data.length; i++){
                    delete data[i]["dataValues"]["userPassword"]
                }
                res.send(data);
            })
            .catch(err =>{
                res.status(500).send({
                        message:
                            err.message || "Some error occurred retrieving Users"
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
        User.findByPk(req.params.id)
            .then(data=>{
                console.log('data returned from find one User: ', data.toJSON);
                res.send(data);
            })
            .catch(err =>{
                res.status(500).send({
                    message: 'Error retrieving customer with UserId:' +
                        req.params.id
                });
            });
    }
    else{
        res.status(400).send({message: "Please log in to see this resource"})
    }

}