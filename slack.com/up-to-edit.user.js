// ==UserScript==
// @name         Up arrow to edit - Slack.com
// @description  Pressing the up arrow will edit the previous message in the channel if you authored it
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      GPL-3.0
// @version      0.0.1
// @match        https://app.slack.com/client/*
// ==/UserScript==

// This doesn't work when your message is not the last message in the channel

// 'We have jquery at home'
const $ = (...args) => document.querySelector.apply(document, args);

// Finds the last occurrence of the user's name in the nametag of a message
const MESSAGE_SELECTOR = ".c-message_list .c-virtual_list__scroll_container > .c-virtual_list__item.c-virtual_list__item--initial-activeitem";

document.addEventListener('keyup', (evt) => {
	if (evt.key !== 'ArrowUp') return;

	const previousMessage = $(MESSAGE_SELECTOR);
	if (!previousMessage) return;

	// Dispatch "e" event to previous message to trigger edit
	previousMessage.dispatchEvent(new KeyboardEvent('keydown', {
		"key": "e",
		"keyCode": 69
	}));
});