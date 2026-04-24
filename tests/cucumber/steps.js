// step_definitions/steps.js
// Cucumber + Puppeteer step definitions for all Iteration 3 individual features
//
// Install: npm install @cucumber/cucumber puppeteer
// Run:     npx cucumber-js

const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const puppeteer = require("puppeteer");

const BASE_URL = "http://localhost:3000";

let browser;
let page;

// ─────────────────────────────────────────────
//  Browser lifecycle
// ─────────────────────────────────────────────

Before(async function () {
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();

  // Mock clipboard API so Puppeteer can intercept it
  await page.evaluateOnNewDocument(() => {
    let clipboardText = "";
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text) => { clipboardText = text; },
        readText:  async ()     => clipboardText
      },
      configurable: true
    });
  });
});

After(async function () {
  await browser.close();
});

// ─────────────────────────────────────────────
//  Shared / Background steps
// ─────────────────────────────────────────────

Given("I am logged in", async function () {
  await page.goto(`${BASE_URL}/login/index.html`);
  await page.type("#email", "testuser");
  await page.type("#password", "password123");
  await page.click("button[type='submit']");
  await page.waitForNavigation();
});

Given("I am on the multi-LLM comparison page", async function () {
  await page.goto(`${BASE_URL}/multiLLMChat/multiLLMChat.html`);
  await page.waitForSelector("#comparisonGrid");
});

// ─────────────────────────────────────────────
//  Shared interaction steps
// ─────────────────────────────────────────────

When("I check the checkbox for {string}", async function (modelName) {
  await page.waitForSelector(`input[name="model"][value="${modelName}"]`);
  const checkbox = await page.$(`input[name="model"][value="${modelName}"]`);
  const checked = await checkbox.evaluate(el => el.checked);
  if (!checked) await checkbox.click();
});

When("I type {string} into the prompt input", async function (message) {
  await page.waitForSelector("#promptInput");
  await page.click("#promptInput", { clickCount: 3 });
  await page.type("#promptInput", message);
});

When("I click the send button", async function () {
  await page.click("#sendBtn");
  await page.waitForTimeout(500);
});

// Clicks send but does NOT wait — used to capture the loading state
When("I click the send button immediately", async function () {
  await page.click("#sendBtn");
  // Intentionally no wait — we want to inspect state mid-loading
});

When("I wait for the response to load", async function () {
  await page.waitForFunction(() => {
    const loadingEls = document.querySelectorAll(".response-body.loading");
    return loadingEls.length === 0;
  }, { timeout: 15000 });
});

When("I wait {int} seconds", async function (seconds) {
  await page.waitForTimeout(seconds * 1000);
});

When("no checkboxes are checked", async function () {
  await page.evaluate(() => {
    document.querySelectorAll('input[name="model"]').forEach(cb => cb.checked = false);
  });
});

When("the prompt input is empty", async function () {
  await page.evaluate(() => {
    document.querySelector("#promptInput").value = "";
  });
});

// ─────────────────────────────────────────────
//  Feature 1 — Multi-LLM comparison steps
// ─────────────────────────────────────────────

Then("I should see a response column for {string}", async function (modelName) {
  await page.waitForFunction(
    (name) => document.querySelector(`#body-${name}`) !== null,
    {}, modelName
  );
  const col = await page.$(`#body-${modelName}`);
  if (!col) throw new Error(`Response column for "${modelName}" not found`);
});

Then("I should see the error message {string}", async function (errorMsg) {
  const content = await page.content();
  if (!content.includes(errorMsg)) {
    throw new Error(`Expected error message "${errorMsg}" not found on page`);
  }
});

Then("no response row should be added to the grid", async function () {
  const rows = await page.$$(".comparison-row");
  if (rows.length > 0) throw new Error("Expected no rows but found some");
});

Then("the comparison row should display {string} as the prompt label", async function (text) {
  await page.waitForTimeout(500);
  const content = await page.$eval("#comparisonGrid", el => el.innerHTML);
  if (!content.includes(text)) {
    throw new Error(`Expected prompt label "${text}" not found in grid`);
  }
});

Then("I should see the alert {string}", async function (alertMsg) {
  page.once("dialog", async dialog => {
    const msg = dialog.message();
    await dialog.accept();
    if (!msg.includes(alertMsg)) {
      throw new Error(`Expected alert "${alertMsg}", got "${msg}"`);
    }
  });
});

// ─────────────────────────────────────────────
//  Feature 2 — Response Timer steps
// ─────────────────────────────────────────────

Then("the timer for {string} should show {string}", async function (modelName, expectedText) {
  await page.waitForSelector(`#timer-${modelName}`);
  const timerText = await page.$eval(`#timer-${modelName}`, el => el.textContent);
  if (!timerText.includes(expectedText)) {
    throw new Error(`Expected timer for "${modelName}" to show "${expectedText}", got "${timerText}"`);
  }
});

Then("the timer for {string} should show a time in seconds", async function (modelName) {
  await page.waitForSelector(`#timer-${modelName}`);
  const timerText = await page.$eval(`#timer-${modelName}`, el => el.textContent);
  const pattern = /⏱\s*\d+\.\d+s/;
  if (!pattern.test(timerText)) {
    throw new Error(`Timer for "${modelName}" does not show elapsed seconds. Got: "${timerText}"`);
  }
});

Then("the timer for {string} should match the pattern {string}", async function (modelName, patternDesc) {
  await page.waitForSelector(`#timer-${modelName}`);
  const timerText = await page.$eval(`#timer-${modelName}`, el => el.textContent);
  const pattern = /⏱\s*\d+\.\d+s/;
  if (!pattern.test(timerText)) {
    throw new Error(`Timer "${timerText}" does not match pattern "${patternDesc}"`);
  }
});

// ─────────────────────────────────────────────
//  Feature 3 — Copy to Clipboard steps
// ─────────────────────────────────────────────

Then("the copy button for {string} should not be visible", async function (modelName) {
  await page.waitForSelector(`#copy-${modelName}`);
  const display = await page.$eval(`#copy-${modelName}`, el => el.style.display);
  if (display !== "none") {
    throw new Error(`Expected copy button for "${modelName}" to be hidden, but display was "${display}"`);
  }
});

Then("the copy button for {string} should be visible", async function (modelName) {
  await page.waitForFunction(
    (name) => {
      const btn = document.querySelector(`#copy-${name}`);
      return btn && btn.style.display !== "none";
    },
    { timeout: 15000 }, modelName
  );
});

When("I click the copy button for {string}", async function (modelName) {
  await page.waitForSelector(`#copy-${modelName}`, { visible: true });
  await page.click(`#copy-${modelName}`);
  await page.waitForTimeout(200);
});

Then("the copy button for {string} should display {string}", async function (modelName, label) {
  await page.waitForSelector(`#copy-${modelName}`);
  const btnText = await page.$eval(`#copy-${modelName}`, el => el.textContent.trim());
  if (btnText !== label) {
    throw new Error(`Expected copy button to display "${label}", got "${btnText}"`);
  }
});