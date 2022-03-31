"use strict"
window.addEventListener("load", function (evt){
    let table = document.querySelector("#ladderTable")
    AJAX.get("http://localhost:8080/json/user", function (response){
        //success
        let json = JSON.parse(response.responseText);

        sort(json)

        for(let row = 0; row < json.length; row++){
            let r = document.createElement("tr");

            let rank = document.createElement("td");
            rank.innerText = row+1 + "";

            let username = document.createElement("td")
            username.innerText = json[row]["userName"]

            let wins = document.createElement("td")
            wins.innerText = json[row]["userWins"]

            let losses = document.createElement("td")
            losses.innerText = json[row]["userLosses"]

            let ratio = document.createElement("td")
            let w = parseInt(wins.innerText)
            let l = parseInt(losses.innerText)
            let total = w+l
            let ave = 0;
            if(total != 0){
                ave = w/total
                ave = Math.trunc(ave*100)
            }
            ratio.innerText =  ave  + "%";

            r.append(rank, username, wins, losses, ratio)
            table.append(r);
        }

    }, function (response){/*failure*/})
})

function sort(json){
    for(let i = 0; i < json.length; i++){
        for(let j = 0; j < json.length-i-1; j++){
            let ave1 = Math.trunc( 100*(parseInt(json[j]["userWins"]) / (parseInt(json[j]["userWins"]) + parseInt(json[j]["userLosses"]))))
            let ave2 = Math.trunc( 100*(parseInt(json[j+1]["userWins"]) / (parseInt(json[j+1]["userWins"]) + parseInt(json[j+1]["userLosses"]))))

            if(ave1 < ave2){
                let temp = json[j];
                json[j] = json[j+1];
                json[j+1] = temp;
            }
        }
    }
}