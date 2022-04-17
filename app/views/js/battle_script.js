"use strict"
window.addEventListener("load", (evt)=>{
    //default information like cavas and div collection
    let canvas = document.querySelector("#GameCanvas")
    let teamSection = document.querySelector("#teamSection")
    let movesSection = document.querySelector("#movesSection")
    let cancel = document.querySelector("#cancel")
    //set the display to none at the start, then add event to cancel
    cancel.style.display = "none";
    cancel.addEventListener("click", function (evt){
        socket.emit("cancelChoice");
        swapDisplays();
    })

    //default stuff for the player
    let team = JSON.parse(localStorage.getItem(getCookie("currentTeam")));
    let username = getCookie("username")
    let room = getCookie("room");
    let currentfakemon = 1;

    //sockets die on page change, this fixes that and correctly brings the right sockets back to the server
    socket.emit("rejoin", (username, team, room));

    //this is for the team list
    for(let i = 1; i < 7; i++){
        let temp = document.createElement("button");
        temp.value = i;
        temp.innerText = team["p"+i]["name"]
        temp.addEventListener("click", (evt)=>{
            socket.emit("choice", ("switch", temp.value, currentfakemon))
            swapDisplays();
        })
        teamSection.appendChild(temp);
    }

    changeMoves();

    //helper functions

    function changeMoves(){
        //this will remove all buttons that existed before for new pokemon
        movesSection.innerHTML = "";
        let moves = team["p"+currentfakemon]["moves"];

        //Sets do not contain repeats. Turning the list of moves into a set removes duplicates
        let uniqueMoves = [...new Set(moves)]

        for(let i = 0; i < uniqueMoves.length; i++){
            let temp = document.createElement("button")
            temp.value = uniqueMoves[i]
            temp.innerText = uniqueMoves[i];
            temp.addEventListener("click", (evt)=>{
                socket.emit("choice", ("attack", temp.value, currentfakemon))
                swapDisplays()
            })
            movesSection.appendChild(temp)
        }
    }

    function swapDisplays(){
        if(cancel.style.display == "none"){
            cancel.style.display = "block"
            teamSection.style.display = "none"
            movesSection.style.display = "none"
        }
        else{
            cancel.style.display = "none"
            teamSection.style.display = "block"
            movesSection.style.display = "block"
        }
    }

    function forceSwitch(){
        cancel.style.display = "none";
        teamSection.style.display = "block"
        movesSection.style.display = "none";
    }
})