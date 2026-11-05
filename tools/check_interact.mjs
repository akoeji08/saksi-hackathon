// Interaction test: expert-card CTA fallback + prompt shortcut into the live demo.
import puppeteer from "puppeteer-core";

const CHROME =
  "C:/saksi-hackathon/demo-video/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe";
const URL = "file:///C:/saksi-hackathon/live-demo/index.html";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage();
page.on("console", (m) => {
  if (m.type() === "error") console.log("PAGE ERROR:", m.text());
});
page.on("pageerror", (e) => console.log("PAGE EXCEPTION:", e.message));

await page.setViewport({ width: 1440, height: 1000 });
await page.goto(URL, { waitUntil: "networkidle0" });

// 1. CTA with no launch link configured -> honest fallback state.
await page.evaluate(() => document.getElementById("ec-cta").click());
await new Promise((r) => setTimeout(r, 200));
const ctaState = await page.evaluate(() => {
  const b = document.getElementById("ec-cta");
  const f = document.getElementById("ec-fine");
  return { text: b.textContent.trim(), done: b.classList.contains("is-done"), fineHidden: f.hidden, fine: f.textContent.trim() };
});
console.log("CTA fallback:", JSON.stringify(ctaState));

// 2. Prompt shortcut should fill the demo input and submit it.
await page.evaluate(() => document.querySelectorAll(".ec-prompt")[1].click());
await new Promise((r) => setTimeout(r, 1200));
const afterPrompt = await page.evaluate(() => {
  const msgs = document.querySelectorAll("#messages .msg, #messages > *");
  return {
    inputValue: document.getElementById("queryInput").value,
    messageCount: msgs.length,
    gateBlocked: document.getElementById("gateBlocked").textContent,
    gateScanned: document.getElementById("gateScanned").textContent,
    gateAllowed: document.getElementById("gateAllowed").textContent,
    lastText: (document.getElementById("messages").innerText || "").slice(-260).replace(/\s+/g, " "),
  };
});
console.log("After prompt click:", JSON.stringify(afterPrompt, null, 2));

await browser.close();
