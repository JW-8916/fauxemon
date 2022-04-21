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

//useful for the game
const Fakemon = db.fakemons;
const Move = db.moves;

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

let effectivenessTable;
initEffectivenessTable();

let eventQueue = []

let infoTrade = []

io.on("connection", function(socket) {
    //console.log("connected " + socket.id)

    //Server gets username, assign the username to the socket
    socket.on("username", (username) => {
        socket.username = username.slice(0, username.length - 1);
        //console.log(socket.username);
    })

    //Client disconnected, just for logging purposes
    socket.on("disconnect", (reason) => {
        console.log(socket.username + " disconnected: " + reason)
        if(socket.isInGame){

        }
        let i = queue.indexOf(socket)
        if (i != -1) {
            queue.splice(i, 1);
        }
    })

    //Someone sends a message, the server formats the message and sends it to all users
    socket.on("chat_message", (message) => {
        let today = new Date();
        let time;
        if (today.getMinutes() < 10) {
            time = today.getHours() + ":0" + today.getMinutes();
        } else {
            time = today.getHours() + ":" + today.getMinutes();
        }
        io.emit("chat_message", (`${time}-<strong>${socket.username}:</strong>${message}`))
    })

    //this is for when the client clicks the "play with this team" button. the team json object is also passed in
    socket.on("play", (currentTeam) => {
        socket.currentTeam = currentTeam;
        queue.push(socket)
        if (queue.length >= 2) {
            currentRoom += 1;
            queue.shift().join("battle" + currentRoom - 1)
            queue.shift().join("battle" + currentRoom - 1)
            io.in("battle" + currentRoom - 1).emit("redirect", (currentRoom - 1))
        }
    })

    socket.on("cancel", () => {
        let i = queue.indexOf(socket)
        queue.splice(i, 1);
    })

    socket.on("rejoin", (content)=>{
        socket.room = "battle"+content.room;
        socket.username = content.username.slice(0, content.username.length - 1);
        socket.team = content.team;
        User.findAll({where: {userName: socket.username}}).then(data => {
            socket.wins = data[0].dataValues.userWins;
            socket.losses = data[0].dataValues.userLosses;
        })
        socket.join(socket.room);
        setTimeout(()=>{
            Fakemon.findAll({where: {fakemonName: socket.team.p1.name}}).then(data=>{
                socket.calcedMon = [
                    calcHPStat(data[0].dataValues.fakemonHp, socket.team.p1.evs[0]),
                    calcHPStat(data[0].dataValues.fakemonHp, socket.team.p1.evs[0]),
                    calcGenericStat(data[0].dataValues.fakemonAttack, socket.team.p1.evs[1]),
                    calcGenericStat(data[0].dataValues.fakemonDefense, socket.team.p1.evs[2]),
                    calcGenericStat(data[0].dataValues.fakemonSpAttack, socket.team.p1.evs[3]),
                    calcGenericStat(data[0].dataValues.fakemonSpDefense, socket.team.p1.evs[4]),
                    calcGenericStat(data[0].dataValues.fakemonSpeed, socket.team.p1.evs[5]),
                ]
                console.log("calced mon: "+socket.calcedMon)

                io.to(socket.id).emit("calcedStats", (socket.calcedMon))
                io.to(socket.id).emit("updateLog", (socket.username + " sent out " + socket.team.p1.name + "!"))
                socket.to(socket.room).emit("enemyCalcedStats", {stats: socket.calcedMon, name: socket.team.p1.name})
                socket.to(socket.room).emit("updateLog", (socket.username + " sent out " + socket.team.p1.name + "!"));
            })
        }, 200)
    })

    socket.on("attack", (move)=>{
        let evt = {moveName: move, monName: socket.team.p1.name, id: socket.id, name: socket.username, stats: socket.calcedMon, wins: socket.wins, losses: socket.losses}
        eventQueue.push(evt);

        if(eventQueue.length == 2){
            let p1Decision = eventQueue.shift();
            let p2Decision = eventQueue.shift();

            //if p1 is faster
            if(p1Decision.stats[6] > p2Decision.stats[6]){
                //first find the move
                Move.findAll({where: {moveName: p1Decision.moveName}}).then( data => {
                    io.in(socket.room).emit("updateLog", (p1Decision.name + "'s " + p1Decision.monName + " used " + p1Decision.moveName + "!"));
                    calcDamage(p1Decision.monName, p1Decision.stats, p2Decision.monName, p2Decision.stats, data[0].dataValues, socket).then(damage=>{
                        p2Decision.stats[0] = p2Decision.stats[0] - damage;

                        //if p2 dies
                        if (p2Decision.stats[0] <= 0) {
                            p2Decision.stats[0] = 0;
                            io.in(socket.room).emit("updateLog", (p2Decision.name + "'s " + p2Decision.monName + " fainted!"));
                            io.to(p2Decision.id).emit("calcedStats", p2Decision.stats);
                            io.to(p1Decision.id).emit("enemyCalcedStats", {name: p2Decision.monName, stats: p2Decision.stats})
                            io.to(p1Decision.id).emit("calcedStats", p1Decision.stats);
                            io.to(p2Decision.id).emit("enemyCalcedStats", {name: p1Decision.monName, stats: p1Decision.stats})
                            updateUserStats(p1Decision.name, "win", p1Decision.wins)
                            updateUserStats(p2Decision.name, "lose", p2Decision.losses)
                            io.to(socket.room).emit("gameOver", (p1Decision.name))
                        }
                        //else, p2 lives
                        else {
                            Move.findAll({where: {moveName: p2Decision.moveName}}).then(data2 => {
                                io.in(socket.room).emit("updateLog", (p2Decision.name + "'s " + p2Decision.monName + " used " + p2Decision.moveName + "!"));
                                calcDamage(p2Decision.monName, p2Decision.stats, p1Decision.monName, p1Decision.stats, data2[0].dataValues, socket).then(damage=>{
                                    p1Decision.stats[0] = p1Decision.stats[0] - damage;

                                    //if p1 dies
                                    if (p1Decision.stats[0] <= 0) {
                                        p1Decision.stats[0] = 0;
                                        io.in(socket.room).emit("updateLog", (p1Decision.name + "'s " + p1Decision.monName + " fainted!"));
                                        io.to(p2Decision.id).emit("calcedStats", p2Decision.stats);
                                        io.to(p1Decision.id).emit("enemyCalcedStats", {name: p2Decision.monName, stats: p2Decision.stats})
                                        io.to(p1Decision.id).emit("calcedStats", p1Decision.stats);
                                        io.to(p2Decision.id).emit("enemyCalcedStats", {name: p1Decision.monName, stats: p1Decision.stats})
                                        updateUserStats(p1Decision.name, "lose", p1Decision.losses)
                                        updateUserStats(p2Decision.name, "win", p2Decision.wins)
                                        io.to(socket.room).emit("gameOver", (p1Decision.name))
                                    }
                                    //if p1 lives
                                    else {
                                        io.to(p1Decision.id).emit("calcedStats", p1Decision.stats);
                                        io.to(p2Decision.id).emit("enemyCalcedStats", {name: p1Decision.monName, stats: p2Decision.stats})
                                        io.to(socket.room).emit("endTurn");
                                    }
                                })
                            })
                        }
                    })
                })
            }
            //p2 is faster
            else{
                //first find the move
                Move.findAll({where: {moveName: p2Decision.moveName}}).then(data=>{
                    io.in(socket.room).emit("updateLog", (p2Decision.name + "'s " + p2Decision.monName + " used " + p2Decision.moveName + "!"));
                    calcDamage(p2Decision.monName, p2Decision.stats, p1Decision.monName, p1Decision.stats, data[0].dataValues, socket).then(damage=>{
                        p1Decision.stats[0] = p1Decision.stats[0] - damage;

                        //if p1 dies
                        if(p1Decision.stats[0] <= 0){
                            p1Decision.stats[0] = 0;
                            io.in(socket.room).emit("updateLog", (p1Decision.name + "'s " + p1Decision.monName + " fainted!"));
                            io.to(p2Decision.id).emit("calcedStats", p2Decision.stats);
                            io.to(p1Decision.id).emit("enemyCalcedStats", {name: p2Decision.monName, stats: p2Decision.stats})
                            io.to(p1Decision.id).emit("calcedStats", p1Decision.stats);
                            io.to(p2Decision.id).emit("enemyCalcedStats", {name: p1Decision.monName, stats: p1Decision.stats})
                            updateUserStats(p1Decision.name, "lose", p1Decision.losses)
                            updateUserStats(p2Decision.name, "win", p2Decision.wins)
                            io.to(socket.room).emit("gameOver", (p2Decision.name))
                        }
                        //else, p1 lives
                        else{
                            Move.findAll({where: {moveName: p1Decision.moveName}}).then(data2=>{
                                io.in(socket.room).emit("updateLog", (p1Decision.name + "'s " + p1Decision.monName + " used " + p1Decision.moveName + "!"));
                                calcDamage(p1Decision.monName, p1Decision.stats, p2Decision.monName, p2Decision.stats, data2[0].dataValues, socket).then(damage=>{
                                    p2Decision.stats[0] = p2Decision.stats[0] - damage;

                                    //if p2 dies
                                    if(p2Decision.stats[0] <= 0){
                                        p2Decision.stats[0] = 0;
                                        io.in(socket.room).emit("updateLog", (p2Decision.name + "'s " + p2Decision.monName + " fainted!"));
                                        io.to(p2Decision.id).emit("calcedStats", p2Decision.stats);
                                        io.to(p1Decision.id).emit("enemyCalcedStats", {name: p2Decision.monName, stats: p2Decision.stats})
                                        io.to(p1Decision.id).emit("calcedStats", p1Decision.stats);
                                        io.to(p2Decision.id).emit("enemyCalcedStats", {name: p1Decision.monName, stats: p1Decision.stats})
                                        updateUserStats(p1Decision.name, "win", p1Decision.wins)
                                        updateUserStats(p2Decision.name, "lose", p2Decision.losses)
                                        io.to(socket.room).emit("gameOver", (p1Decision.name))
                                    }
                                    //if p2 lives
                                    else{
                                        io.to(p2Decision.id).emit("calcedStats", p2Decision.stats);
                                        io.to(p1Decision.id).emit("enemyCalcedStats", {name: p2Decision.monName, stats: p2Decision.stats})
                                        io.to(p1Decision.id).emit("calcedStats", p1Decision.stats);
                                        io.to(p2Decision.id).emit("enemyCalcedStats", {name: p1Decision.monName, stats: p1Decision.stats})
                                        io.to(socket.room).emit("endTurn");
                                    }
                                })
                            })
                        }
                    })
                })
            }
        }
    })

    socket.on("forfeit", ()=>{
        io.to(socket.room).emit("updateLog", (socket.username + " has forfeited!"));
        socket.to(socket.room).emit("forfeit")
    })

    socket.on("Iwin", ()=>{
        io.emit("gameOver", (socket.username));
    })
})

//
// Other helper functions
//

function updateUserStats(user, status, currentValue){
    if(status == "win"){
        console.log(user + " has won, updating database from wins:" + currentValue + " to wins:" + (currentValue+1))
        User.update(
            {userWins: currentValue+1},
            {where:{userName: user}}
        )
    }
    else{
        console.log(user + " has lost, updating database from losses:" + currentValue + " to losses:" + (currentValue+1))
        User.update(
            {userLosses: currentValue+1},
            {where:{userName: user}}
        )
    }

}

function calcHPStat(base, ev){
    return Math.floor(((2*base+31+Math.floor(ev/4))*100)/100)+100+10
}

function calcGenericStat(base, ev){
    return Math.floor((Math.floor(((2*base+31+Math.floor(ev/4))*100)/100)+5)*1)
}

async function calcDamage(attacker, attackerCalcStats, defender, defenderCalcStats, move, socket) {
    let mods;
    if (move.moveKind == "Physical") {
        mods = moveRandomness() * await calcTypeEffectiveness(move, defender, socket) * await STABCalc(attacker, move);
        let d = ((((((2 * 100) / 5) + 2) * move.movePower * attackerCalcStats[2] / defenderCalcStats[3]) / 50) + 2)*mods;
        console.log("damage to be done by " + attacker + " to " + defender + "=")
        console.log(Math.ceil(d));
        return Math.ceil(d);
    }
    else if (move.moveKind == "Special") {
        mods = moveRandomness() * await calcTypeEffectiveness(move, defender, socket) * await STABCalc(attacker, move);
        let d = ((((((2 * 100) / 5) + 2) * move.movePower * attackerCalcStats[4] / defenderCalcStats[5]) / 50) + 2)*mods;
        console.log("damage to be done by " + attacker + " to " + defender + "=")
        console.log(Math.ceil(d));
        return Math.ceil(d);
    }
}

async function STABCalc(attacker, move) {
    let data = await Fakemon.findAll({where: {fakemonName: attacker}})
    let a = data[0].dataValues;
    if (a.fakemonTypePrimary == move.moveType || a.fakemonTypePrimary == move.moveType) {
        return 1.5;
    }
    return 1;
}

//this function is used in damage calculations, it is the mild randomness of moves. This will return a double between 0.85 inclusive and 1 inclusive
function moveRandomness(){
    let random = randomIntFromInterval(0, 14);
    random = random/100;
    //not sure why but sometimes you get 0.92999999, and I can't deduce why, so this is hardcoded to fix that error
    if(1-random >0.92 && 1-random <0.93){
        return 0.93
    }
    return 1-random;
}

//random num generation
function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

//pass in the attacker type
async function calcTypeEffectiveness(move, defender, socket) {
    let d = await Fakemon.findAll({where: {fakemonName: defender}})
    let temp = d[0].dataValues;

    let e = effectivenessTable[temp.fakemonTypePrimary][move.moveType]
            * effectivenessTable[temp.fakemonTypeSecondary][move.moveType]
    if (e >= 2) {
        //super effective
        io.in(socket.room).emit("updateLog", ("It's super effective!"));
    }
    if (e < 1 && e != 0) {
        //not very effective
        io.in(socket.room).emit("updateLog", ("It's not very effective..."));
    }
    if (e == 0) {
        //no effect
        io.in(socket.room).emit("updateLog", ("It had no effect!"));
    }
    return e;
}

//this table is is ROW MAJOR ORDER, meaning the first object is the defending type, the first is the attacking type
//Example, [bug][dark] returns 1 because dark does 1x damage to bug, or bug recieves 1x damage from dark
function initEffectivenessTable(){
    //let typeList = ["Normal","Fighting","Flying","Poison","Ground","Rock","Bug","Ghost","Steel","Fire","Water","Grass","Electric","Psychic","Ice","Dragon","Dark","Fairy"]
    effectivenessTable = {Bug: {
            Bug: 1,
            Dark: 1,
            Dragon: 1,
            Electric: 1,
            Fairy: 1,
            Fighting: 0.5,
            Fire: 2,
            Flying: 2,
            Ghost: 1,
            Grass: 0.5,
            Ground: 0.5,
            Ice: 1,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 2,
            Steel: 1,
            Water: 1
        },
        Dark: {
            Bug: 2,
            Dark: 0.5,
            Dragon: 1,
            Electric: 1,
            Fairy: 2,
            Fighting: 2,
            Fire: 1,
            Flying: 1,
            Ghost: 0.5,
            Grass: 1,
            Ground: 1,
            Ice: 1,
            Normal: 1,
            Poison: 1,
            Psychic: 0,
            Rock: 1,
            Steel: 1,
            Water: 1
        },
        Dragon: {
            Bug: 1,
            Dark: 1,
            Dragon: 2,
            Electric: 0.5,
            Fairy: 2,
            Fighting: 1,
            Fire: 0.5,
            Flying: 1,
            Ghost: 1,
            Grass: 0.5,
            Ground: 1,
            Ice: 2,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 1,
            Steel: 1,
            Water: 0.5
        },
        Electric: {
            Bug: 1,
            Dark: 1,
            Dragon: 1,
            Electric: 0.5,
            Fairy: 1,
            Fighting: 1,
            Fire: 1,
            Flying: 0.5,
            Ghost: 1,
            Grass: 1,
            Ground: 2,
            Ice: 1,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 1,
            Steel: 0.5,
            Water: 1
        },
        Fairy: {
            Bug: 0.5,
            Dark: 0.5,
            Dragon: 0,
            Electric: 1,
            Fairy: 1,
            Fighting: 0.5,
            Fire: 1,
            Flying: 1,
            Ghost: 1,
            Grass: 1,
            Ground: 1,
            Ice: 1,
            Normal: 1,
            Poison: 2,
            Psychic: 1,
            Rock: 1,
            Steel: 2,
            Water: 1
        },
        Fighting: {
            Bug: 0.5,
            Dark: 0.5,
            Dragon: 1,
            Electric: 1,
            Fairy: 2,
            Fighting: 1,
            Fire: 1,
            Flying: 2,
            Ghost: 1,
            Grass: 1,
            Ground: 1,
            Ice: 1,
            Normal: 1,
            Poison: 1,
            Psychic: 2,
            Rock: 0.5,
            Steel: 1,
            Water: 1
        },
        Fire: {
            Bug: 0.5,
            Dark: 1,
            Dragon: 1,
            Electric: 1,
            Fairy: 0.5,
            Fighting: 1,
            Fire: 0.5,
            Flying: 1,
            Ghost: 1,
            Grass: 0.5,
            Ground: 2,
            Ice: 0.5,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 2,
            Steel: 0.5,
            Water: 2
        },
        Flying: {
            Bug: 0.5,
            Dark: 1,
            Dragon: 1,
            Electric: 2,
            Fairy: 1,
            Fighting: 0.5,
            Fire: 1,
            Flying: 1,
            Ghost: 1,
            Grass: 0.5,
            Ground: 0,
            Ice: 2,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 2,
            Steel: 1,
            Water: 1
        },
        Ghost: {
            Bug: 0.5,
            Dark: 2,
            Dragon: 1,
            Electric: 1,
            Fairy: 1,
            Fighting: 0,
            Fire: 1,
            Flying: 1,
            Ghost: 2,
            Grass: 1,
            Ground: 1,
            Ice: 1,
            Normal: 0,
            Poison: 0.5,
            Psychic: 1,
            Rock: 1,
            Steel: 1,
            Water: 1
        },
        Grass: {
            Bug: 2,
            Dark: 1,
            Dragon: 1,
            Electric: 0.5,
            Fairy: 1,
            Fighting: 1,
            Fire: 2,
            Flying: 2,
            Ghost: 1,
            Grass: 0.5,
            Ground: 0.5,
            Ice: 2,
            Normal: 1,
            Poison: 2,
            Psychic: 1,
            Rock: 1,
            Steel: 1,
            Water: 0.5
        },
        Ground: {
            Bug: 1,
            Dark: 1,
            Dragon: 1,
            Electric: 0,
            Fairy: 1,
            Fighting: 1,
            Fire: 1,
            Flying: 1,
            Ghost: 1,
            Grass: 2,
            Ground: 1,
            Ice: 2,
            Normal: 1,
            Poison: 0.5,
            Psychic: 1,
            Rock: 0.5,
            Steel: 1,
            Water: 2
        },
        Ice: {
            Bug: 1,
            Dark: 1,
            Dragon: 1,
            Electric: 1,
            Fairy: 1,
            Fighting: 2,
            Fire: 2,
            Flying: 1,
            Ghost: 1,
            Grass: 1,
            Ground: 1,
            Ice: 0.5,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 2,
            Steel: 2,
            Water: 1
        },
        Normal: {
            Bug: 1,
            Dark: 1,
            Dragon: 1,
            Electric: 1,
            Fairy: 1,
            Fighting: 2,
            Fire: 1,
            Flying: 1,
            Ghost: 0,
            Grass: 1,
            Ground: 1,
            Ice: 1,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 1,
            Steel: 1,
            Water: 1
        },
        Poison: {
            Bug: 0.5,
            Dark: 1,
            Dragon: 1,
            Electric: 1,
            Fairy: 0.5,
            Fighting: 0.5,
            Fire: 1,
            Flying: 1,
            Ghost: 1,
            Grass: 0.5,
            Ground: 2,
            Ice: 1,
            Normal: 1,
            Poison: 0.5,
            Psychic: 2,
            Rock: 1,
            Steel: 1,
            Water: 1
        },
        Psychic: {
            Bug: 2,
            Dark: 2,
            Dragon: 1,
            Electric: 1,
            Fairy: 1,
            Fighting: 0.5,
            Fire: 1,
            Flying: 1,
            Ghost: 2,
            Grass: 1,
            Ground: 1,
            Ice: 1,
            Normal: 1,
            Poison: 1,
            Psychic: 0.5,
            Rock: 1,
            Steel: 1,
            Water: 1
        },
        Rock: {
            Bug: 1,
            Dark: 1,
            Dragon: 1,
            Electric: 1,
            Fairy: 1,
            Fighting: 2,
            Fire: 0.5,
            Flying: 0.5,
            Ghost: 1,
            Grass: 2,
            Ground: 2,
            Ice: 1,
            Normal: 0.5,
            Poison: 0.5,
            Psychic: 1,
            Rock: 1,
            Steel: 2,
            Water: 2
        },
        Steel: {
            Bug: 0.5,
            Dark: 1,
            Dragon: 0.5,
            Electric: 1,
            Fairy: 0.5,
            Fighting: 2,
            Fire: 2,
            Flying: 0.5,
            Ghost: 1,
            Grass: 0.5,
            Ground: 2,
            Ice: 0.5,
            Normal: 0.5,
            Poison: 0,
            Psychic: 0.5,
            Rock: 0.5,
            Steel: 0.5,
            Water: 1
        },
        Water: {
            Bug: 1,
            Dark: 1,
            Dragon: 1,
            Electric: 2,
            Fairy: 1,
            Fighting: 1,
            Fire: 0.5,
            Flying: 1,
            Ghost: 1,
            Grass: 2,
            Ground: 1,
            Ice: 0.5,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 1,
            Steel: 0.5,
            Water: 0.5
        }, null: {
            Bug: 1,
            Dark: 1,
            Dragon: 1,
            Electric: 1,
            Fairy: 1,
            Fighting: 1,
            Fire: 1,
            Flying: 1,
            Ghost: 1,
            Grass: 1,
            Ground: 1,
            Ice: 1,
            Normal: 1,
            Poison: 1,
            Psychic: 1,
            Rock: 1,
            Steel: 1,
            Water: 1
        }
    }
}


/*
* SERVER EXECUTION
* */

const PORT = process.env.PORT || 8080;
http.listen(PORT,'0.0.0.0',function(){
    console.log(`app listening on ${PORT}`);
});