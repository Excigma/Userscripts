// ==UserScript==
// @name         Auto Expand Groups - canvas.auckland.ac.nz
// @description  Automatically expands groups in the People > Groups view
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      GPL-3.0
// @version      0.0.1
// @match        https://canvas.auckland.ac.nz/courses/*/groups*
// @run-at       document-end
// ==/UserScript==

const timeout = setInterval(() => {
    const matches = [...document.querySelectorAll(`span[class="group-name"]`)];
  
    if (matches) {
      matches.map(a => a.click());
      clearInterval(timeout)
    }
}, 1000);