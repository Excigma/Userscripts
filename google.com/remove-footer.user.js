// ==UserScript==
// @name         Remove footer - google.com
// @description  Removes the footer in Google search, reducing the chance that you dox yourself in screenshots
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      GPL-3.0
// @version      0.0.1
// @match        https://google.com/search*
// @match        https://www.google.com/search*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

GM_addStyle(`
  #footcnt {
    display: none !important
  }
`);