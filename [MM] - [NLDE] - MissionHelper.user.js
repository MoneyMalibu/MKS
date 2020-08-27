// ==UserScript==
// @name         [MM] - [NLDE] - MissionHelper
// @namespace    http://tampermonkey.net/
// @version      2020.08.27.00.02
// @description  try to take over the world!
// @author       You
// @updateRL     https://github.com/MoneyMalibu/MKS/raw/master/%5BMM%5D%20-%20%5BNLDE%5D%20-%20MissionHelper.user.js
// @downloadURL  https://github.com/MoneyMalibu/MKS/raw/master/%5BMM%5D%20-%20%5BNLDE%5D%20-%20MissionHelper.user.js
// @match        https://www.meldkamerspel.com/
// @grant        none
// ==/UserScript==

(function () {
    console.log("[MM] - [NLDE] - Missionhelper - START");
    Lightbox_Status();
})();

var MeldingNormaalVerwerken = false;
var MeldingTeamVerwerken = false;
var MeldingAfvullenEigenVerwerken = false;
var MeldingAfvullenTeamVerwerken = false;
function MeldingenVerwerken(){

    //Bepalen op welke tijden de meldingen verwerkt moeten worden
    MeldingNormaalVerwerken = false;
    MeldingTeamVerwerken = true;
}

function Lightbox_Status() {

    MeldingenVerwerken();

    console.log("Status controle");
    var x = document.getElementById("lightbox_box");
    if (window.getComputedStyle(x).display === "none") {
        console.log("Status lightbox: " + window.getComputedStyle(x).display);
        //Openen van een nieuw meldingsscherm
        var newMissions = document.getElementById("mission_list").getElementsByClassName("panel panel-default  mission_panel_red");
        //var teamMissions = document.getElementById("mission_list").getElementsByClassName("panel panel-default panel-success ");
        
        console.log("[MM] - [NLDE] - Missionhelper - Data verkregen")


        //Missie openen
        for(var x = 0; x < newMissions.length -1; x++){

            //normale meldingen openen
            let tmpMissionClass = newMissions[x].className.includes("panel-success");
            if (tmpMissionClass == false && MeldingNormaalVerwerken == true){
                var buttonid = newMissions[x].childNodes[0].childNodes[0].id;
                document.getElementById(buttonid).click();
                break;
            }
        }


        SendTeamMissions();
    }

    setTimeout(function () {
        Lightbox_Status();
    }, 1000);
}

function SendTeamMissions() {
    var teamsMissions = document.getElementById("mission_list_alliance").getElementsByClassName("panel panel-default panel-success");
    //Missie openen, 1 voertuig sturen
    for(var x = 0; x < teamsMissions.length -1; x++){
        //normale meldingen openen
        let tmpMissionClass = teamsMissions[x].children[0].childNodes[2].className.includes("glyphicon glyphicon-user hidden");
        if (tmpMissionClass == false && MeldingTeamVerwerken == true){
            var buttonid = teamsMissions[x].childNodes[0].childNodes[0].id;
            document.getElementById(buttonid).click();
            break;
        }
    }
}