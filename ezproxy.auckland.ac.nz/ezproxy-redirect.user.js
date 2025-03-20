// ==UserScript==
// @name         EZProxy Redirect - ezproxy.auckland.ac.nz
// @description  Add a menu command to proxy the current page via Auckland University's EZProxy
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      MIT
// @version      1.0.0
// @match        *://*/*
// @grant        GM_registerMenuCommand
// ==/UserScript==

GM_registerMenuCommand("Proxy this page", () => {
	location.href = `http://ezproxy.auckland.ac.nz/login?url=${location.href}`;
});
