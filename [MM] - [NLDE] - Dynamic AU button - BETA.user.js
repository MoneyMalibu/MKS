// ==UserScript==
// @name         [MM] - [NLDE] - Dynamic AU button - BETA
// @namespace    http://tampermonkey.net/
// @version      2021.03.08.00.02
// @description  try to take over the world!
// @author       You
// @downloadURL  https://github.com/MoneyMalibu/MKS/raw/master/%5BMM%5D%20-%20%5BNLDE%5D%20-%20Dynamic%20AU%20button%20-%20BETA.user.js
// @match        https://www.meldkamerspel.com/missions/*
// @grant        none
// ==/UserScript==

var VoertuigenDefinitie;
var VoertuigenWaterAanboord;
var VoertuigenWaterVersterking;

// Ophalen van de missie data
var GameMissieData;

(function () {
    console.log("MKS [NL] - [MM] - Gestart");

    // NL Voertuigen inladen
    VoertuigenDefinitie = [];
    VoertuigenWaterAanboord = [];
    VoertuigenWaterVersterking = [];
    LoadVoertuigen();
    console.log("[MM] - MKS - AU Dynamic - Voertuigen geladen");

    //Voertuigen onderweg
    LoadIncCars();
    console.log("[MM] - MKS - AU Dynamic - Voertuigen inladen onderweg/terplaatsen");

    try {
        console.log("Kijken of data er staat");
        console.log(JSON.parse(localStorage["NLMissions"]));
        GameMissieData = JSON.parse(localStorage["NLMissions"]);
        console.log("[MM] - MKS - AU Dynamic - Data aanwezig");
        GetMissionList();
    } catch (err) {
        console.log("[MM] - MKS - AU Dynamic - Data NIET aanwezig");
        GetMissionList();
    }

    //Button toevoegen
    $('#container_navbar_alarm').append('<tr><td><button class="btn btn-xs btn-default" id="MissieAfvullen">Missie Afvullen</button></td></tr>');

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

    var MissingVoertuigen = document.getElementById("missing_text")
    MissingVoertuigen.innerHTML = " ";
    document.getElementById("missing_text").style.display = "block";


    for (var i = 0; i < GameMissieData.length; i++) {
        if (GameMissieData[i].id == missionId) {

            let ALLSET = 1;
            for (var c in GameMissieData[i].requirements) {
                //Voertuig informatie
                let VoertuigType = c;
                let VoertuigAantal = GameMissieData[i].requirements[c];
                console.log(c);
                console.log(GameMissieData[i].requirements[c]);


                if (c === 'water_needed') {

                    let WaterAanwezig = 0;

                    for (var w = 0; w < VoertuigenWaterAanboord.length; w++) {
                        WaterAanwezig += VoertuigenDefinitie[VoertuigenWaterAanboord[w][0]][3] * VoertuigenWaterAanboord[w][1];
                    }

                    let WaterVersterking = 0;
                    for (var wv = 0; wv < VoertuigenWaterVersterking.length; wv++) {
                        WaterVersterking += WaterAanwezig * (VoertuigenWaterVersterking[wv][1] / 100) * VoertuigenDefinitie[VoertuigenWaterVersterking[wv][0]][3];
                    }

                    let ExtraWaterNodig = VoertuigAantal - WaterAanwezig - WaterVersterking

                    $('#vehicle_show_table_all tbody tr').map(function () {
                        var $row = $(this);
                        $(this).closest('td').find(':checkbox').prop('checked', true);

                        var checkboxid = this.childNodes[1].firstElementChild.id;
                        var autoid = this.childNodes[5].attributes["0"].nodeValue;

                        if (ExtraWaterNodig > 0) {
                            for (var w = 0; w < VoertuigenWaterAanboord.length; w++) {
                                if (VoertuigenWaterAanboord[w][0] == autoid) {
                                    document.getElementById(checkboxid).checked = true;
                                    ExtraWaterNodig = ExtraWaterNodig - VoertuigenWaterAanboord[w][1];
                                    WaterAanwezig += VoertuigenWaterAanboord[w][1];
                                }
                            }

                            for (var w = 0; w < VoertuigenWaterVersterking.length; w++) {
                                if (VoertuigenWaterVersterking[w][0] == autoid) {
                                    document.getElementById(checkboxid).checked = true;
                                    let NieuweWaterVersterking = (WaterAanwezig * (VoertuigenWaterVersterking[w][1] / 100))
                                    ExtraWaterNodig = ExtraWaterNodig - NieuweWaterVersterking;
                                }
                            }
                        }
                    })


                    if (ExtraWaterNodig > 0) {
                        ALLSET = 0;
                    }


                } else if (c === 'battalion_chief_vehicles') {
                    let ovd_HovD = VoertuigenDefinitie[3][3];
                    ovd_HovD += VoertuigenDefinitie[19][3];

                    let NieuweNodig = VoertuigAantal - ovd_HovD;
                    let NewSetCount = 0;

                    $('#vehicle_show_table_all tbody tr').map(function () {
                        var $row = $(this);
                        $(this).closest('td').find(':checkbox').prop('checked', true);

                        var checkboxid = this.childNodes[1].firstElementChild.id;
                        var autoid = this.childNodes[5].attributes["0"].nodeValue;

                        for (var v = 0; v < VoertuigenDefinitie.length; v++) {
                            if (VoertuigenDefinitie[v][0] == autoid) {
                                if (VoertuigenDefinitie[v][2] == 'battalion_chief_vehicles') {
                                    if (NewSetCount < NieuweNodig) {
                                        document.getElementById(checkboxid).checked = true;
                                        VoertuigenDefinitie[v][3] += 1;
                                        NewSetCount += 1;
                                    }
                                }
                                if (VoertuigenDefinitie[v][2] == 'mobile_command_vehicles') {
                                    if (NewSetCount < NieuweNodig) {
                                        document.getElementById(checkboxid).checked = true;
                                        VoertuigenDefinitie[v][3] += 1;
                                        NewSetCount += 1;
                                    }
                                }
                            }
                        }
                    })
                    
                    if (NewSetCount < NieuweNodig) {
                        ALLSET = 0;
                        MissingVoertuigen.innerHTML += "<br> Geen - OVD/HOD";
                    }

                } else if (c != 'battalion_chief_vehicles') {

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
                            MissingVoertuigen.innerHTML += "<br> Geen - " + VoertuigType;
                        }
                    }

                }
            }

            for (var c in GameMissieData[i].additional) {

                if (c === 'possible_patient') {

                    // Ambulance sturen

                    let VoertuigType = c;
                    let VoertuigAantal = GameMissieData[i].additional[c];

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
                            MissingVoertuigen.innerHTML += "<br> Geen - " + VoertuigType;
                        }
                    }

                    if (VoertuigAantal > 2) {
                        // OVD-G sturen
                        VoertuigType = "OVD-G";
                        VoertuigAantal = 1;

                        TotaalMissieAanwezig = 0;
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
                                MissingVoertuigen.innerHTML += "<br> Geen - " + VoertuigType;
                            }
                        }
                    }
                }
            }

            for (var c in GameMissieData[i].chances) {

                if (c === 'nef') {

                    // MMT Sturen

                    let VoertuigType = c;
                    let VoertuigAantal = 1;

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
                            MissingVoertuigen.innerHTML += "<br> Geen - " + VoertuigType;
                        }
                    }
                }
            }


            var tag = document.getElementById("MissieAfvullen");
            if (ALLSET == 1) {
                tag.style.background = "green";
            } else {
                tag.style.background = "red";
                try {
                    var node = document.getElementsByClassName("btn btn-xs btn-warning missing_vehicles_load btn-block");
                    node[0].click();
                } catch (err) { }
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

function LoadVoertuigen() {
    //GameVersie defenitie [NL]
    VoertuigenDefinitie[0] = [];
    VoertuigenDefinitie[0][0] = 0; //ID Voertuig
    VoertuigenDefinitie[0][1] = 'SI-2'; //Voertuig naam
    VoertuigenDefinitie[0][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[0][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[0][4] = "NL"; // GameVersie

    VoertuigenDefinitie[1] = [];
    VoertuigenDefinitie[1][0] = 1; //ID Voertuig
    VoertuigenDefinitie[1][1] = 'TS 8/9'; //Voertuig naam
    VoertuigenDefinitie[1][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[1][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[1][4] = "NL"; // GameVersie

    VoertuigenDefinitie[2] = [];
    VoertuigenDefinitie[2][0] = 2; //ID Voertuig
    VoertuigenDefinitie[2][1] = 'Autoladder'; //Voertuig naam
    VoertuigenDefinitie[2][2] = 'platform_trucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[2][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[2][4] = "NL"; // GameVersie

    VoertuigenDefinitie[3] = [];
    VoertuigenDefinitie[3][0] = 3; //ID Voertuig
    VoertuigenDefinitie[3][1] = 'Officier van Dienst - Brandweer'; //Voertuig naam
    VoertuigenDefinitie[3][2] = 'battalion_chief_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[3][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[3][4] = "NL"; // GameVersie

    VoertuigenDefinitie[4] = [];
    VoertuigenDefinitie[4][0] = 4; //ID Voertuig
    VoertuigenDefinitie[4][1] = 'Hulpverleningsvoertuig'; //Voertuig naam
    VoertuigenDefinitie[4][2] = 'heavy_rescue_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[4][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[4][4] = "NL"; // GameVersie

    VoertuigenDefinitie[5] = [];
    VoertuigenDefinitie[5][0] = 5; //ID Voertuig
    VoertuigenDefinitie[5][1] = 'Adembeschermingsvoertuig'; //Voertuig naam
    VoertuigenDefinitie[5][2] = 'mobile_air_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[5][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[5][4] = "NL"; // GameVersie

    VoertuigenDefinitie[6] = [];
    VoertuigenDefinitie[6][0] = 6; //ID Voertuig
    VoertuigenDefinitie[6][1] = 'TST 8/9'; //Voertuig naam
    VoertuigenDefinitie[6][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[6][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[6][4] = "NL"; // GameVersie

    VoertuigenDefinitie[7] = [];
    VoertuigenDefinitie[7][0] = 7; //ID Voertuig
    VoertuigenDefinitie[7][1] = 'TST 6/7'; //Voertuig naam
    VoertuigenDefinitie[7][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[7][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[7][4] = "NL"; // GameVersie

    VoertuigenDefinitie[8] = [];
    VoertuigenDefinitie[8][0] = 8; //ID Voertuig
    VoertuigenDefinitie[8][1] = 'TST 4/5'; //Voertuig naam
    VoertuigenDefinitie[8][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[8][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[8][4] = "NL"; // GameVersie

    VoertuigenDefinitie[9] = [];
    VoertuigenDefinitie[9][0] = 9; //ID Voertuig
    VoertuigenDefinitie[9][1] = 'TS 4/5'; //Voertuig naam
    VoertuigenDefinitie[9][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[9][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[9][4] = "NL"; // GameVersie

    VoertuigenDefinitie[10] = [];
    VoertuigenDefinitie[10][0] = 10; //ID Voertuig
    VoertuigenDefinitie[10][1] = 'Slangenwagen'; //Voertuig naam
    VoertuigenDefinitie[10][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[10][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[10][4] = "NL"; // GameVersie

    VoertuigenDefinitie[11] = [];
    VoertuigenDefinitie[11][0] = 11; //ID Voertuig
    VoertuigenDefinitie[11][1] = 'Dienstbus Verkenningseenheid Brandweer'; //Voertuig naam
    VoertuigenDefinitie[11][2] = 'gwmess'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[11][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[11][4] = "NL"; // GameVersie

    VoertuigenDefinitie[12] = [];
    VoertuigenDefinitie[12][0] = 12; //ID Voertuig
    VoertuigenDefinitie[12][1] = 'TST-NB 8/9'; //Voertuig naam
    VoertuigenDefinitie[12][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[12][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[12][4] = "NL"; // GameVersie

    VoertuigenDefinitie[13] = [];
    VoertuigenDefinitie[13][0] = 13; //ID Voertuig
    VoertuigenDefinitie[13][1] = 'NIKS'; //Voertuig naam
    VoertuigenDefinitie[13][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[13][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[13][4] = "NL"; // GameVersie

    VoertuigenDefinitie[14] = [];
    VoertuigenDefinitie[14][0] = 14; //ID Voertuig
    VoertuigenDefinitie[14][1] = 'TST-NB 6/7'; //Voertuig naam
    VoertuigenDefinitie[14][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[14][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[14][4] = "NL"; // GameVersie

    VoertuigenDefinitie[15] = [];
    VoertuigenDefinitie[15][0] = 15; //ID Voertuig
    VoertuigenDefinitie[15][1] = 'TST-NB 4/5'; //Voertuig naam
    VoertuigenDefinitie[15][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[15][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[15][4] = "NL"; // GameVersie

    VoertuigenDefinitie[16] = [];
    VoertuigenDefinitie[16][0] = 16; //ID Voertuig
    VoertuigenDefinitie[16][1] = 'Ambulance'; //Voertuig naam
    VoertuigenDefinitie[16][2] = 'possible_patient'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[16][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[16][4] = "NL"; // GameVersie

    VoertuigenDefinitie[17] = [];
    VoertuigenDefinitie[17][0] = 17; //ID Voertuig
    VoertuigenDefinitie[17][1] = 'TS 6/7'; //Voertuig naam
    VoertuigenDefinitie[17][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[17][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[17][4] = "NL"; // GameVersie

    VoertuigenDefinitie[18] = [];
    VoertuigenDefinitie[18][0] = 18; //ID Voertuig
    VoertuigenDefinitie[18][1] = 'Hoogwerker'; //Voertuig naam
    VoertuigenDefinitie[18][2] = 'platform_trucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks" 
    VoertuigenDefinitie[18][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[18][4] = "NL"; // GameVersie

    VoertuigenDefinitie[19] = [];
    VoertuigenDefinitie[19][0] = 19; //ID Voertuig
    VoertuigenDefinitie[19][1] = 'Hoofd Officier van Dienst - Brandweer'; //Voertuig naam
    VoertuigenDefinitie[19][2] = 'mobile_command_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[19][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[19][4] = "NL"; // GameVersie

    VoertuigenDefinitie[20] = [];
    VoertuigenDefinitie[20][0] = 20; //ID Voertuig
    VoertuigenDefinitie[20][1] = 'Dienstauto'; //Voertuig naam
    VoertuigenDefinitie[20][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[20][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[20][4] = "NL"; // GameVersie

    VoertuigenDefinitie[21] = [];
    VoertuigenDefinitie[21][0] = 21; //ID Voertuig
    VoertuigenDefinitie[21][1] = 'Dienstbus klein'; //Voertuig naam
    VoertuigenDefinitie[21][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[21][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[21][4] = "NL"; // GameVersie

    VoertuigenDefinitie[22] = [];
    VoertuigenDefinitie[22][0] = 22; //ID Voertuig
    VoertuigenDefinitie[22][1] = 'Dienstauto Noodhulp'; //Voertuig naam
    VoertuigenDefinitie[22][2] = 'police_cars'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[22][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[22][4] = "NL"; // GameVersie

    VoertuigenDefinitie[23] = [];
    VoertuigenDefinitie[23][0] = 23; //ID Voertuig
    VoertuigenDefinitie[23][1] = 'LifeLiner'; //Voertuig naam
    VoertuigenDefinitie[23][2] = 'nef'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[23][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[23][4] = "NL"; // GameVersie

    VoertuigenDefinitie[24] = [];
    VoertuigenDefinitie[24][0] = 24; //ID Voertuig
    VoertuigenDefinitie[24][1] = 'Adviseur Gevaarlijke stoffen - Brandweer'; //Voertuig naam
    VoertuigenDefinitie[24][2] = 'hazmat_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[24][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[24][4] = "NL"; // GameVersie

    VoertuigenDefinitie[25] = [];
    VoertuigenDefinitie[25][0] = 25; //ID Voertuig
    VoertuigenDefinitie[25][1] = 'Dienstbus Noodhulp'; //Voertuig naam
    VoertuigenDefinitie[25][2] = 'police_cars'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[25][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[25][4] = "NL"; // GameVersie

    VoertuigenDefinitie[26] = [];
    VoertuigenDefinitie[26][0] = 26; //ID Voertuig
    VoertuigenDefinitie[26][1] = 'NIKS'; //Voertuig naam
    VoertuigenDefinitie[26][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[26][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[26][4] = "NL"; // GameVersie

    VoertuigenDefinitie[27] = [];
    VoertuigenDefinitie[27][0] = 27; //ID Voertuig
    VoertuigenDefinitie[27][1] = 'Adembeschermingshaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[27][2] = 'mobile_air_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[27][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[27][4] = "NL"; // GameVersie

    VoertuigenDefinitie[28] = [];
    VoertuigenDefinitie[28][0] = 28; //ID Voertuig
    VoertuigenDefinitie[28][1] = 'ZULU'; //Voertuig naam
    VoertuigenDefinitie[28][2] = 'police_helicopters'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[28][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[28][4] = "NL"; // GameVersie

    VoertuigenDefinitie[29] = [];
    VoertuigenDefinitie[29][0] = 29; //ID Voertuig
    VoertuigenDefinitie[29][1] = 'Watertankhaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[29][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[29][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[29][4] = "NL"; // GameVersie

    VoertuigenDefinitie[30] = [];
    VoertuigenDefinitie[30][0] = 30; //ID Voertuig
    VoertuigenDefinitie[30][1] = 'Zorgambulance'; //Voertuig naam
    VoertuigenDefinitie[30][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[30][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[30][4] = "NL"; // GameVersie

    VoertuigenDefinitie[31] = [];
    VoertuigenDefinitie[31][0] = 31; //ID Voertuig
    VoertuigenDefinitie[31][1] = 'Commandovoertuig'; //Voertuig naam
    VoertuigenDefinitie[31][2] = 'elw3'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[31][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[31][4] = "NL"; // GameVersie

    VoertuigenDefinitie[32] = [];
    VoertuigenDefinitie[32][0] = 32; //ID Voertuig
    VoertuigenDefinitie[32][1] = 'Commandohaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[32][2] = 'elw3'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[32][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[32][4] = "NL"; // GameVersie

    VoertuigenDefinitie[33] = [];
    VoertuigenDefinitie[33][0] = 33; //ID Voertuig
    VoertuigenDefinitie[33][1] = 'Waterongevallenvoertuig'; //Voertuig naam
    VoertuigenDefinitie[33][2] = 'diver_units'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[33][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[33][4] = "NL"; // GameVersie

    VoertuigenDefinitie[34] = [];
    VoertuigenDefinitie[34][0] = 34; //ID Voertuig
    VoertuigenDefinitie[34][1] = 'Watertankwagen'; //Voertuig naam
    VoertuigenDefinitie[34][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[34][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[34][4] = "NL"; // GameVersie

    VoertuigenDefinitie[35] = [];
    VoertuigenDefinitie[35][0] = 35; //ID Voertuig
    VoertuigenDefinitie[35][1] = 'Officier van Dienst - Politie'; //Voertuig naam
    VoertuigenDefinitie[35][2] = 'ovdp'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[35][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[35][4] = "NL"; // GameVersie

    VoertuigenDefinitie[36] = [];
    VoertuigenDefinitie[36][0] = 36; //ID Voertuig
    VoertuigenDefinitie[36][1] = 'Waterongevallenaanhanger'; //Voertuig naam
    VoertuigenDefinitie[36][2] = 'boats'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[36][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[36][4] = "NL"; // GameVersie

    VoertuigenDefinitie[37] = [];
    VoertuigenDefinitie[37][0] = 37; //ID Voertuig
    VoertuigenDefinitie[37][1] = 'MMT-Auto'; //Voertuig naam
    VoertuigenDefinitie[37][2] = 'nef'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[37][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[37][4] = "NL"; // GameVersie

    VoertuigenDefinitie[38] = [];
    VoertuigenDefinitie[38][0] = 38; //ID Voertuig
    VoertuigenDefinitie[38][1] = 'Officier van Dienst Geneeskunde'; //Voertuig naam
    VoertuigenDefinitie[38][2] = 'OVD-G'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[38][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[38][4] = "NL"; // GameVersie

    VoertuigenDefinitie[39] = [];
    VoertuigenDefinitie[39][0] = 39; //ID Voertuig
    VoertuigenDefinitie[39][1] = 'ME Commandovoetuig'; //Voertuig naam
    VoertuigenDefinitie[39][2] = 'lebefkw'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[39][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[39][4] = "NL"; // GameVersie

    VoertuigenDefinitie[40] = [];
    VoertuigenDefinitie[40][0] = 40; //ID Voertuig
    VoertuigenDefinitie[40][1] = 'ME Flexbus'; //Voertuig naam
    VoertuigenDefinitie[40][2] = 'grukw'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[40][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[40][4] = "NL"; // GameVersie

    VoertuigenDefinitie[41] = [];
    VoertuigenDefinitie[41][0] = 41; //ID Voertuig
    VoertuigenDefinitie[41][1] = 'CT (8x8)'; //Voertuig naam
    VoertuigenDefinitie[41][2] = 'arff'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[41][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[41][4] = "NL"; // GameVersie

    VoertuigenDefinitie[42] = [];
    VoertuigenDefinitie[42][0] = 42; //ID Voertuig
    VoertuigenDefinitie[42][1] = 'CT (6x6)'; //Voertuig naam
    VoertuigenDefinitie[42][2] = 'arff'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[42][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[42][4] = "NL"; // GameVersie

    VoertuigenDefinitie[43] = [];
    VoertuigenDefinitie[43][0] = 43; //ID Voertuig
    VoertuigenDefinitie[43][1] = 'Crashtender (4x4)'; //Voertuig naam
    VoertuigenDefinitie[43][2] = 'arff'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[43][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[43][4] = "NL"; // GameVersie

    VoertuigenDefinitie[44] = [];
    VoertuigenDefinitie[44][0] = 44; //ID Voertuig
    VoertuigenDefinitie[44][1] = 'Airport Fire Officer / On Scene Commander'; //Voertuig naam
    VoertuigenDefinitie[44][2] = 'elw_airport'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[44][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[44][4] = "NL"; // GameVersie

    VoertuigenDefinitie[45] = [];
    VoertuigenDefinitie[45][0] = 45; //ID Voertuig
    VoertuigenDefinitie[45][1] = 'Dompelpomphaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[45][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[45][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[45][4] = "NL"; // GameVersie

    VoertuigenDefinitie[46] = [];
    VoertuigenDefinitie[46][0] = 46; //ID Voertuig
    VoertuigenDefinitie[46][1] = 'Dienstmotor Noodhulp'; //Voertuig naam
    VoertuigenDefinitie[46][2] = 'police_cars'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[46][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[46][4] = "NL"; // GameVersie

    VoertuigenDefinitie[47] = [];
    VoertuigenDefinitie[47][0] = 47; //ID Voertuig
    VoertuigenDefinitie[47][1] = 'DA Hondengeleider'; //Voertuig naam
    VoertuigenDefinitie[47][2] = 'hondengeleider'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[47][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[47][4] = "NL"; // GameVersie

    VoertuigenDefinitie[48] = [];
    VoertuigenDefinitie[48][0] = 48; //ID Voertuig
    VoertuigenDefinitie[48][1] = 'DB Hondengeleider'; //Voertuig naam
    VoertuigenDefinitie[48][2] = 'hondengeleider'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[48][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[48][4] = "NL"; // GameVersie

    VoertuigenDefinitie[49] = [];
    VoertuigenDefinitie[49][0] = 49; //ID Voertuig
    VoertuigenDefinitie[49][1] = 'Materieelvoertuig - Oppervlakteredding'; //Voertuig naam
    VoertuigenDefinitie[49][2] = 'diver_units'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[49][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[49][4] = "NL"; // GameVersie

    VoertuigenDefinitie[50] = [];
    VoertuigenDefinitie[50][0] = 50; //ID Voertuig
    VoertuigenDefinitie[50][1] = 'Tankautospuit - Oppervlakteredding'; //Voertuig naam
    VoertuigenDefinitie[50][2] = 'diver_units'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[50][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[50][4] = "NL"; // GameVersie

    VoertuigenDefinitie[51] = [];
    VoertuigenDefinitie[51][0] = 51; //ID Voertuig
    VoertuigenDefinitie[51][1] = 'Hulpverleningshaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[51][2] = 'heavy_rescue_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[51][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[51][4] = "NL"; // GameVersie

    VoertuigenDefinitie[52] = [];
    VoertuigenDefinitie[52][0] = 52; //ID Voertuig
    VoertuigenDefinitie[52][1] = 'Rapid Responder'; //Voertuig naam
    VoertuigenDefinitie[52][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[52][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[52][4] = "NL"; // GameVersie

    VoertuigenDefinitie[53] = [];
    VoertuigenDefinitie[53][0] = 53; //ID Voertuig
    VoertuigenDefinitie[53][1] = 'AT-C'; //Voertuig naam
    VoertuigenDefinitie[53][2] = 'at_c'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[53][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[53][4] = "NL"; // GameVersie

    VoertuigenDefinitie[54] = [];
    VoertuigenDefinitie[54][0] = 54; //ID Voertuig
    VoertuigenDefinitie[54][1] = 'AT-O'; //Voertuig naam
    VoertuigenDefinitie[54][2] = 'at_o'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[54][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[54][4] = "NL"; // GameVersie

    VoertuigenDefinitie[55] = [];
    VoertuigenDefinitie[55][0] = 55; //ID Voertuig
    VoertuigenDefinitie[55][1] = 'AT-M'; //Voertuig naam
    VoertuigenDefinitie[55][2] = 'at_m'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[55][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[55][4] = "NL"; // GameVersie

    VoertuigenDefinitie[56] = [];
    VoertuigenDefinitie[56][0] = 56; //ID Voertuig
    VoertuigenDefinitie[56][1] = 'Dienstauto Voorlichter'; //Voertuig naam
    VoertuigenDefinitie[56][2] = 'spokesman'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[56][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[56][4] = "NL"; // GameVersie

    VoertuigenDefinitie[57] = [];
    VoertuigenDefinitie[57][0] = 57; //ID Voertuig
    VoertuigenDefinitie[57][1] = 'Dienstvoertuig Officier van Dienst-Geneeskundig/Rapid Responder'; //Voertuig naam
    VoertuigenDefinitie[57][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[57][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[57][4] = "NL"; // GameVersie

    VoertuigenDefinitie[58] = [];
    VoertuigenDefinitie[58][0] = 58; //ID Voertuig
    VoertuigenDefinitie[58][1] = 'NIKS'; //Voertuig naam
    VoertuigenDefinitie[58][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[58][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[58][4] = "NL"; // GameVersie

    VoertuigenDefinitie[59] = [];
    VoertuigenDefinitie[59][0] = 59; //ID Voertuig
    VoertuigenDefinitie[59][1] = 'Noodhulp - Onopvallend'; //Voertuig naam
    VoertuigenDefinitie[59][2] = 'police_cars'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[59][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[59][4] = "NL"; // GameVersie

    VoertuigenDefinitie[60] = [];
    VoertuigenDefinitie[60][0] = 60; //ID Voertuig
    VoertuigenDefinitie[60][1] = 'Dienstbus Biketeam'; //Voertuig naam
    VoertuigenDefinitie[60][2] = 'bike_police'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[60][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[60][4] = "NL"; // GameVersie

    VoertuigenDefinitie[61] = [];
    VoertuigenDefinitie[61][0] = 61; //ID Voertuig
    VoertuigenDefinitie[61][1] = 'Slangenhaakarmbak'; //Voertuig naam
    VoertuigenDefinitie[61][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    VoertuigenDefinitie[61][3] = 0; //Aantal onderweg
    VoertuigenDefinitie[61][4] = "NL"; // GameVersie




    VoertuigenWaterAanboord[0] = [];
    VoertuigenWaterAanboord[0][0] = 0; //ID voertuig
    VoertuigenWaterAanboord[0][1] = 500; //Aantal Liters

    VoertuigenWaterAanboord[1] = [];
    VoertuigenWaterAanboord[1][0] = 1; //ID voertuig
    VoertuigenWaterAanboord[1][1] = 2000; //Aantal Liters

    VoertuigenWaterAanboord[2] = [];
    VoertuigenWaterAanboord[2][0] = 6; //ID voertuig
    VoertuigenWaterAanboord[2][1] = 3000; //Aantal Liters

    VoertuigenWaterAanboord[3] = [];
    VoertuigenWaterAanboord[3][0] = 7; //ID voertuig
    VoertuigenWaterAanboord[3][1] = 3000; //Aantal Liters

    VoertuigenWaterAanboord[4] = [];
    VoertuigenWaterAanboord[4][0] = 8; //ID voertuig
    VoertuigenWaterAanboord[4][1] = 2000; //Aantal Liters

    VoertuigenWaterAanboord[5] = [];
    VoertuigenWaterAanboord[5][0] = 9; //ID voertuig
    VoertuigenWaterAanboord[5][1] = 1500; //Aantal Liters

    VoertuigenWaterAanboord[6] = [];
    VoertuigenWaterAanboord[6][0] = 12; //ID voertuig
    VoertuigenWaterAanboord[6][1] = 4000; //Aantal Liters

    VoertuigenWaterAanboord[7] = [];
    VoertuigenWaterAanboord[7][0] = 14; //ID voertuig
    VoertuigenWaterAanboord[7][1] = 4000; //Aantal Liters

    VoertuigenWaterAanboord[8] = [];
    VoertuigenWaterAanboord[8][0] = 15; //ID voertuig
    VoertuigenWaterAanboord[8][1] = 4000; //Aantal Liters

    VoertuigenWaterAanboord[9] = [];
    VoertuigenWaterAanboord[9][0] = 17; //ID voertuig
    VoertuigenWaterAanboord[9][1] = 2000; //Aantal Liters

    VoertuigenWaterAanboord[10] = [];
    VoertuigenWaterAanboord[10][0] = 29; //ID voertuig
    VoertuigenWaterAanboord[10][1] = 10000; //Aantal Liters

    VoertuigenWaterAanboord[11] = [];
    VoertuigenWaterAanboord[11][0] = 34; //ID voertuig
    VoertuigenWaterAanboord[11][1] = 15000; //Aantal Liters

    VoertuigenWaterAanboord[12] = [];
    VoertuigenWaterAanboord[12][0] = 41; //ID voertuig
    VoertuigenWaterAanboord[12][1] = 13300; //Aantal Liters

    VoertuigenWaterAanboord[13] = [];
    VoertuigenWaterAanboord[13][0] = 42; //ID voertuig
    VoertuigenWaterAanboord[13][1] = 10000; //Aantal Liters

    VoertuigenWaterAanboord[14] = [];
    VoertuigenWaterAanboord[14][0] = 43; //ID voertuig
    VoertuigenWaterAanboord[14][1] = 6000; //Aantal Liters



    VoertuigenWaterVersterking[0] = [];
    VoertuigenWaterVersterking[0][0] = 10; //ID voertuig
    VoertuigenWaterVersterking[0][1] = 15; //Aantal % verhoging

    VoertuigenWaterVersterking[1] = [];
    VoertuigenWaterVersterking[1][0] = 45; //ID voertuig
    VoertuigenWaterVersterking[1][1] = 25; //Aantal % verhoging

    VoertuigenWaterVersterking[2] = [];
    VoertuigenWaterVersterking[2][0] = 61; //ID voertuig
    VoertuigenWaterVersterking[2][1] = 15; //Aantal % verhoging









    //GameVersie defenitie [DE]
    //     VoertuigenDefinitie[1000] = [];
    //     VoertuigenDefinitie[1000][0] = 0; //ID Voertuig
    //     VoertuigenDefinitie[1000][1] = 'LF 20'; //Voertuig naam
    //     VoertuigenDefinitie[1000][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1000][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1000][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1001] = [];
    //     VoertuigenDefinitie[1001][0] = 1; //ID Voertuig
    //     VoertuigenDefinitie[1001][1] = 'LF 10'; //Voertuig naam
    //     VoertuigenDefinitie[1001][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1001][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1001][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1002] = [];
    //     VoertuigenDefinitie[1002][0] = 2; //ID Voertuig
    //     VoertuigenDefinitie[1002][1] = 'DLK 23'; //Voertuig naam
    //     VoertuigenDefinitie[1002][2] = 'platform_trucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1002][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1002][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1003] = [];
    //     VoertuigenDefinitie[1003][0] = 3; //ID Voertuig
    //     VoertuigenDefinitie[1003][1] = 'ELW 1'; //Voertuig naam
    //     VoertuigenDefinitie[1003][2] = 'battalion_chief_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1003][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1003][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1004] = [];
    //     VoertuigenDefinitie[1004][0] = 4; //ID Voertuig
    //     VoertuigenDefinitie[1004][1] = 'RW'; //Voertuig naam
    //     VoertuigenDefinitie[1004][2] = 'heavy_rescue_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1004][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1004][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1005] = [];
    //     VoertuigenDefinitie[1005][0] = 5; //ID Voertuig
    //     VoertuigenDefinitie[1005][1] = 'GW-A'; //Voertuig naam
    //     VoertuigenDefinitie[1005][2] = 'mobile_air_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1005][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1005][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1006] = [];
    //     VoertuigenDefinitie[1006][0] = 6; //ID Voertuig
    //     VoertuigenDefinitie[1006][1] = 'LF 8/6'; //Voertuig naam
    //     VoertuigenDefinitie[1006][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1006][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1006][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1007] = [];
    //     VoertuigenDefinitie[1007][0] = 7; //ID Voertuig
    //     VoertuigenDefinitie[1007][1] = 'LF 20/16'; //Voertuig naam
    //     VoertuigenDefinitie[1007][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1007][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1007][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1008] = [];
    //     VoertuigenDefinitie[1008][0] = 8; //ID Voertuig
    //     VoertuigenDefinitie[1008][1] = 'LF 10/6'; //Voertuig naam
    //     VoertuigenDefinitie[1008][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1008][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1008][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1009] = [];
    //     VoertuigenDefinitie[1009][0] = 9; //ID Voertuig
    //     VoertuigenDefinitie[1009][1] = 'LF 16-TS'; //Voertuig naam
    //     VoertuigenDefinitie[1009][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1009][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1009][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1010] = [];
    //     VoertuigenDefinitie[1010][0] = 10; //ID Voertuig
    //     VoertuigenDefinitie[1010][1] = 'GW-Öl'; //Voertuig naam
    //     VoertuigenDefinitie[1010][2] = 'gwoil'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1010][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1010][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1011] = [];
    //     VoertuigenDefinitie[1011][0] = 11; //ID Voertuig
    //     VoertuigenDefinitie[1011][1] = 'GW-L2-Wasser'; //Voertuig naam
    //     VoertuigenDefinitie[1011][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1011][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1011][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1012] = [];
    //     VoertuigenDefinitie[1012][0] = 12; //ID Voertuig
    //     VoertuigenDefinitie[1012][1] = 'GW-Messtechnik'; //Voertuig naam
    //     VoertuigenDefinitie[1012][2] = 'gwmess'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1012][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1012][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1013] = [];
    //     VoertuigenDefinitie[1013][0] = 13; //ID Voertuig
    //     VoertuigenDefinitie[1013][1] = 'SW 1000'; //Voertuig naam
    //     VoertuigenDefinitie[1013][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1013][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1013][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1014] = [];
    //     VoertuigenDefinitie[1014][0] = 14; //ID Voertuig
    //     VoertuigenDefinitie[1014][1] = 'SW 2000'; //Voertuig naam
    //     VoertuigenDefinitie[1014][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1014][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1014][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1015] = [];
    //     VoertuigenDefinitie[1015][0] = 15; //ID Voertuig
    //     VoertuigenDefinitie[1015][1] = 'SW 2000-Tr'; //Voertuig naam
    //     VoertuigenDefinitie[1015][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1015][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1015][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1016] = [];
    //     VoertuigenDefinitie[1016][0] = 16; //ID Voertuig
    //     VoertuigenDefinitie[1016][1] = 'SW Kats'; //Voertuig naam
    //     VoertuigenDefinitie[1016][2] = 'water_tankers'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1016][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1016][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1017] = [];
    //     VoertuigenDefinitie[1017][0] = 17; //ID Voertuig
    //     VoertuigenDefinitie[1017][1] = 'TLF 2000'; //Voertuig naam
    //     VoertuigenDefinitie[1017][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1017][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1017][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1018] = [];
    //     VoertuigenDefinitie[1018][0] = 18; //ID Voertuig
    //     VoertuigenDefinitie[1018][1] = 'TLF 3000'; //Voertuig naam
    //     VoertuigenDefinitie[1018][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1018][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1018][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1019] = [];
    //     VoertuigenDefinitie[1019][0] = 19; //ID Voertuig
    //     VoertuigenDefinitie[1019][1] = 'TLF 8/8'; //Voertuig naam
    //     VoertuigenDefinitie[1019][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1019][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1019][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1020] = [];
    //     VoertuigenDefinitie[1020][0] = 20; //ID Voertuig
    //     VoertuigenDefinitie[1020][1] = 'TLF 8/18'; //Voertuig naam
    //     VoertuigenDefinitie[1020][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1020][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1020][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1021] = [];
    //     VoertuigenDefinitie[1021][0] = 21; //ID Voertuig
    //     VoertuigenDefinitie[1021][1] = 'TLF 16/24-Tr'; //Voertuig naam
    //     VoertuigenDefinitie[1021][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1021][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1021][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1022] = [];
    //     VoertuigenDefinitie[1022][0] = 22; //ID Voertuig
    //     VoertuigenDefinitie[1022][1] = 'TLF 16/25'; //Voertuig naam
    //     VoertuigenDefinitie[1022][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1022][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1022][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1023] = [];
    //     VoertuigenDefinitie[1023][0] = 23; //ID Voertuig
    //     VoertuigenDefinitie[1023][1] = 'TLF 16/45'; //Voertuig naam
    //     VoertuigenDefinitie[1023][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1023][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1023][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1024] = [];
    //     VoertuigenDefinitie[1024][0] = 24; //ID Voertuig
    //     VoertuigenDefinitie[1024][1] = 'TLF 20/40'; //Voertuig naam
    //     VoertuigenDefinitie[1024][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1024][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1024][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1025] = [];
    //     VoertuigenDefinitie[1025][0] = 25; //ID Voertuig
    //     VoertuigenDefinitie[1025][1] = 'TLF 20/40-SL'; //Voertuig naam
    //     VoertuigenDefinitie[1025][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1025][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1025][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1026] = [];
    //     VoertuigenDefinitie[1026][0] = 26; //ID Voertuig
    //     VoertuigenDefinitie[1026][1] = 'TLF 16'; //Voertuig naam
    //     VoertuigenDefinitie[1026][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1026][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1026][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1027] = [];
    //     VoertuigenDefinitie[1027][0] = 27; //ID Voertuig
    //     VoertuigenDefinitie[1027][1] = 'GW-Gefahrgut'; //Voertuig naam
    //     VoertuigenDefinitie[1027][2] = 'hazmat_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1027][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1027][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1028] = [];
    //     VoertuigenDefinitie[1028][0] = 28; //ID Voertuig
    //     VoertuigenDefinitie[1028][1] = 'RTW'; //Voertuig naam
    //     VoertuigenDefinitie[1028][2] = 'ambulances'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1028][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1028][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1029] = [];
    //     VoertuigenDefinitie[1029][0] = 29; //ID Voertuig
    //     VoertuigenDefinitie[1029][1] = 'NEF'; //Voertuig naam
    //     VoertuigenDefinitie[1029][2] = 'nef'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1029][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1029][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1030] = [];
    //     VoertuigenDefinitie[1030][0] = 30; //ID Voertuig
    //     VoertuigenDefinitie[1030][1] = 'HLF 20'; //Voertuig naam
    //     VoertuigenDefinitie[1030][2] = 'firetrucks'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1030][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1030][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1031] = [];
    //     VoertuigenDefinitie[1031][0] = 31; //ID Voertuig
    //     VoertuigenDefinitie[1031][1] = 'RTH'; //Voertuig naam
    //     VoertuigenDefinitie[1031][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1031][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1031][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1032] = [];
    //     VoertuigenDefinitie[1032][0] = 32; //ID Voertuig
    //     VoertuigenDefinitie[1032][1] = 'FuStW'; //Voertuig naam
    //     VoertuigenDefinitie[1032][2] = 'police_cars'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1032][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1032][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1033] = [];
    //     VoertuigenDefinitie[1033][0] = 33; //ID Voertuig
    //     VoertuigenDefinitie[1033][1] = 'GW-Höhenrettung'; //Voertuig naam
    //     VoertuigenDefinitie[1033][2] = 'height_rescue_units'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1033][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1033][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1034] = [];
    //     VoertuigenDefinitie[1034][0] = 34; //ID Voertuig
    //     VoertuigenDefinitie[1034][1] = 'ELW 2'; //Voertuig naam
    //     VoertuigenDefinitie[1034][2] = 'mobile_command_vehicles'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1034][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1034][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1035] = [];
    //     VoertuigenDefinitie[1035][0] = 35; //ID Voertuig
    //     VoertuigenDefinitie[1035][1] = 'leBefKw'; //Voertuig naam
    //     VoertuigenDefinitie[1035][2] = 'leBefKw'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1035][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1035][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1036] = [];
    //     VoertuigenDefinitie[1036][0] = 36; //ID Voertuig
    //     VoertuigenDefinitie[1036][1] = 'MTW'; //Voertuig naam
    //     VoertuigenDefinitie[1036][2] = 'thw_mtwtz'; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1036][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1036][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1037] = [];
    //     VoertuigenDefinitie[1037][0] = 37; //ID Voertuig
    //     VoertuigenDefinitie[1037][1] = 'TSF-W'; //Voertuig naam
    //     VoertuigenDefinitie[1037][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1037][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1037][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1038] = [];
    //     VoertuigenDefinitie[1038][0] = 38; //ID Voertuig
    //     VoertuigenDefinitie[1038][1] = 'KTW'; //Voertuig naam
    //     VoertuigenDefinitie[1038][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1038][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1038][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1039] = [];
    //     VoertuigenDefinitie[1039][0] = 39; //ID Voertuig
    //     VoertuigenDefinitie[1039][1] = 'GKW'; //Voertuig naam
    //     VoertuigenDefinitie[1039][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1039][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1039][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1040] = [];
    //     VoertuigenDefinitie[1040][0] = 40; //ID Voertuig
    //     VoertuigenDefinitie[1040][1] = 'MTW-TZ'; //Voertuig naam
    //     VoertuigenDefinitie[1040][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1040][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1040][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1041] = [];
    //     VoertuigenDefinitie[1041][0] = 41; //ID Voertuig
    //     VoertuigenDefinitie[1041][1] = 'MzKW'; //Voertuig naam
    //     VoertuigenDefinitie[1041][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1041][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1041][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1042] = [];
    //     VoertuigenDefinitie[1042][0] = 42; //ID Voertuig
    //     VoertuigenDefinitie[1042][1] = 'LKW K 9'; //Voertuig naam
    //     VoertuigenDefinitie[1042][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1042][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1042][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1043] = [];
    //     VoertuigenDefinitie[1043][0] = 43; //ID Voertuig
    //     VoertuigenDefinitie[1043][1] = 'BRmG R'; //Voertuig naam
    //     VoertuigenDefinitie[1043][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1043][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1043][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1044] = [];
    //     VoertuigenDefinitie[1044][0] = 44; //ID Voertuig
    //     VoertuigenDefinitie[1044][1] = 'Anh DLE'; //Voertuig naam
    //     VoertuigenDefinitie[1044][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1044][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1044][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1045] = [];
    //     VoertuigenDefinitie[1045][0] = 45; //ID Voertuig
    //     VoertuigenDefinitie[1045][1] = 'MLW 5'; //Voertuig naam
    //     VoertuigenDefinitie[1045][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1045][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1045][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1046] = [];
    //     VoertuigenDefinitie[1046][0] = 46; //ID Voertuig
    //     VoertuigenDefinitie[1046][1] = 'WLF'; //Voertuig naam
    //     VoertuigenDefinitie[1046][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1046][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1046][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1047] = [];
    //     VoertuigenDefinitie[1047][0] = 47; //ID Voertuig
    //     VoertuigenDefinitie[1047][1] = 'AB-Rüst'; //Voertuig naam
    //     VoertuigenDefinitie[1047][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1047][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1047][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1048] = [];
    //     VoertuigenDefinitie[1048][0] = 48; //ID Voertuig
    //     VoertuigenDefinitie[1048][1] = 'AB-Atemschutz'; //Voertuig naam
    //     VoertuigenDefinitie[1048][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1048][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1048][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1049] = [];
    //     VoertuigenDefinitie[1049][0] = 49; //ID Voertuig
    //     VoertuigenDefinitie[1049][1] = 'AB-Öl'; //Voertuig naam
    //     VoertuigenDefinitie[1049][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1049][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1049][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1050] = [];
    //     VoertuigenDefinitie[1050][0] = 50; //ID Voertuig
    //     VoertuigenDefinitie[1050][1] = 'GruKw'; //Voertuig naam
    //     VoertuigenDefinitie[1050][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1050][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1050][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1051] = [];
    //     VoertuigenDefinitie[1051][0] = 51; //ID Voertuig
    //     VoertuigenDefinitie[1051][1] = 'FüKw'; //Voertuig naam
    //     VoertuigenDefinitie[1051][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1051][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1051][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1052] = [];
    //     VoertuigenDefinitie[1052][0] = 52; //ID Voertuig
    //     VoertuigenDefinitie[1052][1] = 'GefKw'; //Voertuig naam
    //     VoertuigenDefinitie[1052][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1052][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1052][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1053] = [];
    //     VoertuigenDefinitie[1053][0] = 53; //ID Voertuig
    //     VoertuigenDefinitie[1053][1] = 'Dekon-P'; //Voertuig naam
    //     VoertuigenDefinitie[1053][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1053][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1053][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1054] = [];
    //     VoertuigenDefinitie[1054][0] = 54; //ID Voertuig
    //     VoertuigenDefinitie[1054][1] = 'AB-Dekon-P'; //Voertuig naam
    //     VoertuigenDefinitie[1054][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1054][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1054][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1055] = [];
    //     VoertuigenDefinitie[1055][0] = 55; //ID Voertuig
    //     VoertuigenDefinitie[1055][1] = 'KdoW-LNA'; //Voertuig naam
    //     VoertuigenDefinitie[1055][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1055][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1055][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1056] = [];
    //     VoertuigenDefinitie[1056][0] = 56; //ID Voertuig
    //     VoertuigenDefinitie[1056][1] = 'KdoW-OrgL'; //Voertuig naam
    //     VoertuigenDefinitie[1056][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1056][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1056][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1057] = [];
    //     VoertuigenDefinitie[1057][0] = 57; //ID Voertuig
    //     VoertuigenDefinitie[1057][1] = 'FwK'; //Voertuig naam
    //     VoertuigenDefinitie[1057][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1057][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1057][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1058] = [];
    //     VoertuigenDefinitie[1058][0] = 58; //ID Voertuig
    //     VoertuigenDefinitie[1058][1] = 'KTW Typ B'; //Voertuig naam
    //     VoertuigenDefinitie[1058][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1058][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1058][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1059] = [];
    //     VoertuigenDefinitie[1059][0] = 59; //ID Voertuig
    //     VoertuigenDefinitie[1059][1] = 'ELW 1 (SEG)'; //Voertuig naam
    //     VoertuigenDefinitie[1059][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1059][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1059][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1060] = [];
    //     VoertuigenDefinitie[1060][0] = 60; //ID Voertuig
    //     VoertuigenDefinitie[1060][1] = 'GW-San'; //Voertuig naam
    //     VoertuigenDefinitie[1060][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1060][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1060][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1061] = [];
    //     VoertuigenDefinitie[1061][0] = 61; //ID Voertuig
    //     VoertuigenDefinitie[1061][1] = 'Polizeihubschrauber'; //Voertuig naam
    //     VoertuigenDefinitie[1061][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1061][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1061][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1062] = [];
    //     VoertuigenDefinitie[1062][0] = 62; //ID Voertuig
    //     VoertuigenDefinitie[1062][1] = 'AB-Schlauch'; //Voertuig naam
    //     VoertuigenDefinitie[1062][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1062][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1062][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1063] = [];
    //     VoertuigenDefinitie[1063][0] = 63; //ID Voertuig
    //     VoertuigenDefinitie[1063][1] = 'GW-Taucher'; //Voertuig naam
    //     VoertuigenDefinitie[1063][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1063][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1063][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1064] = [];
    //     VoertuigenDefinitie[1064][0] = 64; //ID Voertuig
    //     VoertuigenDefinitie[1064][1] = 'GW-Wasserrettung'; //Voertuig naam
    //     VoertuigenDefinitie[1064][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1064][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1064][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1065] = [];
    //     VoertuigenDefinitie[1065][0] = 65; //ID Voertuig
    //     VoertuigenDefinitie[1065][1] = 'LKW 7 Lkr 19 tm'; //Voertuig naam
    //     VoertuigenDefinitie[1065][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1065][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1065][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1066] = [];
    //     VoertuigenDefinitie[1066][0] = 66; //ID Voertuig
    //     VoertuigenDefinitie[1066][1] = 'Anh MzB'; //Voertuig naam
    //     VoertuigenDefinitie[1066][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1066][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1066][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1067] = [];
    //     VoertuigenDefinitie[1067][0] = 67; //ID Voertuig
    //     VoertuigenDefinitie[1067][1] = 'Anh SchlB'; //Voertuig naam
    //     VoertuigenDefinitie[1067][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1067][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1067][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1068] = [];
    //     VoertuigenDefinitie[1068][0] = 68; //ID Voertuig
    //     VoertuigenDefinitie[1068][1] = 'Anh MzAB'; //Voertuig naam
    //     VoertuigenDefinitie[1068][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1068][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1068][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1069] = [];
    //     VoertuigenDefinitie[1069][0] = 69; //ID Voertuig
    //     VoertuigenDefinitie[1069][1] = 'Tauchkraftwagen'; //Voertuig naam
    //     VoertuigenDefinitie[1069][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1069][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1069][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1070] = [];
    //     VoertuigenDefinitie[1070][0] = 70; //ID Voertuig
    //     VoertuigenDefinitie[1070][1] = 'MZB'; //Voertuig naam
    //     VoertuigenDefinitie[1070][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1070][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1070][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1071] = [];
    //     VoertuigenDefinitie[1071][0] = 71; //ID Voertuig
    //     VoertuigenDefinitie[1071][1] = 'AB-MZB'; //Voertuig naam
    //     VoertuigenDefinitie[1071][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1071][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1071][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1072] = [];
    //     VoertuigenDefinitie[1072][0] = 72; //ID Voertuig
    //     VoertuigenDefinitie[1072][1] = 'WaWe 10'; //Voertuig naam
    //     VoertuigenDefinitie[1072][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1072][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1072][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1073] = [];
    //     VoertuigenDefinitie[1073][0] = 73; //ID Voertuig
    //     VoertuigenDefinitie[1073][1] = 'GRTW'; //Voertuig naam
    //     VoertuigenDefinitie[1073][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1073][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1073][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1074] = [];
    //     VoertuigenDefinitie[1074][0] = 74; //ID Voertuig
    //     VoertuigenDefinitie[1074][1] = 'NAW'; //Voertuig naam
    //     VoertuigenDefinitie[1074][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1074][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1074][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1075] = [];
    //     VoertuigenDefinitie[1075][0] = 75; //ID Voertuig
    //     VoertuigenDefinitie[1075][1] = 'FLF'; //Voertuig naam
    //     VoertuigenDefinitie[1075][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1075][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1075][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1076] = [];
    //     VoertuigenDefinitie[1076][0] = 76; //ID Voertuig
    //     VoertuigenDefinitie[1076][1] = 'Rettungstreppe'; //Voertuig naam
    //     VoertuigenDefinitie[1076][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1076][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1076][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1077] = [];
    //     VoertuigenDefinitie[1077][0] = 77; //ID Voertuig
    //     VoertuigenDefinitie[1077][1] = 'AB-Gefahrgut'; //Voertuig naam
    //     VoertuigenDefinitie[1077][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1077][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1077][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1078] = [];
    //     VoertuigenDefinitie[1078][0] = 78; //ID Voertuig
    //     VoertuigenDefinitie[1078][1] = 'AB-Einsatzleitung'; //Voertuig naam
    //     VoertuigenDefinitie[1078][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1078][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1078][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1079] = [];
    //     VoertuigenDefinitie[1079][0] = 79; //ID Voertuig
    //     VoertuigenDefinitie[1079][1] = 'SEK - ZF'; //Voertuig naam
    //     VoertuigenDefinitie[1079][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1079][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1079][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1080] = [];
    //     VoertuigenDefinitie[1080][0] = 80; //ID Voertuig
    //     VoertuigenDefinitie[1080][1] = 'SEK - MTF'; //Voertuig naam
    //     VoertuigenDefinitie[1080][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1080][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1080][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1081] = [];
    //     VoertuigenDefinitie[1081][0] = 81; //ID Voertuig
    //     VoertuigenDefinitie[1081][1] = 'MEK - ZF'; //Voertuig naam
    //     VoertuigenDefinitie[1081][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1081][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1081][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1082] = [];
    //     VoertuigenDefinitie[1082][0] = 82; //ID Voertuig
    //     VoertuigenDefinitie[1082][1] = 'MEK - MTF'; //Voertuig naam
    //     VoertuigenDefinitie[1082][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1082][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1082][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1083] = [];
    //     VoertuigenDefinitie[1083][0] = 83; //ID Voertuig
    //     VoertuigenDefinitie[1083][1] = 'GW-Werkfeuerwehr'; //Voertuig naam
    //     VoertuigenDefinitie[1083][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1083][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1083][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1084] = [];
    //     VoertuigenDefinitie[1084][0] = 84; //ID Voertuig
    //     VoertuigenDefinitie[1084][1] = 'ULF mit Löscharm'; //Voertuig naam
    //     VoertuigenDefinitie[1084][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1084][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1084][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1085] = [];
    //     VoertuigenDefinitie[1085][0] = 85; //ID Voertuig
    //     VoertuigenDefinitie[1085][1] = 'TM 50'; //Voertuig naam
    //     VoertuigenDefinitie[1085][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1085][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1085][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1086] = [];
    //     VoertuigenDefinitie[1086][0] = 86; //ID Voertuig
    //     VoertuigenDefinitie[1086][1] = 'Turbolöscher'; //Voertuig naam
    //     VoertuigenDefinitie[1086][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1086][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1086][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1087] = [];
    //     VoertuigenDefinitie[1087][0] = 87; //ID Voertuig
    //     VoertuigenDefinitie[1087][1] = 'TLF 4000'; //Voertuig naam
    //     VoertuigenDefinitie[1087][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1087][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1087][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1088] = [];
    //     VoertuigenDefinitie[1088][0] = 88; //ID Voertuig
    //     VoertuigenDefinitie[1088][1] = 'KLF'; //Voertuig naam
    //     VoertuigenDefinitie[1088][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1088][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1088][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1089] = [];
    //     VoertuigenDefinitie[1089][0] = 89; //ID Voertuig
    //     VoertuigenDefinitie[1089][1] = 'MLF'; //Voertuig naam
    //     VoertuigenDefinitie[1089][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1089][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1089][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1090] = [];
    //     VoertuigenDefinitie[1090][0] = 90; //ID Voertuig
    //     VoertuigenDefinitie[1090][1] = 'HLF 10'; //Voertuig naam
    //     VoertuigenDefinitie[1090][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1090][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1090][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1091] = [];
    //     VoertuigenDefinitie[1091][0] = 91; //ID Voertuig
    //     VoertuigenDefinitie[1091][1] = 'Rettungshundefahrzeug'; //Voertuig naam
    //     VoertuigenDefinitie[1091][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1091][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1091][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1092] = [];
    //     VoertuigenDefinitie[1092][0] = 92; //ID Voertuig
    //     VoertuigenDefinitie[1092][1] = 'Anh Hund'; //Voertuig naam
    //     VoertuigenDefinitie[1092][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1092][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1092][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1093] = [];
    //     VoertuigenDefinitie[1093][0] = 93; //ID Voertuig
    //     VoertuigenDefinitie[1093][1] = 'MTW-OV'; //Voertuig naam
    //     VoertuigenDefinitie[1093][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1093][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1093][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1094] = [];
    //     VoertuigenDefinitie[1094][0] = 94; //ID Voertuig
    //     VoertuigenDefinitie[1094][1] = 'DHuFüKw'; //Voertuig naam
    //     VoertuigenDefinitie[1094][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1094][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1094][4] = "DE"; // GameVersie

    //     VoertuigenDefinitie[1095] = [];
    //     VoertuigenDefinitie[1095][0] = 95; //ID Voertuig
    //     VoertuigenDefinitie[1095][1] = 'Polizeimotorrad'; //Voertuig naam
    //     VoertuigenDefinitie[1095][2] = ''; //Mission Regel gekoppeld bijvoorbeeld: "firetrucks"
    //     VoertuigenDefinitie[1095][3] = 0; //Aantal onderweg
    //     VoertuigenDefinitie[1095][4] = "DE"; // GameVersie

    // https://github.com/LSS-Manager/LSSM-V.4/blob/f7798325591b7b2c104d59667e8e508e2160abe8/src/i18n/de_DE.ts#L84
    // https://github.com/LSS-Manager/LSSM-V.4/blob/dev/src/modules/missionHelper/i18n/de_DE.json

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
