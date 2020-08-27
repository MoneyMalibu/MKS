// ==UserScript==
// @name         [MM] - [NLDE] - Dynamic AU button - BETA
// @namespace    http://tampermonkey.net/
// @version      2020.08.27.00.10
// @description  try to take over the world!
// @author       You
// @updateRL     https://github.com/MoneyMalibu/Meldkamer/raw/master/%5BMM%5D%20-%20%5BNL%5D%5BDE%5D%20-%20Missiehelper%20-%20NEW.user.js
// @downloadURL  https://github.com/MoneyMalibu/Meldkamer/raw/master/%5BMM%5D%20-%20%5BNL%5D%5BDE%5D%20-%20Missiehelper%20-%20NEW.user.js
// @match        https://www.meldkamerspel.com/missions/*
// @grant        none
// ==/UserScript==

var VoertuigenDefinitie;

// Ophalen van de missie data
var GameMissieData;

(function () {
    console.log("MKS [NL] - [MM] - Gestart");

    // NL Voertuigen inladen
    VoertuigenDefinitie = [];
    LoadNLVoertuigen();
    console.log("[MM] - MKS - AU Dynamic - Voertuigen geladen");

    //Voertuigen onderweg
    LoadIncCars();
    console.log("[MM] - MKS - AU Dynamic - Voertuigen inladen onderweg/terplaatsen");

    try {
        console.log("Kijken of data er staat");
        console.log(JSON.parse(localStorage["NLMissions"]));
        GameMissieData = JSON.parse(localStorage["NLMissions"]);
        console.log("[MM] - MKS - AU Dynamic - Data aanwezig");
    } catch (err) {
        console.log("[MM] - MKS - AU Dynamic - Data NIET aanwezig");
        GetMissionList();
    }

    //Button toevoegen
    $('#aao_category_1').append('<tr><td><button class="btn btn-xs btn-default" id="MissieAfvullen">Missie Afvullen</button></td></tr>');

    $('#MissieAfvullen').on('click', function (e) {
        console.log("[MM] - MKS - AU Dynamic - Afvullen click");
        SelectVoertuigen();
    });
})();

function SelectVoertuigen() {
    var help = $("#navbar-right-help-button");
    var HelpButton = help.find("a[id*='mission_help']").parent().parent().parent();
    let missionId = $('#mission_help').attr('href').split("/").pop().replace(/\?.*/, '');
    console.log("[MM] - MKS - AU Dynamic - Missie nummer: " + missionId);


    for (var i = 0; i < GameMissieData.length; i++) {
        if (GameMissieData[i].id == missionId) {

            let ALLSET = 1;
            for (var c in GameMissieData[i].requirements) {
                //Voertuig informatie
                let VoertuigType = c;
                let VoertuigAantal = GameMissieData[i].requirements[c];
                console.log(c);
                console.log(GameMissieData[i].requirements[c]);

                let TotaalMissieAanwezig = 0;
                for (var v = 0; v < VoertuigenDefinitie.length; v++) {
                    if (VoertuigenDefinitie[v][2] == VoertuigType) {
                        TotaalMissieAanwezig += VoertuigenDefinitie[v][3];
                    }
                }
                console.log("[MM] - MKS - AU Dynamic - Totaal naar melding onderweg: " + TotaalMissieAanwezig);

                if (TotaalMissieAanwezig < VoertuigAantal) {
                    console.log("[MM] - MKS - AU Dynamic - Stuur extra voertuigen");
                    let NieuweNodig = VoertuigAantal - TotaalMissieAanwezig;
                    let NewSetCount = 0;

                    $('#vehicle_show_table_all tbody tr').map(function () {
                        var $row = $(this);
                        $(this).closest('td').find(':checkbox').prop('checked', true);

                        var checkboxid = this.childNodes[1].firstElementChild.id;
                        var autoid = this.childNodes[5].attributes["0"].nodeValue;

                        for (var v = 0; v < VoertuigenDefinitie.length; v++) {
                            if (VoertuigenDefinitie[v][0] == autoid) {
                                if (VoertuigenDefinitie[v][2] == VoertuigType) {
                                    if (NewSetCount < NieuweNodig) {
                                        document.getElementById(checkboxid).checked = true;
                                        NewSetCount += 1;
                                    }
                                }
                            }
                        }
                    })

                    if (NewSetCount < NieuweNodig) {
                        ALLSET = 0;
                    }
                }

            }
            var tag = document.getElementById("MissieAfvullen");
            if (ALLSET == 1) {
                tag.style.background = "green";
            } else {
                tag.style.background = "red";
            }
        }
    }
}

function GetMissionList() {
    $.getJSON('https://www.meldkamerspel.com/einsaetze.json', function (data) {
        //data is the JSON string
        GameMissieData = data;
        console.log("[MM] - MKS - AU Dynamic - Game Data ingeladen");
        //local storage
        localStorage["NLMissions"] = JSON.stringify(GameMissieData);
        console.log(JSON.parse(localStorage["NLMissions"]));
    });
}


function SetAuto(AutoID) {
    var Checked = false;

    $('#vehicle_show_table_all tbody tr').map(function () {
        var $row = $(this);
        $(this).closest('td').find(':checkbox').prop('checked', true);

        var checkboxid = this.childNodes[1].firstElementChild.id;
        var autoid = this.childNodes[5].attributes["0"].nodeValue;

        if (autoid == AutoID) {
            if (Checked === false) {
                var all = document.getElementById(checkboxid);
                if (all.checked === false) {
                    all.checked = true;
                    Checked = true;
                    return true;
                }
            }
        }
    });

    if (Checked === true) {
        return true;
    } else {
        return false;
    }
};

function LoadNLVoertuigen() {
    //GameVersie defenitie [NL]
    VoertuigenDefinitie[0] = [];
    VoertuigenDefinitie[0][0] = 0; //ID Voertuig
    VoertuigenDefinitie[0][1] = 'SI-2'; //Voertuig naam
    VoertuigenDefinitie[0][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[0][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[1] = [];
    VoertuigenDefinitie[1][0] = 9; //ID Voertuig
    VoertuigenDefinitie[1][1] = 'TS 4/5'; //Voertuig naam
    VoertuigenDefinitie[1][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[1][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[2] = [];
    VoertuigenDefinitie[2][0] = 17; //ID Voertuig
    VoertuigenDefinitie[2][1] = 'TS 6/7'; //Voertuig naam
    VoertuigenDefinitie[2][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[2][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[3] = [];
    VoertuigenDefinitie[3][0] = 1; //ID Voertuig
    VoertuigenDefinitie[3][1] = 'TS 8/9'; //Voertuig naam
    VoertuigenDefinitie[3][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[3][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[4] = [];
    VoertuigenDefinitie[4][0] = 8; //ID Voertuig
    VoertuigenDefinitie[4][1] = 'TST 4/5'; //Voertuig naam
    VoertuigenDefinitie[4][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[4][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[5] = [];
    VoertuigenDefinitie[5][0] = 7; //ID Voertuig
    VoertuigenDefinitie[5][1] = 'TST 4/5'; //Voertuig naam
    VoertuigenDefinitie[5][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[5][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[6] = [];
    VoertuigenDefinitie[6][0] = 7; //ID Voertuig
    VoertuigenDefinitie[6][1] = 'TST 6/7'; //Voertuig naam
    VoertuigenDefinitie[6][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[6][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[7] = [];
    VoertuigenDefinitie[7][0] = 6; //ID Voertuig
    VoertuigenDefinitie[7][1] = 'TST 8/9'; //Voertuig naam
    VoertuigenDefinitie[7][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[7][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[8] = [];
    VoertuigenDefinitie[8][0] = 15; //ID Voertuig
    VoertuigenDefinitie[8][1] = 'TST-NB 4/5'; //Voertuig naam
    VoertuigenDefinitie[8][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[8][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[9] = [];
    VoertuigenDefinitie[9][0] = 14; //ID Voertuig
    VoertuigenDefinitie[9][1] = 'TST-NB 6/7'; //Voertuig naam
    VoertuigenDefinitie[9][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[9][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[10] = [];
    VoertuigenDefinitie[10][0] = 12; //ID Voertuig
    VoertuigenDefinitie[10][1] = 'TST-NB 8/9'; //Voertuig naam
    VoertuigenDefinitie[10][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[10][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[11] = [];
    VoertuigenDefinitie[11][0] = 34; //ID Voertuig
    VoertuigenDefinitie[11][1] = 'Watertankwagen'; //Voertuig naam
    VoertuigenDefinitie[11][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[11][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[12] = [];
    VoertuigenDefinitie[12][0] = 10; //ID Voertuig
    VoertuigenDefinitie[12][1] = 'Slangenwagen'; //Voertuig naam
    VoertuigenDefinitie[12][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[12][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[13] = [];
    VoertuigenDefinitie[13][0] = 2; //ID Voertuig
    VoertuigenDefinitie[13][1] = 'Autoladder'; //Voertuig naam
    VoertuigenDefinitie[13][2] = 'platform_trucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[13][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[14] = [];
    VoertuigenDefinitie[14][0] = 18; //ID Voertuig
    VoertuigenDefinitie[14][1] = 'Hoogwerker'; //Voertuig naam
    VoertuigenDefinitie[14][2] = 'platform_trucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks" 
    VoertuigenDefinitie[14][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[15] = [];
    VoertuigenDefinitie[15][0] = 4; //ID Voertuig
    VoertuigenDefinitie[15][1] = 'Hulpverleningsvoertuig'; //Voertuig naam
    VoertuigenDefinitie[15][2] = 'heavy_rescue_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[15][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[16] = [];
    VoertuigenDefinitie[16][0] = 3; //ID Voertuig
    VoertuigenDefinitie[16][1] = 'Officier van Dienst - Brandweer'; //Voertuig naam
    VoertuigenDefinitie[16][2] = 'battalion_chief_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[16][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[17] = [];
    VoertuigenDefinitie[17][0] = 19; //ID Voertuig
    VoertuigenDefinitie[17][1] = 'Hoofd Officier van Dienst - Brandweer'; //Voertuig naam
    VoertuigenDefinitie[17][2] = 'mobile_command_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[17][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[18] = [];
    VoertuigenDefinitie[18][0] = 31; //ID Voertuig
    VoertuigenDefinitie[18][1] = 'Commandovoertuig'; //Voertuig naam
    VoertuigenDefinitie[18][2] = 'elw3'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[18][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[19] = [];
    VoertuigenDefinitie[19][0] = 24; //ID Voertuig
    VoertuigenDefinitie[19][1] = 'Adviseur Gevaarlijke stoffen - Brandweer'; //Voertuig naam
    VoertuigenDefinitie[19][2] = 'hazmat_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[19][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[20] = [];
    VoertuigenDefinitie[20][0] = 5; //ID Voertuig
    VoertuigenDefinitie[20][1] = 'Adembeschermingsvoertuig'; //Voertuig naam
    VoertuigenDefinitie[20][2] = 'mobile_air_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[20][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[21] = [];
    VoertuigenDefinitie[21][0] = 11; //ID Voertuig
    VoertuigenDefinitie[21][1] = 'Dienstbus Verkenningseenheid Brandweer'; //Voertuig naam
    VoertuigenDefinitie[21][2] = 'gwmess'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[21][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[22] = [];
    VoertuigenDefinitie[22][0] = 21; //ID Voertuig
    VoertuigenDefinitie[22][1] = 'Dienstbus klein'; //Voertuig naam
    VoertuigenDefinitie[22][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[22][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[23] = [];
    VoertuigenDefinitie[23][0] = 20; //ID Voertuig
    VoertuigenDefinitie[23][1] = 'Dienstauto'; //Voertuig naam
    VoertuigenDefinitie[23][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[23][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[24] = [];
    VoertuigenDefinitie[24][0] = 56; //ID Voertuig
    VoertuigenDefinitie[24][1] = 'Dienstauto Voorlichter'; //Voertuig naam
    VoertuigenDefinitie[24][2] = 'spokesman'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[24][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[25] = [];
    VoertuigenDefinitie[25][0] = 43; //ID Voertuig
    VoertuigenDefinitie[25][1] = 'Crashtender (4x4)'; //Voertuig naam
    VoertuigenDefinitie[25][2] = 'arff'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[25][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[26] = [];
    VoertuigenDefinitie[26][0] = 42; //ID Voertuig
    VoertuigenDefinitie[26][1] = 'CT (6x6)'; //Voertuig naam
    VoertuigenDefinitie[26][2] = 'arff'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[26][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[27] = [];
    VoertuigenDefinitie[27][0] = 41; //ID Voertuig
    VoertuigenDefinitie[27][1] = 'CT (8x8)'; //Voertuig naam
    VoertuigenDefinitie[27][2] = 'arff'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[27][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[28] = [];
    VoertuigenDefinitie[28][0] = 44; //ID Voertuig
    VoertuigenDefinitie[28][1] = 'Airport Fire Officer / On Scene Commander'; //Voertuig naam
    VoertuigenDefinitie[28][2] = 'elw_airport'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[28][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[29] = [];
    VoertuigenDefinitie[29][0] = 33; //ID Voertuig
    VoertuigenDefinitie[29][1] = 'Waterongevallenvoertuig'; //Voertuig naam
    VoertuigenDefinitie[29][2] = 'diver_units'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[29][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[30] = [];
    VoertuigenDefinitie[30][0] = 36; //ID Voertuig
    VoertuigenDefinitie[30][1] = 'Waterongevallenaanhanger'; //Voertuig naam
    VoertuigenDefinitie[30][2] = 'boats'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[30][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[31] = [];
    VoertuigenDefinitie[31][0] = 49; //ID Voertuig
    VoertuigenDefinitie[31][1] = 'Materieelvoertuig - Oppervlakteredding'; //Voertuig naam
    VoertuigenDefinitie[31][2] = 'diver_units'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[31][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[32] = [];
    VoertuigenDefinitie[32][0] = 50; //ID Voertuig
    VoertuigenDefinitie[32][1] = 'Tankautospuit - Oppervlakteredding'; //Voertuig naam
    VoertuigenDefinitie[32][2] = 'diver_units'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[32][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[33] = [];
    VoertuigenDefinitie[33][0] = 16; //ID Voertuig
    VoertuigenDefinitie[33][1] = 'Ambulance'; //Voertuig naam
    VoertuigenDefinitie[33][2] = 'possible_patient'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[33][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[34] = [];
    VoertuigenDefinitie[34][0] = 30; //ID Voertuig
    VoertuigenDefinitie[34][1] = 'Zorgambulance'; //Voertuig naam
    VoertuigenDefinitie[34][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[34][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[35] = [];
    VoertuigenDefinitie[35][0] = 38; //ID Voertuig
    VoertuigenDefinitie[35][1] = 'Officier van Dienst Geneeskunde'; //Voertuig naam
    VoertuigenDefinitie[35][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[35][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[36] = [];
    VoertuigenDefinitie[36][0] = 52; //ID Voertuig
    VoertuigenDefinitie[36][1] = 'Rapid Responder'; //Voertuig naam
    VoertuigenDefinitie[36][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[36][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[37] = [];
    VoertuigenDefinitie[37][0] = 57; //ID Voertuig
    VoertuigenDefinitie[37][1] = 'Dienstvoertuig Officier van Dienst-Geneeskundig/Rapid Responder'; //Voertuig naam
    VoertuigenDefinitie[37][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[37][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[38] = [];
    VoertuigenDefinitie[38][0] = 22; //ID Voertuig
    VoertuigenDefinitie[38][1] = 'Dienstauto Noodhulp'; //Voertuig naam
    VoertuigenDefinitie[38][2] = 'police_cars'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[38][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[39] = [];
    VoertuigenDefinitie[39][0] = 25; //ID Voertuig
    VoertuigenDefinitie[39][1] = 'Dienstbus Noodhulp'; //Voertuig naam
    VoertuigenDefinitie[39][2] = 'police_cars'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[39][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[40] = [];
    VoertuigenDefinitie[40][0] = 46; //ID Voertuig
    VoertuigenDefinitie[40][1] = 'Dienstmotor Noodhulp'; //Voertuig naam
    VoertuigenDefinitie[40][2] = 'police_cars'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[40][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[41] = [];
    VoertuigenDefinitie[41][0] = 35; //ID Voertuig
    VoertuigenDefinitie[41][1] = 'Officier van Dienst - Politie'; //Voertuig naam
    VoertuigenDefinitie[41][2] = 'ovdp'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[41][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[42] = [];
    VoertuigenDefinitie[42][0] = 39; //ID Voertuig
    VoertuigenDefinitie[42][1] = 'ME Commandovoetuig'; //Voertuig naam
    VoertuigenDefinitie[42][2] = 'lebefkw'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[42][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[43] = [];
    VoertuigenDefinitie[43][0] = 40; //ID Voertuig
    VoertuigenDefinitie[43][1] = 'ME Flexbus'; //Voertuig naam
    VoertuigenDefinitie[43][2] = 'grukw'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[43][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[44] = [];
    VoertuigenDefinitie[44][0] = 47; //ID Voertuig
    VoertuigenDefinitie[44][1] = 'DA Hondengeleider'; //Voertuig naam
    VoertuigenDefinitie[44][2] = 'hondengeleider'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[44][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[45] = [];
    VoertuigenDefinitie[45][0] = 48; //ID Voertuig
    VoertuigenDefinitie[45][1] = 'DB Hondengeleider'; //Voertuig naam
    VoertuigenDefinitie[45][2] = 'hondengeleider'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[45][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[46] = [];
    VoertuigenDefinitie[46][0] = 53; //ID Voertuig
    VoertuigenDefinitie[46][1] = 'AT-C'; //Voertuig naam
    VoertuigenDefinitie[46][2] = 'at_c'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[46][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[47] = [];
    VoertuigenDefinitie[47][0] = 54; //ID Voertuig
    VoertuigenDefinitie[47][1] = 'AT-O'; //Voertuig naam
    VoertuigenDefinitie[47][2] = 'at_o'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[47][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[48] = [];
    VoertuigenDefinitie[48][0] = 55; //ID Voertuig
    VoertuigenDefinitie[48][1] = 'AT-M'; //Voertuig naam
    VoertuigenDefinitie[48][2] = 'at_m'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[48][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[49] = [];
    VoertuigenDefinitie[49][0] = 28; //ID Voertuig
    VoertuigenDefinitie[49][1] = 'ZULU'; //Voertuig naam
    VoertuigenDefinitie[49][2] = 'police_helicopters'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[49][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[50] = [];
    VoertuigenDefinitie[50][0] = 27; //ID Voertuig
    VoertuigenDefinitie[50][1] = 'Adembeschermingshaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[50][2] = 'mobile_air_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[50][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[51] = [];
    VoertuigenDefinitie[51][0] = 29; //ID Voertuig
    VoertuigenDefinitie[51][1] = 'Watertankhaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[51][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[51][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[52] = [];
    VoertuigenDefinitie[52][0] = 32; //ID Voertuig
    VoertuigenDefinitie[52][1] = 'Commandohaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[52][2] = 'elw3'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[52][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[53] = [];
    VoertuigenDefinitie[53][0] = 45; //ID Voertuig
    VoertuigenDefinitie[53][1] = 'Dompelpomphaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[53][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[53][3] = 0; //Aantal onderweg

    VoertuigenDefinitie[54] = [];
    VoertuigenDefinitie[54][0] = 51; //ID Voertuig
    VoertuigenDefinitie[54][1] = 'Hulpverleningshaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[54][2] = 'heavy_rescue_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[54][3] = 0; //Aantal onderweg

}

function LoadIncCars() {
    // mission_vehicle_driving
    // mission_vehicle_at_mission
    $('#mission_vehicle_at_mission tbody tr').map(function () {
        var $row = $(this);
        try {
            var incID = $row.context.childNodes[3].innerHTML;
            var tmp = $(incID).attr('vehicle_type_id');
            var number = $(incID).attr('vehicle_type_id'); // /vehicle_type_id="(\d)"/.exec(incID)[1];
            console.log(number); //outputs the number
            number = parseInt(number);
            console.log('VoertuigID = ' + number);

            for (var i = 0; i < VoertuigenDefinitie.length; i++) {
                if (VoertuigenDefinitie[i][0] == number) {
                    console.log("Voertuigen onderweg = " + VoertuigenDefinitie[i][3]);
                    VoertuigenDefinitie[i][3] += 1;
                    console.log("Úpdate Voertuigen onderweg = " + VoertuigenDefinitie[i][3]);
                }
            }
        }
        catch (err) {
        }
    });
    $('#mission_vehicle_driving tbody tr').map(function () {
        var $row = $(this);
        try {
            var incID = $row.context.childNodes[3].innerHTML;
            var tmp = $(incID).attr('vehicle_type_id');
            var number = $(incID).attr('vehicle_type_id'); // /vehicle_type_id="(\d)"/.exec(incID)[1];
            console.log(number); //outputs the number
            number = parseInt(number);
            console.log('VoertuigID = ' + number);

            for (var i = 0; i < VoertuigenDefinitie.length; i++) {
                if (VoertuigenDefinitie[i][0] == number) {
                    console.log("Voertuigen onderweg = " + VoertuigenDefinitie[i][3]);
                    VoertuigenDefinitie[i][3] += 1;
                    console.log("Úpdate Voertuigen onderweg = " + VoertuigenDefinitie[i][3]);
                }
            }
        }
        catch (err) {
        }
    });

};
