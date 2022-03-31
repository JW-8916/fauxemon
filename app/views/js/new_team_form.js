"use strict"
//these are all defined here for ease of use later on in the team_util file
let fakemonJson = null;
let pList;
let pBaseList;
let pAbilityList;
let evLists;
let evOutputLists;
let moveLists;
let pStats;

window.addEventListener("load", function(evt){

    //declare the list of pokemon names
    let p1 = document.querySelector("#p1")
    let p2 = document.querySelector("#p2")
    let p3 = document.querySelector("#p3")
    let p4 = document.querySelector("#p4")
    let p5 = document.querySelector("#p5")
    let p6 = document.querySelector("#p6")
    pList = [p1,p2,p3,p4,p5,p6];

    //declare the list of baseStat texts
    let p1base = document.querySelector("#p1BaseStats")
    let p2base = document.querySelector("#p2BaseStats")
    let p3base = document.querySelector("#p3BaseStats")
    let p4base = document.querySelector("#p4BaseStats")
    let p5base = document.querySelector("#p5BaseStats")
    let p6base = document.querySelector("#p6BaseStats")
    pBaseList = [p1base, p2base, p3base, p4base, p5base, p6base];

    //declare the list of ability selects
    let p1Ability = document.querySelector("#p1Ability");
    let p2Ability = document.querySelector("#p2Ability");
    let p3Ability = document.querySelector("#p3Ability");
    let p4Ability = document.querySelector("#p4Ability");
    let p5Ability = document.querySelector("#p5Ability");
    let p6Ability = document.querySelector("#p6Ability");
    pAbilityList = [p1Ability,p2Ability,p3Ability,p4Ability,p5Ability,p6Ability]

    //declare the list of ev sliders
    let p1EVList = []
    let p2EVList = []
    let p3EVList = []
    let p4EVList = []
    let p5EVList = []
    let p6EVList = []
    evLists = [p1EVList,p2EVList,p3EVList,p4EVList,p5EVList,p6EVList];

    //declare the list of ev slider outputs
    let p1EVOutputList = []
    let p2EVOutputList = []
    let p3EVOutputList = []
    let p4EVOutputList = []
    let p5EVOutputList = []
    let p6EVOutputList = []
    evOutputLists = [p1EVOutputList,p2EVOutputList,p3EVOutputList,p4EVOutputList,p5EVOutputList,p6EVOutputList]

    slidersInit();

    //declare the list of move dropdowns for each pokemon
    let p1MoveList = [];
    let p2MoveList = [];
    let p3MoveList = [];
    let p4MoveList = [];
    let p5MoveList = [];
    let p6MoveList = [];
    moveLists = [p1MoveList, p2MoveList, p3MoveList, p4MoveList, p5MoveList,p6MoveList];

    movesSelectInit();

    //declare the running stats lists
    let p1Stats = document.querySelector("#p1CalculatedStats")
    let p2Stats = document.querySelector("#p2CalculatedStats")
    let p3Stats = document.querySelector("#p3CalculatedStats")
    let p4Stats = document.querySelector("#p4CalculatedStats")
    let p5Stats = document.querySelector("#p5CalculatedStats")
    let p6Stats = document.querySelector("#p6CalculatedStats")
    pStats = [p1Stats, p2Stats, p3Stats, p4Stats, p5Stats, p6Stats];

    let teamName = document.querySelector("#teamName");

    //This ajax is for the fakemon names for the dropdown lists that happens right at the start
    //This ajax is the most important as other ajax calls are done after the names of fakemons have been generated. Doing them
    //outside of this ajax ends up crashing
    AJAX.get("http://localhost:8080/json/fakemon", function(response) {
        //success
        //this is the json information of content from the Fakemon table in the database
        let json = JSON.parse(response.responseText);
        fakemonJson = json;

        //this loop just grabs the names from the json text and makes a list of them
        let fakemonNames = [];
        for(let i = 0; i < json.length; i++){
            fakemonNames.push(json[i]["fakemonName"]);
        }

        //this section goes through all 6 fakemon selects in the document and makes them all dropdown lists
        //first loop is for each fakemon select item
        for(let i = 0; i < pList.length; i++){
            //second loop goes through the list of pokemon names
            for(let curName = 0; curName < fakemonNames.length; curName++){
                let option = document.createElement("option")
                option.value = fakemonNames[curName];
                option.innerText = fakemonNames[curName];
                pList[i].append(option);
            }
        }

        //these init calls are done that way the information doesn't appear as empty right at the start
        baseStatInit();
        abilityInit();
        statCalcInit();
        movesInit();

        //adds the on change event handlers to the base stat section, ability drop down, and stat calcs
        for(let i = 0; i < pList.length; i++){
            pList[i].addEventListener("change", function (){
                changeBaseStats(pList[i], pBaseList[i]);
                changeAbilitySelect(pList[i], pAbilityList[i])
                calcStats(pList[i], evLists[i], pStats[i]);
                changeMoveSelect(pList[i], moveLists[i])
            });
        }
    }, function (response){/*failure*/})
})

//this method instantiates all the sliders in the page and adds their event listeners so that they respond when changed
function slidersInit(){
    let stats = ["Hp", "Attack", "Defense", "SpAttack", "SpDefense", "Speed"];

    for(let pokemon = 1; pokemon < 7; pokemon++){
        for(let s = 0; s < stats.length; s++){
            let temp = document.querySelector("#p"+pokemon+""+stats[s]+"EV")
            evLists[pokemon-1].push(temp);
            temp = document.querySelector("#p"+pokemon+""+stats[s]+"EVOutput")
            evOutputLists[pokemon-1].push(temp);
            evLists[pokemon-1][s].oninput = function (){
                evOutputLists[pokemon-1][s].innerText = this.value;
                calcStats(pList[pokemon-1], evLists[pokemon-1], pStats[pokemon-1]);
            }
        }
    }
}

function changeSliderOutputs(){
    let stats = ["Hp", "Attack", "Defense", "SpAttack", "SpDefense", "Speed"];
    for(let pokemon = 1; pokemon < 7; pokemon++){
        for(let s = 0; s< stats.length; s++){
            evOutputLists[pokemon-1][s].innerText = evLists[pokemon-1][s].value;
        }
    }
}

function abilityInit(){
    for(let i = 0; i < pAbilityList.length; i++){
        changeAbilitySelect(pList[i], pAbilityList[i]);
    }
}

function movesSelectInit(){
    for(let pokemon = 1; pokemon < 7; pokemon++){
        for(let m = 1; m < 5; m++){
            let temp = document.querySelector("#p"+pokemon+"Move"+m)
            moveLists[pokemon-1].push(temp);
        }
    }
}

function movesInit(){
    for(let i = 0; i < moveLists.length; i++){
        changeMoveSelect(pList[i], moveLists[i]);
    }
}

//this changes the ability for the pokemon, pass in a reference to the fakemon select tag and a reference to the ability select tag
function changeAbilitySelect(pName, pAbility){
    pAbility.innerHTML = "";
    let selectedMon = pName.selectedIndex;
    AJAX.get("http://localhost:8080/json/possibleability/"+fakemonJson[selectedMon]["fakemonName"], function (response){
        //success
        let json = JSON.parse(response.responseText);

        let abilityNames = [];
        for(let i = 0; i < json.length; i++){
            abilityNames.push(json[i]["abilityName"]);
        }

        //second loop goes through the list of pokemon names
        for(let curAbility = 0; curAbility < abilityNames.length; curAbility++){
            let option = document.createElement("option")
            option.value = abilityNames[curAbility];
            option.innerText = abilityNames[curAbility];
            pAbility.append(option);
        }

    }, function (response){/*failure*/})
}

//this will change the moves for a pokemon. Pass in a reference to the fakemon select tag as well as a reference to the list of move selects
function changeMoveSelect(pName, pMoves){
    for(let p = 0; p < pMoves.length; p++){
        pMoves[p].innerHTML = ""
    }

    let selectedMon = pName.selectedIndex;
    AJAX.get("http://localhost:8080/json/possiblemove/"+fakemonJson[selectedMon]["fakemonName"], function (response){
        let json = JSON.parse(response.responseText);
        let movesNames = [];
        for(let i = 0; i < json.length; i++){
            movesNames.push(json[i]["moveName"]);
        }

        for(let p = 0; p < pMoves.length; p++){
            for(let curMove = 0; curMove < movesNames.length; curMove++){
                let option = document.createElement("option");
                option.value = movesNames[curMove];
                option.innerText = movesNames[curMove];
                pMoves[p].append(option);
            }
        }
    }, function(response){/*Failure*/})
}

//init for the base stats
function baseStatInit(){
    for(let i = 0; i < pList.length; i++){
        changeBaseStats(pList[i], pBaseList[i]);
    }
}

//if the base stats need to be changed, call this. Pass in a reference to the dropdown list for the name, and a reference to the base stat div
function changeBaseStats(pName, pBaseStats){
    let text = "";
    let selectedMon = pName.selectedIndex;
    text = "HP: " + fakemonJson[selectedMon]["fakemonHp"] + ", Atk: " + fakemonJson[selectedMon]["fakemonAttack"] + ", Def: " + fakemonJson[selectedMon]["fakemonDefense"]
        + ", SpAtk: " + fakemonJson[selectedMon]["fakemonSpAttack"] + ", SpDef: " + fakemonJson[selectedMon]["fakemonSpDefense"] + ", Speed: " + fakemonJson[selectedMon]["fakemonSpeed"];

    pBaseStats.innerText = "Base stats: " + text;
}

function statCalcInit(){
    for(let i = 0; i < pList.length; i++){
        calcStats(pList[i], evLists[i], pStats[i]);
    }
}

//pass in a reference to the pokemon name selector, reference to the list of EVs, and a reference to its text output
function calcStats(pName, pEvs, pStat){
    let text = "";
    let selectedMon = pName.selectedIndex;

    let hpBase = fakemonJson[selectedMon]["fakemonHp"]
    let attackBase = fakemonJson[selectedMon]["fakemonAttack"]
    let defenseBase = fakemonJson[selectedMon]["fakemonDefense"]
    let spAttackBase = fakemonJson[selectedMon]["fakemonSpAttack"]
    let spDefenseBase = fakemonJson[selectedMon]["fakemonSpDefense"]
    let speedBase = fakemonJson[selectedMon]["fakemonSpeed"]

    let hpEv = pEvs[0].value;
    let attackEv = pEvs[1].value;
    let defenseEv = pEvs[2].value;
    let spAttackEv = pEvs[3].value;
    let spDefenseEv = pEvs[4].value;
    let speedEv = pEvs[5].value;

    let calcHp = calcHpStat(hpBase, hpEv);
    let calcAttack = calcGeneralStat(attackBase, attackEv)
    let calcDefense = calcGeneralStat(defenseBase, defenseEv)
    let calcSpAttack = calcGeneralStat(spAttackBase, spAttackEv)
    let calcSpDefense = calcGeneralStat(spDefenseBase, spDefenseEv)
    let calcSpeed = calcGeneralStat(speedBase, speedEv);

    text = "HP: " + calcHp + ", Atk: " + calcAttack + ", Def: " + calcDefense
        + ", SpAtk: " + calcSpAttack + ", SpDef: " + calcSpDefense + ", Speed: " + calcSpeed;

    pStat.innerText = text;
}

function calcHpStat(base, ev){
    return Math.floor(((2*base+31+Math.floor(ev/4))*100)/100)+100+10
}

function calcGeneralStat(base, ev){
    //certain constants are just left here for comparability to the actual stat calculator to make it easy to update later on as the game develops
    return Math.floor((Math.floor(((2*base+31+Math.floor(ev/4))*100)/100)+5)*1)
}