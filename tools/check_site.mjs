// Visual + overflow check for the SAKSI landing page install section.
import puppeteer from "puppeteer-core";

const CHROME =
  "C:/saksi-hackathon/demo-video/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe";
const URL = process.env.SITE_URL || "file:///C:/saksi-hackathon/live-demo/index.html";
const OUT = process.env.OUT_DIR || "C:/saksi-hackathon/live-demo";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

async function shot(name, width, height, mobile = false) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile });
  await page.goto(URL, { waitUntil: "networkidle0" });

  // Measure horizontal overflow across the whole document.
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const wide = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > de.clientWidth + 1) {
        wide.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 40),
          right: Math.round(r.right),
        });
      }
    });
    return {
      scrollW: de.scrollWidth,
      clientW: de.clientWidth,
      delta: de.scrollWidth - de.clientWidth,
      offenders: wide.slice(0, 6),
    };
  });

  // Force scroll-reveal targets visible so the capture is not half-faded.
  await page.evaluate(() => {
    document
      .querySelectorAll(".sec-head, .problem, .saksi, .bound, .metric, .step, .status-card, .critical, .honest")
      .forEach((t) => {
        t.style.opacity = "1";
        t.style.transform = "none";
      });
  });

  const section = await page.$("#pasang");
  await section.screenshot({ path: `${OUT}/_check_pasang_${name}.png` });

  // Also capture the open developer path.
  await page.evaluate(() => {
    const d = document.querySelector(".dev-path");
    if (d) d.open = true;
  });
  await new Promise((r) => setTimeout(r, 400));
  await section.screenshot({ path: `${OUT}/_check_pasang_${name}_dev.png` });

  console.log(
    `${name} ${width}x${height}: scrollW=${overflow.scrollW} clientW=${overflow.clientW} overflow=${overflow.delta}px`
  );
  if (overflow.offenders.length) console.log("  offenders:", JSON.stringify(overflow.offenders));
  await page.close();
}

await shot("desktop", 1440, 1150, false);
await shot("mobile", 390, 844, true);
await browser.close();
console.log("done");
