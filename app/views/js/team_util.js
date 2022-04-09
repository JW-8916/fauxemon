window.addEventListener("load", function (evt){

    //this is for generating the list of teams
    let teamsSection = document.querySelector("#teams");

    //useful for when a user changes the name of the team during an edit to avoid duplication
    let oldTeamName = "";

    if(localStorage.length == 0){
        let noteams = document.createElement("p")
        noteams.innerText = "You have no teams! Click the new teams button below to make a new one!"
        teamsSection.append(noteams)
    }
    else{
        for(let i = 0; i < localStorage.length; i++){
            //this is to grab the team info
            //console.log(localStorage.getItem(localStorage.key(i)));
            let currentTeam = JSON.parse(localStorage.getItem(localStorage.key(i)))
            let savedTeamName = currentTeam["name"]
            let teamPreview = currentTeam["p1"]["name"] + ", " + currentTeam["p2"]["name"] + ", " + currentTeam["p3"]["name"] + ", " + currentTeam["p4"]["name"] + ", " + currentTeam["p5"]["name"] + ", " + currentTeam["p6"]["name"];

            //generate the tags associated
            let nameTag = document.createElement("h3")
            nameTag.innerText = savedTeamName;
            let descTag = document.createElement("p")
            descTag.innerText = teamPreview;
            let hr = document.createElement("hr");

            //generate edit and delete buttons
            let editButton = document.createElement("button")
            editButton.innerText = "Edit"
            let deleteButton = document.createElement("button")
            deleteButton.innerText = "Delete"

            //delete button event listener
            deleteButton.addEventListener("click", function (evt){
                if(confirm("Are you sure you want to delete this team?") == true){
                    localStorage.removeItem(localStorage.key(i));
                    window.location.reload();
                }
            })

            editButton.addEventListener("click", function (evt){
                oldTeamName = currentTeam["name"];
                formSection.style.display = "block"
                newTeamButton.disabled = true;
                teamsSection.style.display = "none"
                loadEditTeam(currentTeam)
            })

            teamsSection.prepend(nameTag, descTag, editButton, deleteButton, hr);
        }
    }



    //this is for creating a brand new team. This just sets the visibility of the form to visible and allows you to go from there
    let newTeamButton = document.querySelector("#newButton")
    let formSection = document.querySelector("#form")
    newTeamButton.addEventListener("click", function (evt){
        formSection.style.display = "block"
        newTeamButton.disabled = true;
        teamsSection.style.display = "none"
        let teamsTitle = document.querySelector("#teamTitle").style.display = "none"
    })

    let saveTeamButton = document.querySelector("#saveTeam")
    saveTeamButton.addEventListener("click", function (evt){
        saveTeam();
    })

    function saveTeam(){
        let teamName = document.querySelector("#teamName").value;
        if(teamName == ""){
            alert("Team name can not be blank! Please type a name for your team")
        }
        else{
            let p1 = document.querySelector("#p1").value
            let p1Ability = document.querySelector("#p1Ability").value
            let p1Move1 = document.querySelector("#p1Move1").value
            let p1Move2 = document.querySelector("#p1Move2").value
            let p1Move3 = document.querySelector("#p1Move3").value
            let p1Move4 = document.querySelector("#p1Move4").value
            let p1HpEV = document.querySelector("#p1HpEV").value;
            let p1AttackEV = document.querySelector("#p1AttackEV").value;
            let p1DefenseEV = document.querySelector("#p1DefenseEV").value;
            let p1SpAttackEV = document.querySelector("#p1SpAttackEV").value;
            let p1SpDefenseEV = document.querySelector("#p1SpDefenseEV").value;
            let p1SpeedEV = document.querySelector("#p1SpeedEV").value;

            let p2 = document.querySelector("#p2").value
            let p2Ability = document.querySelector("#p2Ability").value
            let p2Move1 = document.querySelector("#p2Move1").value
            let p2Move2 = document.querySelector("#p2Move2").value
            let p2Move3 = document.querySelector("#p2Move3").value
            let p2Move4 = document.querySelector("#p2Move4").value
            let p2HpEV = document.querySelector("#p2HpEV").value;
            let p2AttackEV = document.querySelector("#p2AttackEV").value;
            let p2DefenseEV = document.querySelector("#p2DefenseEV").value;
            let p2SpAttackEV = document.querySelector("#p2SpAttackEV").value;
            let p2SpDefenseEV = document.querySelector("#p2SpDefenseEV").value;
            let p2SpeedEV = document.querySelector("#p2SpeedEV").value;

            let p3 = document.querySelector("#p3").value
            let p3Ability = document.querySelector("#p3Ability").value
            let p3Move1 = document.querySelector("#p3Move1").value
            let p3Move2 = document.querySelector("#p3Move2").value
            let p3Move3 = document.querySelector("#p3Move3").value
            let p3Move4 = document.querySelector("#p3Move4").value
            let p3HpEV = document.querySelector("#p3HpEV").value;
            let p3AttackEV = document.querySelector("#p3AttackEV").value;
            let p3DefenseEV = document.querySelector("#p3DefenseEV").value;
            let p3SpAttackEV = document.querySelector("#p3SpAttackEV").value;
            let p3SpDefenseEV = document.querySelector("#p3SpDefenseEV").value;
            let p3SpeedEV = document.querySelector("#p3SpeedEV").value;

            let p4 = document.querySelector("#p4").value
            let p4Ability = document.querySelector("#p4Ability").value
            let p4Move1 = document.querySelector("#p4Move1").value
            let p4Move2 = document.querySelector("#p4Move2").value
            let p4Move3 = document.querySelector("#p4Move3").value
            let p4Move4 = document.querySelector("#p4Move4").value
            let p4HpEV = document.querySelector("#p4HpEV").value;
            let p4AttackEV = document.querySelector("#p4AttackEV").value;
            let p4DefenseEV = document.querySelector("#p4DefenseEV").value;
            let p4SpAttackEV = document.querySelector("#p4SpAttackEV").value;
            let p4SpDefenseEV = document.querySelector("#p4SpDefenseEV").value;
            let p4SpeedEV = document.querySelector("#p4SpeedEV").value;

            let p5 = document.querySelector("#p5").value
            let p5Ability = document.querySelector("#p5Ability").value
            let p5Move1 = document.querySelector("#p5Move1").value
            let p5Move2 = document.querySelector("#p5Move2").value
            let p5Move3 = document.querySelector("#p5Move3").value
            let p5Move4 = document.querySelector("#p5Move4").value
            let p5HpEV = document.querySelector("#p5HpEV").value;
            let p5AttackEV = document.querySelector("#p5AttackEV").value;
            let p5DefenseEV = document.querySelector("#p5DefenseEV").value;
            let p5SpAttackEV = document.querySelector("#p5SpAttackEV").value;
            let p5SpDefenseEV = document.querySelector("#p5SpDefenseEV").value;
            let p5SpeedEV = document.querySelector("#p5SpeedEV").value;

            let p6= document.querySelector("#p6").value
            let p6Ability = document.querySelector("#p6Ability").value
            let p6Move1 = document.querySelector("#p6Move1").value
            let p6Move2 = document.querySelector("#p6Move2").value
            let p6Move3 = document.querySelector("#p6Move3").value
            let p6Move4 = document.querySelector("#p6Move4").value
            let p6HpEV = document.querySelector("#p6HpEV").value;
            let p6AttackEV = document.querySelector("#p6AttackEV").value;
            let p6DefenseEV = document.querySelector("#p6DefenseEV").value;
            let p6SpAttackEV = document.querySelector("#p6SpAttackEV").value;
            let p6SpDefenseEV = document.querySelector("#p6SpDefenseEV").value;
            let p6SpeedEV = document.querySelector("#p6SpeedEV").value;

            let tp1 = new Fakemon(p1, p1Ability, p1Move1, p1Move2, p1Move3, p1Move4, p1HpEV, p1AttackEV, p1DefenseEV, p1SpAttackEV, p1SpDefenseEV, p1SpeedEV)
            let tp2 = new Fakemon(p2, p2Ability, p2Move1, p2Move2, p2Move3, p2Move4, p2HpEV, p2AttackEV, p2DefenseEV, p2SpAttackEV, p2SpDefenseEV, p2SpeedEV)
            let tp3 = new Fakemon(p3, p3Ability, p3Move1, p3Move2, p3Move3, p3Move4, p3HpEV, p3AttackEV, p3DefenseEV, p3SpAttackEV, p3SpDefenseEV, p3SpeedEV)
            let tp4 = new Fakemon(p4, p4Ability, p4Move1, p4Move2, p4Move3, p4Move4, p4HpEV, p4AttackEV, p4DefenseEV, p4SpAttackEV, p4SpDefenseEV, p4SpeedEV)
            let tp5 = new Fakemon(p5, p5Ability, p5Move1, p5Move2, p5Move3, p5Move4, p5HpEV, p5AttackEV, p5DefenseEV, p5SpAttackEV, p5SpDefenseEV, p5SpeedEV)
            let tp6 = new Fakemon(p6, p6Ability, p6Move1, p6Move2, p6Move3, p6Move4, p6HpEV, p6AttackEV, p6DefenseEV, p6SpAttackEV, p6SpDefenseEV, p6SpeedEV)
            let team = new Team(teamName, tp1, tp2, tp3, tp4, tp5, tp6);
            let temp = JSON.stringify(team)
            localStorage.setItem(teamName, temp);
            if(teamName != oldTeamName){
                localStorage.removeItem(oldTeamName);
            }
            window.location.reload();
        }
    }

     function loadEditTeam(team) {
         console.log(team)
         document.querySelector("#teamName").value = team["name"];

         let p1 = document.querySelector("#p1").value = team["p1"]["name"]
         let p2 = document.querySelector("#p2").value = team["p2"]["name"]
         let p3 = document.querySelector("#p3").value = team["p3"]["name"]
         let p4 = document.querySelector("#p4").value = team["p4"]["name"]
         let p5 = document.querySelector("#p5").value = team["p5"]["name"]
         let p6 = document.querySelector("#p6").value = team["p6"]["name"]

         baseStatInit();

         abilityInit();

         movesInit();

         setTimeout(()=>{
             let p1Ability = document.querySelector("#p1Ability").value = team["p1"]["ability"]
             let p2Ability = document.querySelector("#p2Ability").value = team["p2"]["ability"]
             let p3Ability = document.querySelector("#p3Ability").value = team["p3"]["ability"]
             let p4Ability = document.querySelector("#p4Ability").value = team["p4"]["ability"]
             let p5Ability = document.querySelector("#p5Ability").value = team["p5"]["ability"]
             let p6Ability = document.querySelector("#p6Ability").value = team["p6"]["ability"]

             let p1Move1 = document.querySelector("#p1Move1").value = team["p1"]["moves"][0]
             let p1Move2 = document.querySelector("#p1Move2").value = team["p1"]["moves"][1]
             let p1Move3 = document.querySelector("#p1Move3").value = team["p1"]["moves"][2]
             let p1Move4 = document.querySelector("#p1Move4").value = team["p1"]["moves"][3]
             let p1HpEV = document.querySelector("#p1HpEV").value = team["p1"]["evs"][0]

             let p1AttackEV = document.querySelector("#p1AttackEV").value = team["p1"]["evs"][1]
             let p1DefenseEV = document.querySelector("#p1DefenseEV").value = team["p1"]["evs"][2]
             let p1SpAttackEV = document.querySelector("#p1SpAttackEV").value = team["p1"]["evs"][3]
             let p1SpDefenseEV = document.querySelector("#p1SpDefenseEV").value = team["p1"]["evs"][4]
             let p1SpeedEV = document.querySelector("#p1SpeedEV").value = team["p1"]["evs"][5]

             let p2Move1 = document.querySelector("#p2Move1").value = team["p2"]["moves"][0]
             let p2Move2 = document.querySelector("#p2Move2").value = team["p2"]["moves"][1]
             let p2Move3 = document.querySelector("#p2Move3").value = team["p2"]["moves"][2]
             let p2Move4 = document.querySelector("#p2Move4").value = team["p2"]["moves"][3]
             let p2HpEV = document.querySelector("#p2HpEV").value = team["p2"]["evs"][0]
             let p2AttackEV = document.querySelector("#p2AttackEV").value = team["p2"]["evs"][1]
             let p2DefenseEV = document.querySelector("#p2DefenseEV").value = team["p2"]["evs"][2]
             let p2SpAttackEV = document.querySelector("#p2SpAttackEV").value = team["p2"]["evs"][3]
             let p2SpDefenseEV = document.querySelector("#p2SpDefenseEV").value = team["p2"]["evs"][4]
             let p2SpeedEV = document.querySelector("#p2SpeedEV").value = team["p2"]["evs"][5]

             let p3Move1 = document.querySelector("#p3Move1").value = team["p3"]["moves"][0]
             let p3Move2 = document.querySelector("#p3Move2").value = team["p3"]["moves"][1]
             let p3Move3 = document.querySelector("#p3Move3").value = team["p3"]["moves"][2]
             let p3Move4 = document.querySelector("#p3Move4").value = team["p3"]["moves"][3]
             let p3HpEV = document.querySelector("#p3HpEV").value = team["p3"]["evs"][0]
             let p3AttackEV = document.querySelector("#p3AttackEV").value = team["p3"]["evs"][1]
             let p3DefenseEV = document.querySelector("#p3DefenseEV").value = team["p3"]["evs"][2]
             let p3SpAttackEV = document.querySelector("#p3SpAttackEV").value = team["p3"]["evs"][3]
             let p3SpDefenseEV = document.querySelector("#p3SpDefenseEV").value = team["p3"]["evs"][4]
             let p3SpeedEV = document.querySelector("#p3SpeedEV").value = team["p3"]["evs"][5]

             let p4Move1 = document.querySelector("#p4Move1").value = team["p4"]["moves"][0]
             let p4Move2 = document.querySelector("#p4Move2").value = team["p4"]["moves"][1]
             let p4Move3 = document.querySelector("#p4Move3").value = team["p4"]["moves"][2]
             let p4Move4 = document.querySelector("#p4Move4").value = team["p4"]["moves"][3]
             let p4HpEV = document.querySelector("#p4HpEV").value = team["p4"]["evs"][0]
             let p4AttackEV = document.querySelector("#p4AttackEV").value = team["p4"]["evs"][1]
             let p4DefenseEV = document.querySelector("#p4DefenseEV").value = team["p4"]["evs"][2]
             let p4SpAttackEV = document.querySelector("#p4SpAttackEV").value = team["p4"]["evs"][3]
             let p4SpDefenseEV = document.querySelector("#p4SpDefenseEV").value = team["p4"]["evs"][4]
             let p4SpeedEV = document.querySelector("#p4SpeedEV").value = team["p4"]["evs"][5]

             let p5Move1 = document.querySelector("#p5Move1").value = team["p5"]["moves"][0]
             let p5Move2 = document.querySelector("#p5Move2").value = team["p5"]["moves"][1]
             let p5Move3 = document.querySelector("#p5Move3").value = team["p5"]["moves"][2]
             let p5Move4 = document.querySelector("#p5Move4").value = team["p5"]["moves"][3]
             let p5HpEV = document.querySelector("#p5HpEV").value = team["p5"]["evs"][0]
             let p5AttackEV = document.querySelector("#p5AttackEV").value = team["p5"]["evs"][1]
             let p5DefenseEV = document.querySelector("#p5DefenseEV").value = team["p5"]["evs"][2]
             let p5SpAttackEV = document.querySelector("#p5SpAttackEV").value = team["p5"]["evs"][3]
             let p5SpDefenseEV = document.querySelector("#p5SpDefenseEV").value = team["p5"]["evs"][4]
             let p5SpeedEV = document.querySelector("#p5SpeedEV").value = team["p5"]["evs"][5]

             let p6Move1 = document.querySelector("#p6Move1").value = team["p6"]["moves"][0]
             let p6Move2 = document.querySelector("#p6Move2").value = team["p6"]["moves"][1]
             let p6Move3 = document.querySelector("#p6Move3").value = team["p6"]["moves"][2]
             let p6Move4 = document.querySelector("#p6Move4").value = team["p6"]["moves"][3]
             let p6HpEV = document.querySelector("#p6HpEV").value = team["p6"]["evs"][0]
             let p6AttackEV = document.querySelector("#p6AttackEV").value = team["p6"]["evs"][1]
             let p6DefenseEV = document.querySelector("#p6DefenseEV").value = team["p6"]["evs"][2]
             let p6SpAttackEV = document.querySelector("#p6SpAttackEV").value = team["p6"]["evs"][3]
             let p6SpDefenseEV = document.querySelector("#p6SpDefenseEV").value = team["p6"]["evs"][4]
             let p6SpeedEV = document.querySelector("#p6SpeedEV").value = team["p6"]["evs"][5]

             statCalcInit()
             changeSliderOutputs()
         },20)
    }
})