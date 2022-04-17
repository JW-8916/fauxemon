module.exports = {
    battle: function (io, room, socket){
        //basic setup for the game
        let effectivenessTable;
        initEffectivenessTable();
        let currentWeather = "none"
        let weatherPeriod = "infinite"

        //the event queue holds all the choices the users makes for their turn. once its a certain length, it'll be executed
        let eventQueue = []

        //socket events

        //choice is the name of the generic events that the user chooses client side for the game
        //theres two "options", switch and attack. They either attack that turn or they switch that turn
        socket.on("choice", (option, choice, currentFakemon)=>{
            let evt = {option: option, choice: choice, currentFakemon: currentFakemon, user: socket.username}
            eventQueue.push(evt);
            if(eventQueue.length == 2){
                //grab the two events
                let p1choice = eventQueue.shift();
                let p2choice = eventQueue.shift();

                if(p1choice["option"] == "switch" || p2choice["option"] == "switch"){
                    if(p1choice["option"] == "switch"){

                    }
                    if(p2choice["option"] == "switch"){

                    }
                }
                if(p1choice["option"] == "attack" || p2choice["option"] == "attack"){
                    if(p1choice["option"] == "attack"){

                    }
                    if(p2choice["option"] == "attack"){

                    }
                }
            }
        })

        socket.on("cancelChoice", ()=>{
            for(let i = 0; i < eventQueue.length; i++){
                if(eventQueue[i]["user"] == socket.username){
                    eventQueue.splice(i, i+1)
                    break;
                }
            }
        })

        //helper functions

        function calcDamage(attacker, defender, move){
            let mods;
            if(move.moveKind == "Physical"){
                mods = STABCalc(attacker, move) * weatherCalc() * moveRandomness() * calcTypeEffectiveness(attacker, defender.fakemonTypePrimary, defender.fakemonTypeSecondary);
                return ((((((2*100)/5)+2)*move.movePower*attacker.fakemonAttack/defender.fakemonDefense)/50)+2)*mods;
            }
            else if(move.moveKind == "Special"){
                mods = STABCalc(attacker, move) * weatherCalc() * moveRandomness() * calcTypeEffectiveness(attacker, defender.fakemonTypePrimary, defender.fakemonTypeSecondary);
                return ((((((2*100)/5)+2)*move.movePower*attacker.fakemonSpAttack/defender.fakemonSpDefense)/50)+2)*mods;
            }
        }

        function STABCalc(attacker, move){
            if(attacker.fakemonTypePrimary == move.moveType || attacker.fakemonTypePrimary == move.moveType){
                return 1.5;
            }
            return 1;
        }

        function weatherCalc(moveType){
            if(currentWeather == "Rain"){
                if(moveType == "Water"){
                    return 2;
                }
                if(moveType == "Fire"){
                    return 0.5
                }
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
        function calcTypeEffectiveness(attacker, defenderMain, defenderSub){
            return effectivenessTable[attacker][defenderMain] * effectivenessTable[attacker][defenderSub];
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
    }
}