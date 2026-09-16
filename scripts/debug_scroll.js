import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function debug() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  await wait(2000);

  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  const tab = tabs[0];
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise((res) => (ws.onopen = res));

  // Set device metrics FIRST
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await send('Runtime.enable');
  await send('Page.enable');

  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.addEventListener('DOMContentLoaded', () => {
        const el = document.querySelector('.mobile-layout-scroll');
        if (el) {
          console.log('INITIAL scrollTop:', el.scrollTop);
          el.addEventListener('scroll', () => {
            console.log('SCROLL DETECTED! scrollTop =', el.scrollTop, new Error().stack);
          });
        }
      });
    `,
  });

  // Listen to console API calls
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER LOG:', data.params.args.map(a => a.value).join(' '));
    }
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  await send('Page.navigate', { url: 'http://localhost:3000/saimoon/' });
  await wait(3500);

  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('.mobile-layout-scroll');
        const h1 = el ? el.querySelector('h1') : null;
        const rect = h1 ? h1.getBoundingClientRect() : null;
        return {
          scrollTop: el ? el.scrollTop : null,
          h1Rect: rect ? { top: rect.top, bottom: rect.bottom, height: rect.height } : null,
          h1Text: h1 ? h1.innerText : null,
        };
      })()
    `,
    returnByValue: true,
  });

  console.log('Debug info:', JSON.stringify(res.result?.result?.value, null, 2));

  // Capture fresh screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const fs = await import('fs');
  fs.writeFileSync(
    'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\70bbd6cb-0e2b-41eb-b75f-57d93d1492f8\\fresh_mobile_load.png',
    Buffer.from(shot.result.data, 'base64')
  );
  console.log('Saved fresh_mobile_load.png');

  ws.close();
  chrome.kill();
}

debug();
