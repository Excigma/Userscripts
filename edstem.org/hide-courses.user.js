// ==UserScript==
// @name        Hide courses - edstem.org
// @namespace   https://github.com/Excigma
// @match       https://edstem.org/*/dashboard*
// @grant       GM_addStyle
// @author      Excigma
// @license     GPL-3.0
// @version     0.0.1
// @description 8/14/2025, 10:17:04 PM
// ==/UserScript==

// Course IDs from URL
const courses = ["12345"];

GM_addStyle(`${courses.map(course => `[href*="${course}"]`)} {
  display: none !important;
}`)
