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
      // Find all buttons in the orbit system
      const buttons = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
      const info = buttons.map(b => ({
        label: b.getAttribute('aria-label'),
        rect: b.getBoundingClientRect()
      }));

      // Try clicking the first button (Career)
      const btn = buttons.find(b => b.getAttribute('aria-label')?.includes('Video') || b.getAttribute('aria-label')?.includes('Career'));
      if (btn) {
        btn.click();
      }

      return {
        count: buttons.length,
        buttons: info,
        dialogAfterClick: !!document.querySelector('[role="dialog"]')
      };
    })()`,
    returnByValue: true
  });
  console.log('Button click test result:', res.result ? res.result.value : res);
  ws.close();
}
run();
