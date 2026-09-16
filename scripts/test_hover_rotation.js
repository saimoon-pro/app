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

  const getTransform = async () => {
    const res = await send('Runtime.evaluate', {
      expression: `document.querySelector('[role="radiogroup"]')?.firstElementChild?.style.transform`,
      returnByValue: true
    });
    return res.result?.value;
  };

  // 1. Click video button
  const btnCoords = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
      const videoBtn = all.find(b => b.offsetParent !== null && b.getAttribute('aria-label')?.includes('Video'));
      const r = videoBtn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    returnByValue: true
  });

  const { x, y } = btnCoords.result.value;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 200));

  // Close dialog with key 0
  await send('Runtime.evaluate', {
    expression: "window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }))"
  });
  await new Promise(r => setTimeout(r, 200));

  const before = await getTransform();
  console.log('Before move (after click & 0):', before);

  // Move mouse without pressing any button across the dial
  for (let angle = 0; angle <= Math.PI; angle += 0.2) {
    const mx = 1600 + 150 * Math.cos(angle);
    const my = 400 + 150 * Math.sin(angle);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mx, y: my });
    await new Promise(r => setTimeout(r, 30));
  }

  const after = await getTransform();
  console.log('After hover move:', after);
  console.log('Rotated on hover after click?:', before !== after);

  ws.close();
}
run();
