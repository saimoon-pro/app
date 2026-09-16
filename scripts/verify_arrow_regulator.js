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
  await send('Runtime.enable');

  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      const getRegText = () => {
        const span = Array.from(document.querySelectorAll('span')).find(s => ['Cyber Emerald', 'Vortex Grid', 'Quantum Flow', 'Nebula Drive', 'Matrix Core', 'Prism Horizon'].includes(s.innerText.trim()));
        return span ? span.innerText.trim() : 'none';
      };

      const start = getRegText();
      
      // Dispatch ArrowRight
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await new Promise(r => setTimeout(r, 200));
      const afterRight = getRegText();

      // Dispatch ArrowLeft
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await new Promise(r => setTimeout(r, 200));
      const afterLeft = getRegText();

      // Dispatch ArrowLeft again (should wrap to 6: Prism Horizon)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await new Promise(r => setTimeout(r, 200));
      const afterWrap = getRegText();

      return { start, afterRight, afterLeft, afterWrap };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Regulator Arrow Key Test Results:', res.result.value);
  ws.close();
}
run();
