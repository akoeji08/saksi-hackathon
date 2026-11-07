// Verify the live expert-card CTA opens the WorkBuddy launch link.
import puppeteer from "puppeteer-core";

const CHROME =
  "C:/saksi-hackathon/demo-video/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe";
const URL =
  process.env.SITE_URL ||
  "https://saksi-demo.apps.workbuddy.host/?sharecode=WGMP2W2QLO";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

const opened = [];
page.on("popup", (p) => opened.push(p.url()));
// window.open with noopener may not emit a popup page; capture the call too.
await page.evaluateOnNewDocument(() => {
  window.__opened = [];
  const real = window.open;
  window.open = (...args) => {
    window.__opened.push(args[0]);
    return real.apply(window, args);
  };
});

await page.goto(URL, { waitUntil: "networkidle0" });

const dataLaunch = await page.$eval("#ec-cta", (el) => el.dataset.launch || "");
console.log("data-launch present:", Boolean(dataLaunch));
if (dataLaunch) console.log("  ", dataLaunch.slice(0, 90) + "…");

await page.$eval("#ec-cta", (el) => el.scrollIntoView({ block: "center" }));
await new Promise((r) => setTimeout(r, 400));
await page.click("#ec-cta");
await new Promise((r) => setTimeout(r, 900));

const calls = await page.evaluate(() => window.__opened || []);
const label = await page.$eval("#ec-cta", (el) => el.textContent.trim());
const isDone = await page.$eval("#ec-cta", (el) => el.classList.contains("is-done"));

console.log("window.open calls:", calls.length);
for (const c of calls) console.log("  ->", String(c).slice(0, 90) + "…");
console.log("button label:", JSON.stringify(label));
console.log("fallback state (is-done):", isDone);

const ok =
  calls.length === 1 &&
  calls[0].includes("/work/launch/") &&
  calls[0].includes("sharecode=") &&
  !isDone;
console.log(ok ? "PASS — CTA opens the launch link" : "FAIL");

await browser.close();
process.exit(ok ? 0 : 1);
