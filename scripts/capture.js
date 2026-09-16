import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\70bbd6cb-0e2b-41eb-b75f-57d93d1492f8';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function capture() {
  console.log('Starting Chrome headless...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000/saimoon/',
  ]);

  await wait(2500);

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find((t) => t.url.includes('saimoon')) || tabs[0];
    console.log('Opened tab:', tab.id, tab.url);

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await new Promise((res) => (ws.onopen = res));
    console.log('WebSocket connected to CDP');

    await send('Page.enable');
    await send('DOM.enable');

    // 1. Mobile Viewport (390 x 844)
    console.log('Capturing Mobile Top View (390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });

    await wait(2000);

    // Ensure scrollTop is at 0 for initial view
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.mobile-layout-scroll');
        if (el) el.scrollTop = 0;
      `,
    });
    await wait(1000);

    // Capture Mobile Top
    const topShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'verified_mobile_top.png'),
      Buffer.from(topShot.result.data, 'base64')
    );
    console.log('Saved verified_mobile_top.png');

    // Scroll down mobile scroll container
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.mobile-layout-scroll');
        if (el) el.scrollTop = 320;
      `,
    });
    await wait(1000);

    const midShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'verified_mobile_middle.png'),
      Buffer.from(midShot.result.data, 'base64')
    );
    console.log('Saved verified_mobile_middle.png');

    // Scroll to bottom
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.mobile-layout-scroll');
        if (el) el.scrollTop = el.scrollHeight;
      `,
    });
    await wait(1000);

    const bottomShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'verified_mobile_bottom.png'),
      Buffer.from(bottomShot.result.data, 'base64')
    );
    console.log('Saved verified_mobile_bottom.png');

    // 2. Tablet Viewport (768 x 1024)
    console.log('Capturing Tablet View (768x1024)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.mobile-layout-scroll');
        if (el) el.scrollTop = 0;
      `,
    });
    await wait(1200);

    const tabShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'verified_tablet_768x1024.png'),
      Buffer.from(tabShot.result.data, 'base64')
    );
    console.log('Saved verified_tablet_768x1024.png');

    // 3. Desktop Viewport (1920 x 945)
    console.log('Capturing Desktop View (1920x945)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 945,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await wait(1500);

    const deskShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'verified_desktop.png'),
      Buffer.from(deskShot.result.data, 'base64')
    );
    console.log('Saved verified_desktop.png');

    ws.close();
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    chrome.kill();
    console.log('Done!');
  }
}

capture();
