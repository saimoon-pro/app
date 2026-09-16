import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\70bbd6cb-0e2b-41eb-b75f-57d93d1492f8';

async function verifyAll() {
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.url.includes('saimoon'));
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;
  function send(method, params = {}) {
    return new Promise(res => {
      const msgId = id++;
      const handler = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          res(data);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  await new Promise(res => ws.onopen = res);

  // Helper to capture
  async function captureView(name, width, height, mobile, scrollTop = 0) {
    console.log(`Capturing ${name} (${width}x${height}, scroll=${scrollTop})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: mobile ? 2 : 1,
      mobile,
    });
    // Ensure any open dialogs are closed
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll("button").forEach(b => {
          if (b.getAttribute("aria-label")?.includes("Close") || b.innerText === "✕") b.click();
        });
        const el = document.querySelector('.mobile-layout-scroll');
        if (el) el.scrollTop = ${scrollTop};
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, `${name}.png`), Buffer.from(shot.result.data, 'base64'));
    console.log(`Saved ${name}.png`);
  }

  // 1. Mobile 360 x 740 - Top
  await captureView('screen_mobile_360_top', 360, 740, true, 0);

  // 2. Mobile 360 x 740 - Scrolled
  await captureView('screen_mobile_360_scrolled', 360, 740, true, 340);

  // 3. Mobile 390 x 844 - Top
  await captureView('screen_mobile_390_top', 390, 844, true, 0);

  // 4. Mobile 390 x 844 - Scrolled
  await captureView('screen_mobile_390_scrolled', 390, 844, true, 340);

  // 5. Tablet 768 x 1024
  await captureView('screen_tablet_768x1024', 768, 1024, true, 0);

  // 6. Laptop 1366 x 768
  await captureView('screen_laptop_1366x768', 1366, 768, false, 0);

  // 7. Desktop 1920 x 945
  await captureView('screen_desktop_1920x945', 1920, 945, false, 0);

  ws.close();
  console.log('All screens verified successfully!');
}

verifyAll();
