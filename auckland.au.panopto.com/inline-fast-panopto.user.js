// ==UserScript==
// @name         Faster video - panopto.com
// @description  Allows you to set your video playback speed faster than the max 2x speed
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      MIT
// @version      1.0.0
// @match        https://auckland.au.panopto.com/Panopto/Pages/Viewer.aspx
// @grant        none
// @run-at       document-end
// ==/UserScript==

const playSpeedButton = document.getElementById("playSpeedButton");
const playSpeedExpander = document.getElementById("playSpeedExpander");
const playSpeedMultiplier = document.getElementById("playSpeedMultiplier");

const newDiv = document.createElement("div");
newDiv.className = "flyout-header";

const inputElement = document.createElement("input");
inputElement.type = "number";
inputElement.style.width = "5em";

newDiv.appendChild(inputElement);
playSpeedExpander.appendChild(newDiv);

const setPlaybackSpeed = (speed) => {
    const speedFloat = parseFloat(speed);
    const videoElements = document.getElementsByTagName("video");

    for (let i = 0; i < videoElements.length; i++) {
        videoElements[i].playbackRate = speedFloat;
    }

    document.getElementById('playSpeedMultiplier').innerText = `${speedFloat}x`;
}

inputElement.addEventListener("change", () => {
    setPlaybackSpeed(inputElement.value);
});

playSpeedButton.addEventListener("mouseover", () => {
  inputElement.value = document.getElementsByTagName("video")[0].playbackRate;
});
