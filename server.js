/*
* This is the Fauxemon server node file, this handles practically everything
*
* This project is done by Jason Wagner and is open source
* */

/*
* MODULE DEFINITIONS
* */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const bcrypt = require("bcryptjs");
const oneDay = 1000*60*60*24;
const {check, validationResult} = require("express-validator");
const cron = require("node-cron");
const Game = require("./Game");

/*
* MODULE AND SERVER OPTIONS
* */
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var corsOptions = {
    origin: "true",
    methods: ["GET", "POST"],
    allowedHeaders:["Content-Type"]
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'app')));

app.set("view engine", "ejs");
app.set("views", __dirname+"/app/views")


let loginValidate = [
    check("username", "Username or password is incorrect").trim().escape(),
    check("password", "Username or password is incorrect").trim().escape()
]

let registerValidate = [
    check("username","username is incorrect").trim().escape(),
    check("password", "password is invalid").trim().escape(),
    check("confirmPassword", "password is invalid").trim().escape()
]


/*
* DATABASE SETUP
* */

const db = require("./app/models");
const {response} = require("express");

db.sequelize.authenticate().then(function(){
    console.log('Connection has been established successfully.');
    db.sequelize.sync();
}).catch(function(err){
    console.error('Unable to connect to the database:', err);
});

//important for login later on
const User = db.users;

/*
* SESSIONS SETUP
* */

app.use(sessions({
    secret: 'dennis is cool and some other random text',
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}));
app.use(cookieParser());

/*
* ROUTE DEFINITIONS
* */

//Root

app.get("/",(req,res)=>{
    if(req.session.loggedin){
        res.render("home",{username: req.session.username});
    }
    else{
        res.redirect("/login");
    }
})

//logins

app.get("/login", (req, res)=>{
    res.render("login")
})

//the most important route
app.post("/login", loginValidate,(req, res)=>{
    User.findAll({where:{userName: req.body.username}})
        .then(data=>{
            //there should only be a single response
            if(data.length != 0){
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(req.body.password, salt, function(err, hash) {
                        bcrypt.compare(req.body.password, data[0].dataValues.userPassword).then((result)=>{
                            if(result){
                                //success login
                                req.session.loggedin = true;
                                req.session.username = req.body.username;
                                res.redirect("/");
                            }
                            else{
                                //failed login
                                res.render("loginerror", {error: "incorrect username or password, please try again"});
                            }
                        })
                    });
                });
            }
            //if there is more than one response, or in reality, no responses, means bad username
            else{
                res.render("loginerror", {error: "incorrect username or password, please try again"});
            }
        }).catch(err=>{
        res.send({message: "Something went wrong getting login information"})
    })
})

//register

app.get("/register", (req, res)=>{
    if(req.session.loggedin){
        res.redirect("/")
    }
    else{
        res.render("register", {error: ""});
    }
})

app.post("/register",registerValidate, (req, res)=>{
    if(req.session.loggedin){
        res.redirect("/")
    }
    else{
        //check if the user is already taken
        User.findAll({where:{userName: req.body.username}})
            .then(data=>{
                //if the username isnt already taken
                if(data.length == 0){
                    //do the passwords match?
                    if(req.body.password == req.body.confirmPass){
                        //this should push the username and the password to the database then log them in
                        //hash the password first
                        bcrypt.genSalt(10, function (err, salt){
                            bcrypt.hash(req.body.password, salt, function(err, hash){
                                //insert
                                User.create({userName: req.body.username, userPassword: hash});
                                //now log them in
                                req.session.loggedin = true;
                                req.session.username = req.body.username;
                                res.redirect("/");
                            })
                        })
                    }
                    //the passwords dont match
                    else{
                        res.render("register",{error:"The passwords don't match! Try again"})
                    }
                }
                //if the username IS taken
                else{
                    res.render("register",{error:"That username is taken! Try another one"})
                }
            })
    }
})

//logout

app.get("/logout", (req, res)=>{
    req.session.destroy();
    res.redirect('/');
})

//teambuilder

app.get("/teambuilder", (req,res)=>{
    if(req.session.loggedin){
        res.render("teambuilder")
    }
    else{
        res.redirect("/")
    }
})

app.get("/ladder", (req, res)=>{
    if(req.session.loggedin){
        res.render("ladder")
    }
    else{
        res.redirect("/")
    }
})

app.get("/battle", (req, res)=>{
    if(req.session.loggedin){
        res.render("battle")
    }
    else{
        res.redirect("/")
    }
})

/*
* EXTERNAL ROUTE DEFINITIONS
* */

require("./app/routes/ability.routes")(app)
require("./app/routes/fakemon.routes")(app)
require("./app/routes/move.routes")(app)
require("./app/routes/possibleability.routes")(app)
require("./app/routes/possiblemove.routes")(app)
require("./app/routes/user.routes")(app)

/*
* SOCKET DEFINITIONS
* */

//this is defined here for the queue of players waiting to play the game
//this is a list of SOCKET OBJECTS
let queue = []
let currentRoom = 1000;

cron.schedule('*/3 * * * * *', ()=>{
    let d = new Date();
    console.log(queue.length + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds())
})

io.on("connection", function(socket){
    console.log("connected " + socket.id)

    //Server gets username, assign the username to the socket
    socket.on("username", (username)=>{
        socket.username = username;
        console.log(socket.username);
    })

    //Client disconnected, just for logging purposes
    socket.on("disconnect", (reason)=>{
        console.log(socket.username + " disconnected: " + reason)
        let i = queue.indexOf(socket)
        if(i != -1) {
            queue.splice(i, 1);
        }
    })

    //Someone sends a message, the server formats the message and sends it to all users
    socket.on("chat_message", (message)=>{
        let today = new Date();
        let time;
        if(today.getMinutes() < 10){
            time = today.getHours() + ":0" + today.getMinutes();
        }
        else{
            time = today.getHours() + ":" + today.getMinutes();
        }
        io.emit("chat_message", (`${time}-<strong>${socket.username}:</strong>${message}`))
    })

    //this is for when the client clicks the "play with this team" button. the team json object is also passed in
    socket.on("play", (currentTeam)=>{
        socket.currentTeam = currentTeam;
        queue.push(socket)
        if(queue.length >= 2){
            currentRoom+=1;
            Game.battle(queue.shift(), queue.shift(), io, currentRoom-1)
        }
    })

    socket.on("cancel", ()=>{
        let i = queue.indexOf(socket)
        queue.splice(i, 1);
    })
})

/*
* SERVER EXECUTION
* */

const PORT = process.env.PORT || 8080;
http.listen(PORT,'0.0.0.0',function(){
    console.log(`app listening on ${PORT}`);
});