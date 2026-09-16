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
    expression: `(async () => {
      // Find all videos currently in DOM
      const allVideos = Array.from(document.querySelectorAll('video')).map(v => ({
        src: v.src,
        currentSrc: v.currentSrc,
        readyState: v.readyState,
        opacity: v.style.opacity,
        zIndex: v.style.zIndex,
        className: v.className
      }));
      return allVideos;
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('All videos in DOM:', res.result ? res.result.value : res);
  ws.close();
}
run();
