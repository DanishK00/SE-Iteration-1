const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const puppeteer = require('puppeteer');
const assert = require('assert');

let browser;
let page;

Before(async () => {
    browser = await puppeteer.launch({ headless: false }); // visible for demo
    page = await browser.newPage();
});

After(async () => {
    await browser.close();
});

Given('I open a browser', async () => {
    // already handled in Before
});

When('I go to {string}', async (url) => {
    await page.goto(url);
});

Then('I should see the title contains {string}', async (text) => {
    const title = await page.title();
    console.log("Page title:", title);
    assert(title.includes(text));
});