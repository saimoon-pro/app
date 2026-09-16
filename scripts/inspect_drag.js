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
      const all = Array.from(document.querySelectorAll('[role="radiogroup"]'));
      const g = all.find(el => el.offsetParent !== null && el.getBoundingClientRect().width > 0);
      const r = g.getBoundingClientRect();
      const pt = { x: r.left + r.width / 2 + r.width / 2 - 30, y: r.top + r.height / 2 };
      const el = document.elementFromPoint(pt.x, pt.y);
      return { pt, targetTag: el ? el.tagName : null, targetClass: el ? el.className : null, gRect: { left: r.left, top: r.top, width: r.width, height: r.height } };
    })()`,
    returnByValue: true
  });
  console.log(res.result.value);
  ws.close();
}
run();
