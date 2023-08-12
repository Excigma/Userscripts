// ==UserScript==
// @name         Excigma's common utilities 
// @description  Contains common functions and utilities for Excigma's userscripts that will be @included in scripts in the future
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      GPL-3.0
// @version      0.0.1
// ==/UserScript==

// "We have jquery at home"
const $ = (...args) => document.querySelector.apply(document, args);
const $$ = (...args) => [...document.querySelectorAll.apply(document, args)];

// TODO: function to wait for elements to exist