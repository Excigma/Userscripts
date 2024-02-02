// Note: This will NOT work if your timezone is not Pacific/Auckland (e.g. you are overseas). Change your device timezone to Pacific/Auckland
// **If this script messes up, you WILL need to manually delete the events in the calendar!!!** Use at your own risk.

// How to use:
// Don't. The script seems to be functional but I haven't had time to properly test it.

// 0. Standard cybersecurity warning: Do not blindly run scripts from untrusted sources. Please audit the code before running it. Please also read the above notes.
// 1. Go to: https://www.student.auckland.ac.nz/psc/ps/EMPLOYEE/SA/c/UOA_MENU_FL.UOA_VW_CAL_FL.GBL
// 2. Open Console (Control + Shift + I, then click on the "Console" tab)
// 3. Paste the code below into the console. You may need to allow pasting before your browser lets you paste the code.
// 4. Press Enter. You should see the script switching to the "List View" tab, opening "Meeting Information" for each meeting then finally downloading a file "uoa-sso-calendar.ics". The ics file's contents will be logged to the console as well.

// Note: I've included a userscript header, however, this script single use, just paste it into the console, there's no point having it installed. I don't believe document-end is enough for the page to finish loading, so the script shouldn't even work.
// I may convert this into a browser extension to automatically navigate to the correct page if UoA does not release an official solution by the time semester starts.

// TODO: Generate another .ics file to undo the changes made by this script? https://stackoverflow.com/q/1566635

// ==UserScript==
// @name         UoA SSO Timetable to iCalendar
// @description  This script converts the timetable on SSO (Student Services Online) into .ical format, as UoA has decommissioned UoACal with zero notice.
// @author       Excigma
// @namespace    https://excigma.xyz
// @license      GPL-3.0
// @version      0.0.1
// @match        https://www.student.auckland.ac.nz/psc/ps/EMPLOYEE/SA/c/UOA_MENU_FL.UOA_VW_CAL_FL.GBL
// @run-at       document-end
// ==/UserScript==

Intentional syntax error to make code not runnable.Further testing required

	(async () => {
		/** Meeting Information related */
		// This maps the "Component" field in the timetable to the iCalendar entry
		const COMPONENT_MAP = {
			"lecture": "",
			"tutorial": "TUT",
			"laboratory": "LAB"
		}
		const MEETING_NUMBER_ID = "DERIVED_SSR_FL_SSR_SBJ_CAT_NBR";
		const MEETING_SESSION_ID = "DERIVED_SSR_FL_SSR_SESSION_TRAN";

		const MEETING_ROW_SELECTOR = `tbody > tr[id^=DERIVED_SSR_FL]`

		/** Timing related */
		// Polling rate for elements to appear (ms)
		const ELEMENT_POLL_RATE = 50;
		// Extra delay to add in between steps, in case something has not needed (ms)
		const EXTRA_DELAY = 150;

		/** Tab related */
		const TAB_SELECTED_CLASS = "psc_selected";

		const TIMETABLE_VIEW_TAB_SELECTOR = `.ps_box-label [for^="UOA_MYCAL_WRK_SSR_SCHED_FORMAT"]`
		const TIMETABLE_VIEW_TAB_TEXT = "List View";

		const COURSE_INFORMATION_TAB_SELECTOR = `.ps_box-label [for^="DERIVED_SSR_FL_SSR_CL_DTLS_LFF"]`
		const COURSE_INFORMATION_TAB_TEXT = "Meeting Information";

		/** Miscellaneous IDs and selectors */
		const SPINNER_ID = "WAIT_win0";
		const MODAL_CLOSE_ID = "#ICCancel"; // There is a hash is in the ID. This is not a typo
		const MODAL_IFRAME_SELECTOR = "#pt_modals iframe";
		const TIMETABLE_ROW_SELECTOR = `[onclick^="javascript:OnRowAction(this,'DERIVED_SSR_FL_SSR_SBJ_CAT_"]`;

		const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
		const trimText = (text) => text?.trim()?.replaceAll(/\s+/g, " ");

		/** iCalender related */
		const UOA_TIMEZONE = "Pacific/Auckland";
		const DAY_MAP = {
			"monday": "MO",
			"tuesday": "TU",
			"wednesday": "WE",
			"thursday": "TH",
			"friday": "FR",
			"saturday": "SA",
			"sunday": "SU"
		}

		// Pre-flight checks
		const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		if (userTimeZone !== UOA_TIMEZONE) {
			console.error(`Your timezone is not ${UOA_TIMEZONE}. You may need to adjust the times in the calendar.`);
		}

		/**
		 * Wait for the spinner to close on the current document.
		 * Fun fact: THE MODALS ARE IN IFRAMES??? This means that we need to hook into <iframe>s to check the spinner's status as well
		 * @param {Document} thisDocument
		 */
		const awaitSpinnerClose = (thisDocument) => new Promise((resolve) => {
			// Using a MutationObserver is more ideal here, but this works well, so I don't want to change it.
			const spinnerInterval = setInterval(async () => {
				// Detect when the spinner is hidden
				if (thisDocument.getElementById(SPINNER_ID)?.style?.visibility !== "visible") {
					clearInterval(spinnerInterval);

					await delay(EXTRA_DELAY);
					resolve();
				}
			}, ELEMENT_POLL_RATE);
		});

		/**
		 * Detects when a modal has finished opening or closing
		 * @param {"OPEN" | "CLOSE"} action which action should we wait for
		 * @returns the iframe document if opening, nothing if closing
		 */
		const awaitModalDocument = (action) => new Promise(async (resolve) => {
			// Wait for the spinner to close if it exists
			await awaitSpinnerClose(document);

			// Using a MutationObserver is more ideal here, but this works well, so I don't want to change it.
			const modalInterval = setInterval(async () => {
				const modalDocument = document.querySelector(MODAL_IFRAME_SELECTOR)?.contentDocument;
				// We have enum at home
				if (action === "OPEN") {
					// Detect when the `<iframe>` is added to the page
					if (modalDocument?.getElementById) {
						clearInterval(modalInterval);

						// Detect when the `<iframe>` has `DOMContentLoaded`. The reason we don't use DOMContentLoaded is because it fires once and we may add it too late if SSO is fast (highly unlikely).
						const modalDocumentInterval = setInterval(async () => {
							if (modalDocument.getElementById(MODAL_CLOSE_ID)) {
								clearInterval(modalDocumentInterval);

								await delay(EXTRA_DELAY);
								resolve(modalDocument);
							}
						}, ELEMENT_POLL_RATE);
					}
				} else if (action === "CLOSE") {
					// Wait for the modal's `<iframe>` to no longer exist
					if (!modalDocument) {
						clearInterval(modalInterval);

						await delay(EXTRA_DELAY);
						resolve(modalDocument);
					}
				}
			}, ELEMENT_POLL_RATE);
		});

		/**
		 * Ensure that a tab with certain text has been selected
		 * @param {Document} thisDocument the document to check the tabs in
		 * @param {string} tabSelector the selector of the tabs to ensure is selected
		 * @param {string} tabText the text of the tab to ensure is selected
		 */
		const ensureTabSelected = async (thisDocument, tabSelector, tabText) => {
			const wantedTab = [...thisDocument.querySelectorAll(tabSelector)]
				.find(tab => trimText(tab.textContent).toLowerCase() === trimText(tabText).toLowerCase())
				?.parentElement?.parentElement;

			if (!wantedTab) {
				throw new Error(`Cannot find tab with text "${tabText}" in selector "${tabSelector}"`);
			}

			// If the tab is already selected, we don't need to do anything
			if (wantedTab.classList.contains(TAB_SELECTED_CLASS)) return;

			// Click the tab to select it
			wantedTab.querySelector("input")?.click();
			await awaitSpinnerClose(thisDocument);
		}

		/**
		 * Parse a date and time string into a `Date` object
		 * @param {string} date the date string in the format "DD/MM/YYYY"
		 * @param {string} time the time string in the format "HH:MMAM/PM"
		*/
		const parseDateTime = (date, time) => {
			const [day, month, year] = date.split("/").map(Number);
			const [timePart, meridiem] = time.split(/(?=[AP]M)/i);
			let [hours, minutes] = timePart.split(":").map(Number);

			// Note: month - 1 because month is zero-indexed in JavaScript
			const parsedDate = new Date(year, month - 1, day);
			if (meridiem.toLowerCase() === "pm" && hours < 12) {
				hours += 12;
			} else if (meridiem.toLowerCase() === "am" && hours === 12) {
				hours = 0;
			}

			parsedDate.setHours(hours, minutes);

			return parsedDate;
		};

		/**
		 * Convert a `Date` object into a UTC iCalendar date string
		 * @param {Date} date the date to convert
		 * @returns {string} the iCalendar date string
		 */
		const toIcalDate = (date) => {
			return date.toISOString().replace(/[:\-]/g, '').split('.')[0] + 'Z';
		}

		/**
		 * Generate a SHA-1 hash of a string
		 * @param {string} text the text to hash
		 * @returns {Promise<string>} the SHA-1 hash, as a base16 string
		 */
		const sha1 = async (text) => {
			const digest = await crypto.subtle.digest("SHA-1", (new TextEncoder()).encode(text));
			return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join("");
		}

		/**
		 * Extract meeting information from the modal's iframe
		 * @param {Document} modalDocument the document of the modal
		 * @returns 
		 */
		const yoinkInformation = async (modalDocument) => {
			const meetingCourse = trimText(modalDocument.getElementById(MEETING_NUMBER_ID)?.textContent);
			const meetingSession = trimText(modalDocument.getElementById(MEETING_SESSION_ID)?.textContent);

			// First two words are the course name, the rest is the description
			const meetingCourseWords = meetingCourse.split(" ");
			const courseName = meetingCourseWords.splice(0, 2).join(" ");
			const description = `${courseName} ${meetingCourseWords.join(" ")}`

			const meetingType = Object.entries(COMPONENT_MAP).find(([key, value]) => meetingSession.toLowerCase().startsWith(key))[1] ?? "";
			const summary = `${courseName} ${meetingType}`.trim();

			const meetingRows = [...modalDocument.querySelectorAll(MEETING_ROW_SELECTOR)];
			meetingRows.shift(); // Remove first row. It is the table's header. Why is it in tbody?

			const meetings = [];
			for (const meetingRow of meetingRows) {
				const [startEndDate, days, times, location /* instructor*/] = [...meetingRow.children]
					.map(node => node.textContent.trim());
				const [startDate, endDate] = startEndDate.split(" - ");
				const [startTime, endTime] = times.split(" to ");

				const dtstart = parseDateTime(startDate, startTime);
				const dtend = parseDateTime(startDate, endTime);

				const byDay = DAY_MAP[days.toLowerCase()];
				// Add one day after the end date to make it inclusive
				const until = parseDateTime(endDate, endTime);
				until.setDate(until.getDate() + 1);
				until.setHours(0, 0, 0);

				const uid = await sha1(`${summary}${dtstart}${dtend}${location}${until}`);

				meetings.push({ uid, summary, description, dtstart, dtend, location, rrule: { byDay, until } });
			}

			return meetings;
		}

		/**
		 * Download a string as a file
		 * @param {string} content the string content to download
		 */
		const downloadFile = (content) => {
			const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = "uoa-sso-calendar.ics";
			document.body.appendChild(a);

			a.click();

			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		};

		// Ensure the "List View" tab is selected
		await ensureTabSelected(document, TIMETABLE_VIEW_TAB_SELECTOR, TIMETABLE_VIEW_TAB_TEXT);

		// Fetch the rows of classes inside the List View
		const timetableRows = document.querySelectorAll(TIMETABLE_ROW_SELECTOR);

		let aggregateMeetings = [];
		for (const timetableRow of timetableRows) {
			timetableRow.click();

			// Wait for the modal to load
			const modalDocument = await awaitModalDocument("OPEN");

			await ensureTabSelected(modalDocument, COURSE_INFORMATION_TAB_SELECTOR, COURSE_INFORMATION_TAB_TEXT);
			const meetings = await yoinkInformation(modalDocument);

			aggregateMeetings = [...aggregateMeetings, ...meetings];

			// Close the modal
			modalDocument.getElementById(MODAL_CLOSE_ID).click();
			await awaitModalDocument("CLOSE");
		}

		const currentDate = toIcalDate(new Date());

		// iCalendar file as array of lines
		// NOTE: I have no idea what I doing, it might be wrong, lol
		const ical = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"SUMMARY:UoA SSO Timetable",
			"PRODID:-//excigma.xyz//UoA SSO Timetable to iCal//EN",
			"X-WR-CALNAME:UoA SSO Timetable",
			`CREATED:${currentDate}`,
			`LAST-MODIFIED:${currentDate}`
		];

		for (const meeting of aggregateMeetings) {
			ical.push("BEGIN:VEVENT");
			ical.push(`UID:${meeting.uid}`);
			ical.push(`SUMMARY:${meeting.summary}`);
			ical.push(`DESCRIPTION:${meeting.description}`);
			ical.push(`DTSTAMP:${currentDate}`);
			ical.push(`DTSTART:${toIcalDate(meeting.dtstart)}`);
			ical.push(`DTEND:${toIcalDate(meeting.dtend)}`);
			ical.push(`LOCATION:${meeting.location}`);
			ical.push(`RRULE:FREQ=WEEKLY;BYDAY=${meeting.rrule.byDay};UNTIL=${toIcalDate(meeting.rrule.until)}`);
			ical.push("END:VEVENT");
		}

		ical.push("END:VCALENDAR");

		console.log(aggregateMeetings);
		console.log(ical.join("\r\n"));
		downloadFile(ical.join("\r\n"));
	})();