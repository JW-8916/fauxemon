"use strict"
window.addEventListener("load", function (evt){
    let playButton = document.querySelector("#playButton")
    let teamSection = document.querySelector("#teamSection");
    if(localStorage.length == 0){
        let p = document.createElement("p")
        p.innerText = "You have no teams! Click on Team Builder to make a team"
        teamSection.innerHTML = "";
        teamSection.append(p)
        playButton.disabled = true
    }
    else{
        let teamsSelect = document.querySelector("#teams")
        for(let i = 0; i < localStorage.length; i++){
            let option = document.createElement("option")
            option.value = localStorage.key(i);
            option.innerText = localStorage.key(i);
            teamsSelect.prepend(option)
        }
    }

    playButton.addEventListener("click",function (evt){
        if(playButton.innerText != "Cancel"){
            socket.emit("play")
            playButton.innerText = "Cancel";
        }
        else{
            socket.emit("cancel")
            playButton.innerText = "Play with this team"
        }
    })

    socket.on("redirect", ()=>{
        console.log("redirect!")
        window.location.href = "/battle"
    })
})