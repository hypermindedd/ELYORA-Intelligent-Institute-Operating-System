import { chromium } from "playwright";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
const server=spawn(process.execPath,["examples/live-audio/server.mjs"],{env:{...process.env,PORT:"0"},stdio:["ignore","pipe","inherit"]});
let browser;
try {
  const [output]=await once(server.stdout,"data");
  const url=String(output).match(/http:\/\/127\.0\.0\.1:\d+/)[0];
  browser=await chromium.launch({args:["--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream","--autoplay-policy=no-user-gesture-required"]});
  const context=await browser.newContext({permissions:["microphone"]});
  const host=await context.newPage(); await host.goto(url);
  const guest=await context.newPage(); await guest.goto(await host.locator("#guest").getAttribute("href").then(path=>new URL(path,url).href));
  await guest.locator("#join").click(); await host.locator("#join").click();
  for (const page of [host,guest]) {
    await page.locator('[data-status="connected"]').waitFor();
    await page.waitForFunction(()=>document.querySelector("audio").currentTime > 0.2 && document.querySelector("audio").srcObject?.getAudioTracks()[0]?.readyState==="live");
  }
  await guest.locator("#mute").click();
  assert.equal(await guest.locator("#mute").getAttribute("aria-pressed"),"true");
  await guest.locator("#leave").click();
  for (const page of [host,guest]) {
    await page.locator('[data-status="left"]').waitFor();
    assert.equal(await page.locator("#remote").evaluate(el=>el.srcObject),null);
  }
  await guest.evaluate(() => {
    navigator.mediaDevices.getUserMedia = () => { throw Error("Listen-only must not request a microphone"); };
  });
  await guest.locator("#listen").click();
  await host.locator("#join").click();
  await guest.locator('[data-status="connected"]').waitFor();
  await guest.waitForFunction(()=>document.querySelector("audio").currentTime > 0.2);
  assert.ok(await guest.locator("#mute").isDisabled());
  await host.locator("#leave").click();
  await guest.locator('[data-status="left"]').waitFor();
  console.log("PASS voluntary listen-only guest with no microphone request");
  console.log("PASS two local browser tabs, bidirectional synthetic audio, mute control and teardown");
} finally { await browser?.close(); server.kill(); }
