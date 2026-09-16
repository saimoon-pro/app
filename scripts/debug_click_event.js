// ES Module

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

  await send('Runtime.evaluate', {
    expression: `(() => {
      window.__eventsLog = [];
      const log = (target, phase, type, e) => {
        window.__eventsLog.push({
          target,
          phase,
          type,
          actualTarget: e.target ? (e.target.tagName + (e.target.className ? '.' + e.target.className.slice(0, 20) : '')) : null,
          pointerId: e.pointerId
        });
      };
      const all = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
      const videoBtn = all.find(b => b.offsetParent !== null && b.getAttribute('aria-label')?.includes('Video'));
      const radiogroup = videoBtn?.closest('[role="radiogroup"]');

      ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click'].forEach(evt => {
        videoBtn?.addEventListener(evt, (e) => log('button', 'capture', evt, e), true);
        videoBtn?.addEventListener(evt, (e) => log('button', 'bubble', evt, e), false);
        radiogroup?.addEventListener(evt, (e) => log('radiogroup', 'capture', evt, e), true);
        radiogroup?.addEventListener(evt, (e) => log('radiogroup', 'bubble', evt, e), false);
      });
      return { found: !!videoBtn };
    })()`
  });

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
  console.log('Dispatching mouse click at:', x, y);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 200));

  const logResult = await send('Runtime.evaluate', {
    expression: `window.__eventsLog`,
    returnByValue: true
  });
  console.log('Events fired during click:', JSON.stringify(logResult.result?.value, null, 2));

  ws.close();
}
run();
