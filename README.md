# User Scripts

This repo contains a collection of (user) scripts that I've made for various websites. Most of them are written in JavaScript and are meant to be used with the [Violentmonkey](https://violentmonkey.github.io/) browser extension. The scripts are meant to automate, simplify, or otherwise improve the user experience of the websites they are made for.

> [!CAUTION]
> **Standard cybersecurity warning:**
> Do not blindly run code from untrusted sources. Please audit the code before running it.

Some scripts no longer work because the website they were made for has changed.

## Usage

> [!NOTE]
> Some scripts are not a user script and are not intended to by run with a user script manager. Scripts intended to by run in console or some other method will end with `.js` file extension. Scripts intended to be run with a user script manager will end with `.user.js`
>
> These steps are intended for `.user.js` scripts with a user script manager.

Install a user script manager. You have a few options depending on your browser. I do not endorse any of the user script managers here, and I've only tested the script in [Violentmonkey](https://violentmonkey.github.io/).
   - On Firefox (including Firefox on Android!) and forks (e.g. Librewolf, Waterfox, Pale Moon):
     -  [Violentmonkey](https://violentmonkey.github.io/): [[Firefox Addons](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)] [[GitHub Releases](https://github.com/violentmonkey/violentmonkey/releases)] [[Source](https://github.com/violentmonkey/violentmonkey)]
     - [Greasemonkey](https://www.greasespot.net/): [[Firefox Addons](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)] [[Source](https://github.com/greasemonkey/greasemonkey/)]
     -  [Tampermonkey](https://www.tampermonkey.net/): [[Firefox Addons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)]
   - On Chromium and forks (e.g. Chrome, Edge, Brave, Opera):
     -  [Violentmonkey](https://violentmonkey.github.io/): [[Chrome Web Store](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)] [[GitHub Releases](https://github.com/violentmonkey/violentmonkey/releases)] [[Source](https://github.com/violentmonkey/violentmonkey)]
     -  [Tampermonkey](https://www.tampermonkey.net/): [[Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)]
   - On Edge:
     -  [Violentmonkey](https://violentmonkey.github.io/): [[Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao)] [[GitHub Releases](https://github.com/violentmonkey/violentmonkey/releases)] [[Source](https://github.com/violentmonkey/violentmonkey)]
     -  [Tampermonkey](https://www.tampermonkey.net/): [[Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)]
   - On Opera:
     -  [Tampermonkey Beta](https://www.tampermonkey.net/): [[Opera Addons](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)]
   - On Safari (unverified; I do not have macOS):
     - Userscripts [[App Store](https://apps.apple.com/xk/app/userscripts/id1463298887)] [[Source](https://github.com/quoid/userscripts)]
     - Tampermonkey [[App Store](https://apps.apple.com/us/app/tampermonkey/id1482490089)]


Create a new script, remove the default code, and paste the code from the `.user.js` file into the script editor and save the script.

Some of my scripts are also published onto [Greasy Fork](https://greasyfork.org/en/users/416480-excigma) which will allow you to install the script with a single click and keep it automatically updated.

I would not advise enabling automatic updating for user scripts. This is a security risk. You should always audit the code before running it, and automatic updates can bypass this step.