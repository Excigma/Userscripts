// ==UserScript==
// @name         Up arrow to edit - Slack.com
// @description  Up arrow will edit the previous message you sent in the channel, just like in Discord
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      GPL-3.0
// @version      0.0.1
// @match        https://app.slack.com/client/*
// ==/UserScript==

// 'We have jquery at home'
const $ = (...args) => document.querySelector.apply(document, args);

// Shows user's name when hovering over the icon
const PROFILE_SELECTOR = ".p-ia__nav__user__button"
// Finds the last occurrence of the user's name in the nametag of a message
const MESSAGE_SELECTOR = ".c-message_list .c-virtual_list__scroll_container > .c-virtual_list__item:last-of-type";

// Remove prepended text
const MENU_STRING = "User menu: ";

document.addEventListener('keyup', (evt) => {
	if (evt.key !== 'ArrowUp') return;

	// Get the last message that the user sent into the channel by searching for the nametag
	const name = $(PROFILE_SELECTOR).ariaLabel.replaceAll(MENU_STRING, "");
	const lastMessage = $(`${MESSAGE_SELECTOR} [data-stringify-text="${name}"]`)?.closest(MESSAGE_SELECTOR);

	if (!lastMessage) return;

	// Dispatch "e" event to previous message to trigger edit
	lastMessage.dispatchEvent(new KeyboardEvent('keydown', {
		"key": "e",
		"keyCode": 69
	}));
});