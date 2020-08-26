// ==UserScript==
// @name         [MM] - [NLDE] - MissionHelper
// @namespace    http://tampermonkey.net/
// @version      2020.08.24.00.10
// @description  try to take over the world!
// @author       You
// @updateRL     https://github.com/MoneyMalibu/MKS/raw/master/%5BMM%5D%20-%20%5BNLDE%5D%20-%20MissionHelper.user.js
// @downloadURL  https://github.com/MoneyMalibu/MKS/raw/master/%5BMM%5D%20-%20%5BNLDE%5D%20-%20MissionHelper.user.js
// @match        https://www.meldkamerspel.com/*
// @grant        none
// ==/UserScript==

(function () {
    // Blocker is the element that has a changing display value
    var blocker = document.querySelector('#lightbox_box');
    // Trigger changes the display value of blocker
    var trigger = document.querySelector('#trigger');
    // Our mutation observer, which we attach to blocker later
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            // Was it the style attribute that changed? (Maybe a classname or other attribute change could do this too? You might want to remove the attribute condition) Is display set to 'none'?
            if (mutation.attributeName === 'style' && window.getComputedStyle(blocker).getPropertyValue('display') !== 'none'
            ) {
                alert('#blocker\'s style just changed, and its display value is no longer \'none\'');
            }
        });
    });

    // Attach the mutation observer to blocker, and only when attribute values change
    observer.observe(blocker, { attributes: true });

    // Make trigger change the style attribute of blocker
    trigger.addEventListener('click', function () {
        blocker.removeAttribute('style');
    }, false);
})