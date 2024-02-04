// ==UserScript==
// @name         Faster video - panopto.com
// @description  Allows you to set your video playback speed faster than the max 2x speed
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      MIT
// @version      2.0.0
// @match        https://auckland.au.panopto.com/Panopto/Pages/Viewer.aspx
// @grant        none
// @run-at       document-end
// ==/UserScript==

// TODO: Allow user-defined playback speeds

(() => {
    const PLAYBACK_SPEEDS = [0.8, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

    const styles = `
        #speedButton {
            cursor: pointer;
            width: 40px;
            font-size: 1.5em;
        }

        #speedButton > span {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-weight: bold;
        }

        .speedList {
            transform: scale(0);
            opacity: 0;
            border: 1px solid rgb(204, 204, 204);
            border-radius: 3px;
            box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px;
            transition: opacity 255ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, transform 170ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            transform-origin: bottom right;
            list-style-type: none;
            position: absolute;
            z-index: 999;
            color: rgb(98, 98, 98);
            background-color: rgb(255, 255, 255);
            width: 200px;
            right: 60px;
            bottom: calc(100% + 5px);
            text-align: left;
            cursor: pointer;
        }

        .speedList > * {
           width: 80%;
           padding: 0.5em 10%;
        }

        .speedList li:hover {
            background-color: rgb(245, 245, 245);
        }

        #customSpeedInput {
            border: none;
            border-top: 1px solid rgb(245, 245, 245);
            color: rgb(98, 98, 98);
        }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    const speedButton = document.createElement("div");
    speedButton.id = "speedButton";
    speedButton.classList.add("transport-button", "safety-text");

    const speedButtonIcon = document.createElement("span");
    speedButtonIcon.innerText = "1x";

    const speedList = document.createElement("ul");
    speedList.classList.add("speedList");

    const captionsButton = document.getElementById("captionsButton");
    captionsButton.parentNode.insertBefore(speedButton, captionsButton.nextSibling);
    speedButton.appendChild(speedButtonIcon);

    speedButtonIcon.addEventListener("click", () => {
        if (speedList.style.transform === "scale(1)") {
            speedList.style.transform = "scale(0)";
            speedList.style.opacity = 0;
        } else {
            speedList.style.transform = "scale(1)";
            speedList.style.opacity = 1;
        }
    });

    const listTitle = document.createElement("li");
    listTitle.innerText = "Speed";
    listTitle.style.fontWeight = "bold";
    speedList.appendChild(listTitle);

    PLAYBACK_SPEEDS.forEach(speed => {
        const listItem = document.createElement("li");
        listItem.innerText = `${speed}x`;
        listItem.addEventListener("click", () => {
            changeSpeed(speed);
            speedList.style.transform = "scale(0)";
            speedList.style.opacity = 0;
        });

        speedList.appendChild(listItem);
    });

    const customSpeedInput = document.createElement("input");
    customSpeedInput.id = "customSpeedInput";
    customSpeedInput.type = "number";
    customSpeedInput.min = 0.1;
    customSpeedInput.step = 0.1;
    customSpeedInput.placeholder = "Custom Speed";
    customSpeedInput.addEventListener("change", () => {
        changeSpeed(customSpeedInput.value);
    });

    speedList.appendChild(customSpeedInput);
    speedButton.appendChild(speedList);

    // Event listener to close the speedList when clicking away or hitting escape
    document.addEventListener("click", function (event) {
        if (speedList.style.transform !== "scale(1)") return;

        if (event.target !== speedButton && !speedButton.contains(event.target)) {
            speedList.style.transform = "scale(0)";
            speedList.style.opacity = 0;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
    });

    document.addEventListener("keyup", function (event) {
        if (speedList.style.transform !== "scale(1)") return;

        if (event.key === "Escape") {
            speedList.style.transform = "scale(0)";
            speedList.style.opacity = 0;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
    });

    function changeSpeed(speed) {
        const parsedSpeed = Number(speed);
        if (isNaN(parsedSpeed) || parsedSpeed <= 0) return;

        const videoElements = document.getElementsByTagName("video");

        for (let i = 0; i < videoElements.length; i++) {
            videoElements[i].playbackRate = parsedSpeed;
        }

        speedButtonIcon.textContent = `${parsedSpeed}x`;
    }
})();
