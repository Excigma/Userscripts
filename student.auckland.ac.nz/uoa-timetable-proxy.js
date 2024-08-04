/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// Deployed to https://mytimetable.excigma.workers.dev/

export default {
	async fetch(request, env, ctx) {
		const defaultSummaryTemplate = "$ModuleUserText2 - $Eventtype";
		const defaultLocationTemplate = "$LocationName";

		const url = new URL(request.url);

		const help = `Please insert the ics URL from mytimetable as the \`calendar\` url search parameter.
For example, if your mytimetable calendar's url is \`https://example.com/calendar.ics\`, please use:
${url.origin}/?calendar=https://example.com/calendar.ics

For advanced users, you can (MAYBE) additionally change the summary and location template returned by using \`summaryTemplate\` and \`locationTemplate\` respectively.
The information in the template need to exist in the summary field with the ugly block of text
Some examples (as of Aug 5, 2024):

${url.origin}/?calendar=url&summaryTemplate=%24ModuleUserText2%20-%20%24Eventtype
${url.origin}/?calendar=url&summaryTemplate=%24ModuleUserText2%20-%20%24Eventtype&%24LocationName

I haven't tested this yet. No clue if it actually works.
`

		if (!url.searchParams.get("calendar")) {
			return new Response(help);
		}

		const response = await fetch(url.searchParams.get("calendar"));
		const text = await response.text();

		/**
		 * Updates the events in the .ics file with fields that are more sane
		 * @param {String} icsString input string of the .ics file
		 * @returns String output .ics with the events updated
		 */
		function updateIcs(icsString) {
			// Matches an event in the iCalendar file.
			return icsString.replace(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/gm, (event) => {
				const description = event.match(buildFieldRegex("DESCRIPTION"))?.[1];
				const parsed = parseDescription(description);

				// Can't find the description field, return the event as is
				if (description === undefined) return event;

				// Keys from the DESCRIPTION to be used to replace the SUMMARY/LOCATION field
				const summaryTemplate = defaultSummaryTemplate;
				const locationTemplate = defaultLocationTemplate;

				// Build the replacement strings
				const summary = buildReplacement(summaryTemplate, parsed);
				const location = buildReplacement(locationTemplate, parsed);

				// Replace the SUMMARY and LOCATION fields
				if (summary !== undefined)
					event = event.replace(buildFieldRegex("SUMMARY"), `SUMMARY:${summary}\n$2`);

				if (location !== undefined)
					event = event.replace(buildFieldRegex("LOCATION"), `LOCATION:${location}\n$2`);
				return event;
			});
		}

		/**
		 * Converts a template string into a replacement string
		 * @param {String} template String with templates like "$ModuleUserText2 - $Eventtype".
		 * @param {Map<String, String>} parsed 
		 */
		function buildReplacement(template, parsed) {
			// Replace all the templates with the parsed values, ignore case
			return template.replace(/\$([a-zA-Z0-9]+)/gi, (match, key) => {
				return parsed.get(key.toLowerCase()) ?? "";
			});
		}

		/**
		 * Parses the description into a key: value mapping
		 * @param {*} description Description from the DESCRIPTION field of the .ics from mytimetable
		 * @returns {Map<String, String>} Object with the key: value pairs from the description
		 */
		function parseDescription(description) {
			const parsed = new Map();

			if (description === undefined) return parsed;
			description
				// Remove newlines and whitespace at start of lines in the description
				.replaceAll(/(\s?[\r\n|\r|\n]\s?)/gm, '')
				// Split by their 'new lines'
				.split('\\n')
				.forEach((line) => {
					// Split "Event type: LEC" by the colon
					const [key, value] = line.split(':');

					if (!key || !value) return;

					// Remove all whitespace the key and value
					const formattedKey = key.replace(/\s/g, '').toLowerCase();
					const formattedValue = value.trim(); // .replace(/\s/g, '');

					// Add to the parsed object
					parsed.set(formattedKey, formattedValue);
				});

			return parsed;
		}

		function buildFieldRegex(key) {
			return new RegExp(`${key}:([\\s\\S]*?)\\n([A-Z]+:|END:VEVENT)`, 'm');
		}

		return new Response(updateIcs(text));
	},
};