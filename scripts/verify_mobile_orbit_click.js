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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 400));

  // Close any dialog first
  await send('Runtime.evaluate', {
    expression: "window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }))"
  });
  await new Promise(r => setTimeout(r, 300));

  // Find visible button in mobile view
  const btnCoords = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
      const visible = all.filter(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
      const videoBtn = visible.find(b => b.getAttribute('aria-label')?.includes('Video'));
      if (!videoBtn) return null;
      const r = videoBtn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
    })()`,
    returnByValue: true
  });
  console.log('Mobile Video button coords:', btnCoords.result.value);

  const { x, y } = btnCoords.result.value;

  // Simulate touch tap via TouchEvent dispatch
  await send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }]
  });
  await new Promise(r => setTimeout(r, 80));
  await send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  });
  await new Promise(r => setTimeout(r, 400));

  const mobileDialogState = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return {
        open: !!dialog,
        title: dialog ? dialog.getAttribute('aria-label') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('After mobile tap on Video button:', mobileDialogState.result.value);

  // Close with 0
  await send('Runtime.evaluate', {
    expression: "window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }))"
  });
  await new Promise(r => setTimeout(r, 300));

  // Restore desktop viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 945,
    deviceScaleFactor: 1,
    mobile: false
  });

  ws.close();
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
