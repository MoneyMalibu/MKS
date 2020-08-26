// ==UserScript==
// @name         [MM] - [NLDE] - MissionHelper
// @namespace    http://tampermonkey.net/
// @version      2020.08.24.00.14
// @description  try to take over the world!
// @author       You
// @updateRL     https://github.com/MoneyMalibu/MKS/raw/master/%5BMM%5D%20-%20%5BNLDE%5D%20-%20MissionHelper.user.js
// @downloadURL  https://github.com/MoneyMalibu/MKS/raw/master/%5BMM%5D%20-%20%5BNLDE%5D%20-%20MissionHelper.user.js
// @match        https://www.meldkamerspel.com/
// @grant        none
// ==/UserScript==

(function() {
    console.log("[MM] - [NLDE] - Missionhelper - START");
    Lightbox_Status();
})();

function Lightbox_Status() {
    console.log("Status controle");
    var x = document.getElementById("lightbox_box");
    if (window.getComputedStyle(x).display === "none") {
        console.log("Status lightbox: " + window.getComputedStyle(x).display);
    }

    setTimeout(function(){ 
        Lightbox_Status(); 
    }, 1000);

}