"use strict"
var socket = io()
let username;
window.addEventListener("load", (evt)=>{
    let canvas = document.querySelector("#gameCanvas")
    let ctx = canvas.getContext("2d");
    ctx.font = "30px Comic Sans MS"
    ctx.fillStyle = "#ffffff"
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8
    let teamSection = document.querySelector("#teamSection")
    let movesSection = document.querySelector("#movesSection")
    let myImage = document.querySelector("#myImage")
    myImage.style.display = "none";
    let enemyImage = document.querySelector("#enemyImage");
    enemyImage.style.display = "none"
    let battleBackground = document.querySelector("#battleBackground");
    battleBackground.style.display = "none";
    let log = document.querySelector("#log")
    let leave = document.querySelector("#leave")
    leave.addEventListener("click", (evt)=>{
        if(isGameOver){
            //the game is over and can lead to the home
            window.location.href = "/";
        }
        else{
            if(confirm("Are you sure you want to forfeit?")){
                socket.emit("forfeit")
                window.location.href = "/"
            }
        }
    })

    //default information
    let team = JSON.parse(localStorage.getItem(getCookie("currentTeam")));
    let username = getCookie("username")
    let room = getCookie("room");
    let myCalcedStats;
    let enemyCalcedStats;
    let enemyName;
    let isGameOver = false
    let turn = 1;

    socket.emit("rejoin", {username: username, team: team, room: room});

    socket.on("calcedStats", (c)=>{
        myCalcedStats = c;
        console.log("My health = " + myCalcedStats[0])
        myImage.src = "../views/img/" + team.p1.name + "-back.png"
        console.log(myCalcedStats);
        setTimeout(()=>{
            reDraw();
        },200)
    })

    socket.on("enemyCalcedStats",(content)=>{
        console.log("getting enemy stats")
        console.log(content.name)
        enemyName = content.name;
        enemyCalcedStats = content.stats
        console.log("Enemy Health = " + enemyCalcedStats[0]);
        enemyImage.src = "../views/img/" + enemyName + "-front.png"
        setTimeout(()=>{
            reDraw();
            console.log("redraw for enemy content")
        },200)
    })

    changeMoves();

    socket.on("updateLog", (content)=>{
        let temp = document.createElement("p")
        temp.innerText = content;
        log.append(temp)
    })

    function changeMoves(){
        //this will remove all buttons that existed before for new pokemon
        movesSection.innerHTML = "";
        let moves = team.p1["moves"];

        //Sets do not contain repeats. Turning the list of moves into a set removes duplicates
        let uniqueMoves = [...new Set(moves)]

        for(let i = 0; i < uniqueMoves.length; i++){
            let temp = document.createElement("button")
            temp.value = uniqueMoves[i]
            temp.innerText = uniqueMoves[i];
            temp.addEventListener("click", (evt)=>{
                socket.emit("attack", (temp.value))
                movesSection.style.display = "none";
            })
            movesSection.appendChild(temp)
        }
    }

    socket.on("endTurn", ()=>{
        turn+=1
        movesSection.style.display = "block";
        let temp = document.createElement("p")
        temp.innerText = "TURN " + turn;
        log.append(temp)
    })

    socket.on("gameOver", (winner)=>{
        let temp = document.createElement("p")
        temp.innerText = winner + " has won!";
        log.append(temp)
        movesSection.style.display = "none";
        isGameOver = true;
        leave.innerHTML = "Leave"
    })

    socket.on("forfeit", ()=>{
        socket.emit("Iwin")
    })

    function reDraw(){
        ctx.clearRect(0,0, canvas.width, canvas.height)
        ctx.drawImage(battleBackground, 0, 0, canvas.width, canvas.height)

        if(myCalcedStats){
            ctx.strokeText(team.p1.name + " HP: " + myCalcedStats[0] + "/" + myCalcedStats[1], 10, 150)
            ctx.fillText(team.p1.name + " HP: " + myCalcedStats[0] + "/" + myCalcedStats[1], 10, 150)
            //let image = new Image();
            //image.src = "../views/img/" + team.p1.name + "-back.png"
            //console.log(image)
            ctx.drawImage(myImage, 0, 100, 340, 340)
        }

        if(enemyName){
            console.log("should be drawing the name for enemy")
            ctx.strokeText(enemyName + " HP: " + enemyCalcedStats[0] + "/" + enemyCalcedStats[1], 450, 50)
            ctx.fillText(enemyName + " HP: " + enemyCalcedStats[0] + "/" + enemyCalcedStats[1], 450, 50)
            ctx.drawImage(enemyImage, 450, 50, 340, 340)
        }
    }
})