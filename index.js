const puppteteer = require('puppeteer');  
const fs = require('fs'); 

let rawdata = fs.readFileSync('.secrets');
let users = JSON.parse(rawdata);

//let url = "https://www.youtube.com/watch?v=VxvPjBvvemA";
let url = "https://www.youtube.com/watch?v=gqvqDGRsLz0";

// Puppeteer queries the specified CSS selector and then passes the result to the lambda function
async function getEvalText(page, selector) {
	return await page.evaluate((selector) => {
		return document.querySelector(selector).innerText
	}, selector);
}

const delay = t => new Promise(resolve => setTimeout(resolve, t));



// Create an async function to handle the asyncronous opetations between the brwoser and puppeteer, which are exposed via promises 
async function execute(url) {
    const browser = await puppteteer.launch({
        headless: false, // Option to open up the browser
        defaultViewport: null // Adjustes possible graphical glitches
    });
    const page = await browser.newPage();

    const navigationPromise = page.waitForNavigation();
    //await navigationPromise;

    await page.goto(url);

    // Tell puppeteer to wait untill this CSS selector is loaded in the page
    const durationSelector = `#movie_player span.ytp-time-duration`;
    await page.waitForSelector(durationSelector);
    const durationText = await getEvalText(page, durationSelector);

    // Retrieve the play button
    const playSelector = `#movie_player > div.ytp-cued-thumbnail-overlay > button`;
    await page.waitForSelector(playSelector);
    await page.$eval(playSelector, button => button.click());

    console.log(durationText);
    let durationComponents = durationText.slit(':');
    if (durationComponents.length < 3)
        durationComponents.unshift(0); // Insert 0 at the beginning of the array
    // Calculate the duration in seconds
    let duration = durationComponents[0] * 3600 + durationComponents[1] * 60 + durationComponents[2];
    delay(duration*1000).then(() => browser.close());
}

for (let i=0; i<2; i++) {
    await execute(url);
    //delay(1000).then(() => execute(url));
}
