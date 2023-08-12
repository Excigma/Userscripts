// ==UserScript==
// @name         Highlight incorrect answers - Quizzes LTI
// @description  Highlights incorrect answers in quizzes on Quizzes LTI (WIRIS), so you can easily see which questions you got wrong and need to review.
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      GPL-3.0
// @version      0.0.1
// @match        https://quizzeslti.wiris.net/auckland.ac.nz/mod/quiz/review.php*
// @run-at       document-end
// ==/UserScript==

const $$ = (...args) => [...document.querySelectorAll.apply(document, args)];

const loadCheck = setInterval(() => {
	if (!$$(".yui3-overlay").length) return;

	const labels = [...$$(".yui3-overlay"), ...$$(".grade")] // .yui3-overlay-hidden also
	for (const label of labels) {
		// Got full marks, ignoring this label
		if (isFullMark(label.textContent)) continue;

		// Didn't get full marks, add a background color
		label.parentElement.style.backgroundColor = "orange";
	}

	function isFullMark(mark) {
		const markRegex = /Mark (.*) out of (.*)/;
		const matches = mark.match(markRegex);

		// If the tooltip format is wrong
		if (matches && matches.length === 3) {
			// Compare the obtained mark with the total mark
			return matches[1] === matches[2];
		}

		// Fail to false by default if its not able to parse, so we can manually check it
		return false;
	}

	clearInterval(loadCheck);
}, 100)