import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import {Config} from './config';
import {tryLookupAndLoop, Stores} from './store';
import {adBlocker, getSleepTime, Logger} from './util';

puppeteer.use(stealthPlugin());
puppeteer.use(adBlocker);

/**
 * Starts the bot.
 */
async function main() {
	const browser = await puppeteer.launch({
		headless: Config.browser.isHeadless,
		defaultViewport: {
			height: Config.page.height,
			width: Config.page.width
		}
	});

	for (const store of Stores) {
		Logger.debug(store.links);
		if (store.setupAction !== undefined) {
			store.setupAction(browser);
		}

		setTimeout(tryLookupAndLoop, getSleepTime(), browser, store);
	}
}

/**
 * Will continually run until user interferes.
 */
try {
	void main();
} catch (error) {
	// Ignoring errors; more than likely due to rate limits
	Logger.error(error);
	void main();
}
