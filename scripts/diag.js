async function run() {
  const cdpRes = await fetch('http://localhost:9222/json');
  const targets = await cdpRes.json();
  const pageTarget = targets.find(t => t.url && t.url.includes('localhost:3000/saimoon/'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) cb.reject(data.error);
      else cb.resolve(data.result);
    }
  };

  await new Promise((resolve) => { ws.onopen = resolve; });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      // Test dispatching keydown '1'
      const event = new KeyboardEvent('keydown', { key: '1', bubbles: true, cancelable: true });
      window.dispatchEvent(event);

      // Wait 300ms for React state update and render
      await new Promise(r => setTimeout(r, 300));
      
      const dialog = document.querySelector('[role="dialog"]');
      return {
        hasDialog: !!dialog,
        dialogLabel: dialog ? dialog.getAttribute('aria-label') : null,
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Diagnostic result:', res.result.value);
  ws.close();
}
run();
