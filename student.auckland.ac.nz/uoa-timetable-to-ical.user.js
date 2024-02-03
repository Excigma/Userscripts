// Note: This will NOT work if your timezone is not Pacific/Auckland (e.g. you are overseas). Change your device timezone to Pacific/Auckland

// **Please create a new calendar for this, in case it does not import correctly. That way, you can just delete the calendar if this script messes up, otherwise you WILL need to manually delete the events in the calendar**
// Use at your own risk.

// How to use:
// 0. Standard cybersecurity warning: Do not blindly run scripts from untrusted sources. Please audit the code before running it. Please also read the above notes!!
// 1. Go to the Timetable page on SSO: https://www.student.auckland.ac.nz/psc/ps/EMPLOYEE/SA/c/UOA_MENU_FL.UOA_VW_CAL_FL.GBL
// 2. Open Console (Control + Shift + I, then click on the "Console" tab)
// 3. Paste the code below into the console. You may need to allow pasting before your browser lets you paste the code.
// 4. Press Enter. You should see the script switching to the "List View" tab, opening "Meeting Information" for each meeting then finally downloading a file "uoa-sso-calendar.ics". The ics file's contents will be logged to the console as well.
// 5. It is best to create a new calendar in your calendar app separate from your main calendar, then import the .ics file into that calendar in case something has gone wrong with this script and you need to delete the events. Verify the calendar is correct before confirming the import into your calendar application.
// - Google Calendar: You can make a new calendar by visiting https://calendar.google.com, going to Settings > Add calendar > Create new calendar. Then, you can import the .ics file by going to Settings > Import & export. Make sure you select the correct calendar to import into.

// Note: I've included a userscript header, however, this script is single use, just paste it into the console, there's no point having it installed. I don't believe document-end is enough for the page to finish loading, so the script shouldn't even work.
// I may convert this into a browser extension to automatically navigate to the correct page if UoA does not release an official solution by the time semester starts.


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

(async () => {
	// Yes, the commenting for each constant is excessive. This is to help remember what each constant is for, as some of the class names on SSO are not very descriptive.

	// Meeting Information related
	/** This maps the "Component" field in the timetable to the iCalendar entry like UoACal did */
	const COMPONENT_MAPPING = {
		"lecture": "",
		"tutorial": "TUT",
		"laboratory": "LAB",
		"workshop": "WRK"
	}
	/** "COMPSYS  305 Digital Systems Design" */
	const MEETING_NUMBER_ID = "DERIVED_SSR_FL_SSR_SBJ_CAT_NBR";
	/** "Laboratory  Class 42805" */
	const MEETING_SESSION_ID = "DERIVED_SSR_FL_SSR_SESSION_TRAN";
	/** Rows in "Meeting Information" tab in Details modal */
	const MEETING_ROW_SELECTOR = `tbody > tr[id^=DERIVED_SSR_FL]`

	// "Class Information" Tab related
	/** Class name added to selected tabs in "My Class Timetable": ("List View"/"Weekly Calendar View") and "Class Information": ("Enrolment Information"/"Meeting Information") */
	const TAB_SELECTED_CLASS = "psc_selected";
	/** "List View"/"Weekly Calendar View" tabs */
	const TIMETABLE_VIEW_TAB_SELECTOR = `.ps_box-label [for^="UOA_MYCAL_WRK_SSR_SCHED_FORMAT"]`
	const TIMETABLE_VIEW_TAB_TEXT = "List View"; // The text in the tab we want to select
	/** "Enrolment Information"/"Meeting Information" tabs */
	const COURSE_INFORMATION_TAB_SELECTOR = `.ps_box-label [for^="DERIVED_SSR_FL_SSR_CL_DTLS_LFF"]`
	const COURSE_INFORMATION_TAB_TEXT = "Meeting Information"; // The text in the tab we want to select

	// Miscellaneous IDs and selectors
	/** ID of the loading spinner which shows up when loading (e.g. opening modals) */
	const SPINNER_ID = "WAIT_win0";
	/** ID of the button used to close modals. */
	const MODAL_CLOSE_ID = "#ICCancel"; // There is a `#` in the ID. This is not a typo
	/** Selector of opened modal's <iframe> element */
	const MODAL_IFRAME_SELECTOR = "#pt_modals iframe";
	/** Selector of rows for each class in "List View" */
	const TIMETABLE_ROW_SELECTOR = `[onclick^="javascript:OnRowAction(this,'DERIVED_SSR_FL_SSR_SBJ_CAT_"]`;
	/** Selector of Location ("260-115 (Owen G Glenn, Room 115)") for each class in "List View". Used to map "Owen G Glenn, Room 115" to "260-115" */
	const TIMETABLE_ROW_LOCATION_SELECTOR = `[id^="DERIVED_REGFRM1_SSR_MTG_LOC"]`;

	// Other stuff
	/** Polling rate for elements to appear (ms) */
	const ELEMENT_POLL_RATE = 50;

	// Helper functions
	/** Converts a javascript Date object into an iCal date-time string in the format of `YYYYMMDDTHHMMSSZ` */
	const toIcalDate = (date) => date.toISOString().replace(/[:\-]/g, '').split('.')[0] + 'Z';
	/** Removes duplicate whitespace in between and at ends of words */
	const trimText = (text) => (text?.textContent ?? text)?.trim()?.replaceAll(/[^\S\r\n]+/g, " ");




	// Timezone pre-flight check
	const UOA_TIMEZONE = "Pacific/Auckland";
	const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	if (userTimeZone !== UOA_TIMEZONE) {
		console.error(`Your timezone is not ${UOA_TIMEZONE}. You may need to adjust the times in the calendar.`);
		return;
	}

	// Ensure that the "List View" tab is selected
	await ensureTabSelected(document, TIMETABLE_VIEW_TAB_SELECTOR, TIMETABLE_VIEW_TAB_TEXT);

	// iCalendar file as array of lines
	// NOTE: I have no idea what I doing, it might be wrong, lol
	const currentDate = toIcalDate(new Date());
	const iCalendar = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"SUMMARY:UoA SSO Timetable",
		"PRODID:-//excigma.xyz//UoA SSO Timetable to iCal//EN",
		"X-WR-RELCALID:-//excigma.xyz//UoA SSO Timetable to iCal//EN",
		"X-WR-CALNAME:UoA SSO Timetable",
		`CREATED:${currentDate}`,
		`LAST-MODIFIED:${currentDate}`,
		`SEQUENCE:${Math.floor(Date.now() / 1000)}`,
		"METHOD:PUBLISH"
	];

	// Loop through each "Class" in the "List View" timetable
	for (const timetableRow of document.querySelectorAll(TIMETABLE_ROW_SELECTOR)) {
		// Create a map from "405-536 (Engineering Block 5, Room 536)" to "Engineering Block 5, Room 536": "405-536"
		const roomMapping = {};
		// .innerText is used as it preserves newlines
		trimText(timetableRow.querySelector(TIMETABLE_ROW_LOCATION_SELECTOR)?.innerText)
			.split("\n")
			.map(line => {
				const matches = line.match(/(\S+-\S+)\s+\((.*)\)/);

				if (!matches || matches.length !== 3) return;
				roomMapping[matches[2]] = matches[1];
			});

		// Open the modal, wait for it to load and fetch the document to be able to interact with content inside the it
		timetableRow.click();
		const modalDocument = await awaitModalDocument("OPEN");

		// Ensure the "Meeting Information" tab is selected
		await ensureTabSelected(modalDocument, COURSE_INFORMATION_TAB_SELECTOR, COURSE_INFORMATION_TAB_TEXT);
		// Fetch course name, e.g. "COMPSYS 305 Digital Systems Design"
		const meetingCourse = trimText(modalDocument.getElementById(MEETING_NUMBER_ID));
		// Fetch meeting type, e.g. "Laboratory Class 42805"
		const meetingSession = trimText(modalDocument.getElementById(MEETING_SESSION_ID));

		// First two words are the course name ("COMPSYS 305"), the rest is the description of the course ("Digital Systems Design")
		const meetingCourseWords = meetingCourse.split(" ");
		const courseName = meetingCourseWords.splice(0, 2).join(" ");
		const description = `${courseName} ${meetingCourseWords.join(" ")}`;

		// "Laboratory" is the meeting type, "Class 42805" is the meeting number
		const meetingTypeRaw = trimText(meetingSession.toLowerCase().split("class")?.[0]);
		const meetingType = COMPONENT_MAPPING[meetingTypeRaw] ?? meetingTypeRaw ?? "";
		const summary = `${courseName} ${meetingType}`.trim();

		// Loop through each meeting in the "Meeting Information" modal
		const meetingRows = [...modalDocument.querySelectorAll(MEETING_ROW_SELECTOR)];
		meetingRows.shift(); // Remove first row. It is the table's header. Why is it in tbody?

		for (const meetingRow of meetingRows) {
			const [
				startEndDate, // "27/02/2024 - 26/03/2024"
				_days, // "Tuesday"
				times, // "12:00PM to 2:00PM"
				location, // "Engineering Block 5, Room 536"
				_instructors // "To be Announced"
			] = [...meetingRow.children].map(trimText);
			const [startDate, endDate] = startEndDate.split(" - "); // ["27/02/2024", "26/03/2024"]
			const [startTime, endTime] = times.split(" to "); // ["12:00PM", "2:00PM"]

			const dtstart = parseDateTime(startDate, startTime); // Start of first meeting
			const dtend = parseDateTime(startDate, endTime); // End of first meeting

			// TODO: Is this actually required?
			// Add one day after the end date to make it inclusive
			const until = parseDateTime(endDate, endTime);
			until.setDate(until.getDate() + 1);
			until.setHours(0, 0, 0);

			// https://icalendar.org/
			iCalendar.push(...[
				"BEGIN:VEVENT",
				`UID:${await sha1(`${summary}${dtstart}${dtend}${location}${until}`)}`,
				`SUMMARY:${summary}`,
				`DESCRIPTION:${description}`,
				`DTSTAMP:${currentDate}`,
				`DTSTART:${toIcalDate(dtstart)}`,
				`DTEND:${toIcalDate(dtend)}`,
				`LOCATION:${roomMapping[location] ?? location}`,
				// BYDAY=${meeting.rrule.byDay}; // Excluded because it messes up the days events are on?
				`RRULE:FREQ=WEEKLY;UNTIL=${toIcalDate(until)}`,
				"END:VEVENT"
			])
		}

		// Close the modal
		modalDocument.getElementById(MODAL_CLOSE_ID).click();
		await awaitModalDocument("CLOSE");
	}

	iCalendar.push("END:VCALENDAR");

	const calendar = iCalendar.join("\r\n");
	console.log(calendar);
	downloadFile(calendar, "uoa-sso-calendar.ics");




	// Helper functions
	/**
	 * Wait for the spinner to close on the current document.
	 * Fun fact: THE MODALS ARE IN IFRAMES??? This means that we need to hook into <iframe>s to check the spinner's status as well
	 * @param {Document} thisDocument
	 */
	function awaitSpinnerClose(thisDocument) {
		return new Promise((resolve) => {
			// Using a MutationObserver is more ideal here, but this works well, so I don't want to change it.
			const spinnerInterval = setInterval(async () => {
				// Detect when the spinner is hidden
				if (thisDocument.getElementById(SPINNER_ID)?.style?.visibility !== "visible") {
					clearInterval(spinnerInterval);
					resolve();
				}
			}, ELEMENT_POLL_RATE);
		});
	}

	/**
	 * Detects when a modal has finished opening or closing
	 * @param {"OPEN" | "CLOSE"} action which action should we wait for
	 * @returns the iframe document if opening, nothing if closing
	 */
	function awaitModalDocument(action) {
		return new Promise(async (resolve) => {
			// Wait for the spinner to close if it exists
			await awaitSpinnerClose(document);

			// Using a MutationObserver is more ideal here, but this works well, so I don't want to change it.
			const modalInterval = setInterval(async () => {
				const modalDocument = document.querySelector(MODAL_IFRAME_SELECTOR)?.contentDocument;
				if (action === "OPEN") {
					// Detect when the `<iframe>` is added to the page
					if (modalDocument?.getElementById) {
						clearInterval(modalInterval);

						// Detect when the `<iframe>` modal has its HTML loaded.
						const modalDocumentInterval = setInterval(async () => {
							if (modalDocument.getElementById(MODAL_CLOSE_ID)) {
								clearInterval(modalDocumentInterval);
								resolve(modalDocument);
							}
						}, ELEMENT_POLL_RATE);
					}
				} else if (action === "CLOSE") {
					// Wait for the modal's `<iframe>` to no longer exist
					if (!modalDocument) {
						clearInterval(modalInterval);
						resolve(modalDocument);
					}
				}
			}, ELEMENT_POLL_RATE);
		});
	}

	/**
	 * Ensure that a tab with certain text has been selected
	 * @param {Document} thisDocument the document to check the tabs in
	 * @param {string} tabSelector the selector of the tabs to ensure is selected
	 * @param {string} tabText the text of the tab to ensure is selected
	 */
	async function ensureTabSelected(thisDocument, tabSelector, tabText) {
		const wantedTab = [...thisDocument.querySelectorAll(tabSelector)]
			.find(tab => trimText(tab).toLowerCase() === trimText(tabText).toLowerCase())
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
	function parseDateTime(date, time) {
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
	 * Generate a SHA-1 hash of a string
	 * @param {string} text the text to hash
	 * @returns {Promise<string>} the SHA-1 hash, as a base16 string
	 */
	async function sha1(text) {
		const digest = await crypto.subtle.digest("SHA-1", (new TextEncoder()).encode(text));
		return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join("");
	}

	/**
	 * Download a string as a file
	 * @param {string} content the string content to download
	 */
	function downloadFile(content, filename) {
		const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		document.body.appendChild(a);

		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};
})();