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

  // Close any dialog first with key 0
  await send('Runtime.evaluate', {
    expression: "window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }))"
  });
  await new Promise(r => setTimeout(r, 400));

  // Find the VISIBLE desktop video button
  const btnCoords = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find the button in the desktop layout (offsetParent !== null and clientWidth > 0)
      const all = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
      const visible = all.filter(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
      const videoBtn = visible.find(b => b.getAttribute('aria-label')?.includes('Video'));
      if (!videoBtn) return null;
      const r = videoBtn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
    })()`,
    returnByValue: true
  });
  console.log('Visible desktop Video button coordinates:', btnCoords.result ? btnCoords.result.value : btnCoords);

  if (!btnCoords.result?.value) {
    console.error('No visible video button found!');
    ws.close();
    return;
  }

  const { x, y } = btnCoords.result.value;

  // Dispatch real CDP mouse events (mousePressed, mouseReleased)
  console.log('Dispatching CDP mouse click at', x, y);
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount: 1
  });
  await new Promise(r => setTimeout(r, 80));
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount: 1
  });

  await new Promise(r => setTimeout(r, 500));

  const afterClick = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return {
        dialogOpen: !!dialog,
        dialogTitle: dialog ? dialog.getAttribute('aria-label') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('After REAL mouse click on Video button:', afterClick.result ? afterClick.result.value : afterClick);

  ws.close();
}
run();
