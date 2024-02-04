// ==UserScript==
// @name         Faster video - panopto.com
// @description  Allows you to set your video playback speed faster than the max 2x speed
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      MIT
// @version      2.0.1
// @match        https://auckland.au.panopto.com/Panopto/Pages/Viewer.aspx
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {
    let playbackSpeeds;
    try {
        playbackSpeeds = JSON.parse(localStorage.getItem("playbackSpeeds")) ?? [];
    } catch (_) {
        playbackSpeeds = []
    }

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

        .speedList > li {
            width: 80%;
            padding: 0.5em 10%;
        }

        .speedList li:hover, .speedList button:hover, .speedList input:focus {
            background-color: rgb(245, 245, 245);
        }

        .speedList > button, .speedList > input {
            border: none;
            outline: none;
            text-align: center;
            width: 100%;
            padding: 8px 0px;
            color: rgb(98, 98, 98);
            background-color: rgb(255, 255, 255);
            border-top: 1px solid rgb(245, 245, 245);
            border-bottom: 1px solid rgb(245, 245, 245);
        }

        .speedList > input {
            font-size: 0.75em;
        }

        .speedList > button {
            font-weight: bold;
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

    const listTitle = document.createElement("li");
    listTitle.innerText = "Speed";
    listTitle.style.fontWeight = "bold";
    speedList.appendChild(listTitle);

    const speedInput = document.createElement("input");
    speedInput.id = "speedInput";
    speedInput.placeholder = "Custom Speed";
    speedInput.type = "number";
    speedInput.min = 0.1;
    speedInput.step = 0.1;
    speedList.appendChild(speedInput);
    speedInput.addEventListener("change", () => {
        changeSpeed(speedInput.value);
    });

    const saveSpeedButton = document.createElement("button");
    saveSpeedButton.innerText = "Save Speed";
    speedList.appendChild(saveSpeedButton);
    saveSpeedButton.addEventListener("click", () => {
        const parsedSpeed = speedInput.value;
        if (isNaN(parsedSpeed) || parsedSpeed <= 0) return;
        if (playbackSpeeds.includes(parsedSpeed)) return;

        playbackSpeeds.push(parsedSpeed);
        playbackSpeeds.sort().reverse();

        localStorage.setItem("playbackSpeeds", JSON.stringify(playbackSpeeds));
        initializeSpeedList();
    });

    const removeSpeedButton = document.createElement("button");
    removeSpeedButton.innerText = "Remove Speed";
    speedList.appendChild(removeSpeedButton);
    removeSpeedButton.addEventListener("click", () => {
        const parsedSpeed = speedInput.value;
        if (isNaN(parsedSpeed) || parsedSpeed <= 0) return;

        const index = playbackSpeeds.indexOf(parsedSpeed);
        if (index === -1) return;

        playbackSpeeds.splice(index, 1);
        localStorage.setItem("playbackSpeeds", JSON.stringify(playbackSpeeds));
        initializeSpeedList();
    });

    speedButtonIcon.addEventListener("click", () => {
        if (speedList.style.transform === "scale(1)") {
            speedList.style.transform = "scale(0)";
            speedList.style.opacity = 0;
        } else {
            speedList.style.transform = "scale(1)";
            speedList.style.opacity = 1;
            speedInput.focus();
        }
    });

    initializeSpeedList();
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
        speedInput.value = parsedSpeed;
        for (const video of videoElements) {
            video.playbackRate = parsedSpeed;
        }

        speedButtonIcon.textContent = `${parsedSpeed}x`;
    }

    function initializeSpeedList() {
        // Remove all `li` children from the speedList
        const listItems = speedList.querySelectorAll("li.speedListItem");
        listItems.forEach(item => item.remove());

        // Add speeds back
        playbackSpeeds.forEach(speed => {
            const listItem = document.createElement("li");
            listItem.textContent = `${speed}x`;
            listItem.classList.add("speedListItem");
            listItem.addEventListener("click", () => {
                changeSpeed(speed);
                speedList.style.transform = "scale(0)";
                speedList.style.opacity = 0;
            });

            speedList.appendChild(listItem);
        });
    }
})();
