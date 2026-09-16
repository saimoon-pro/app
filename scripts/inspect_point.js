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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.elementFromPoint(1609, 298);
      let chain = [];
      let cur = el;
      while (cur) {
        chain.push({
          tag: cur.tagName,
          id: cur.id,
          className: cur.className,
          role: cur.getAttribute('role'),
          ariaLabel: cur.getAttribute('aria-label'),
          style: cur.getAttribute('style'),
          pointerEvents: window.getComputedStyle(cur).pointerEvents
        });
        cur = cur.parentElement;
      }
      return { elementAtPoint: chain[0], fullChain: chain.slice(0, 8) };
    })()`,
    returnByValue: true
  });
  console.log('Element at click point:', res.result ? res.result.value : res);
  ws.close();
}
run();
