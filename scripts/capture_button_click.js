import fs from 'fs';
import path from 'path';

async function run() {
  const cdpRes = await fetch('http://localhost:9222/json');
  const targets = await cdpRes.json();
  const pageTarget = targets.find(t => t.url && t.url.includes('localhost:3000/saimoon/'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const send = (m, p = {}) => new Promise((resolve) => {
    const msgId = id++;
    const cb = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === msgId) { ws.removeEventListener('message', cb); resolve(d.result); }
    };
    ws.addEventListener('message', cb);
    ws.send(JSON.stringify({ id: msgId, method: m, params: p }));
  });
  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');
  await send('Input.enable');

  // Ensure desktop view
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 945,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 200));

  // Close any dialog
  await send('Runtime.evaluate', {
    expression: "window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }))"
  });
  await new Promise(r => setTimeout(r, 300));

  // Find visible video button
  const btnCoords = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
      const visible = all.filter(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
      const videoBtn = visible.find(b => b.getAttribute('aria-label')?.includes('Video'));
      if (!videoBtn) return null;
      const r = videoBtn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    returnByValue: true
  });

  const { x, y } = btnCoords.result.value;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\70bbd6cb-0e2b-41eb-b75f-57d93d1492f8\\orbit_button_click_verified.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', outPath);

  ws.close();
}
run();
