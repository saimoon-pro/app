import fs from 'fs';

async function run() {
  const cdpRes = await fetch('http://localhost:9222/json');
  const targets = await cdpRes.json();
  const pageTarget = targets.find(t => t.url && t.url.includes('localhost:3000/saimoon/'));
  if (!pageTarget) {
    console.error('Page target not found');
    return;
  }
  console.log('Connecting to:', pageTarget.webSocketDebuggerUrl);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  const consoleMessages = [];

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
    } else if (data.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push({
        type: data.params.type,
        args: data.params.args.map(a => a.value || a.description)
      });
    } else if (data.method === 'Log.entryAdded') {
      consoleMessages.push({
        type: data.params.entry.level,
        text: data.params.entry.text
      });
    }
  };

  await new Promise((resolve) => { ws.onopen = resolve; });
  console.log('Connected to CDP');

  await send('Console.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');

  const failedRequests = [];
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) cb.reject(data.error);
      else cb.resolve(data.result);
    } else if (data.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push({
        type: data.params.type,
        args: data.params.args.map(a => a.value || a.description)
      });
    } else if (data.method === 'Log.entryAdded') {
      consoleMessages.push({
        type: data.params.entry.level,
        text: data.params.entry.text
      });
    } else if (data.method === 'Network.responseReceived') {
      if (data.params.response.status >= 400) {
        failedRequests.push({
          url: data.params.response.url,
          status: data.params.response.status,
          statusText: data.params.response.statusText
        });
      }
    }
  };

  console.log('Reloading page to capture fresh initial load console errors...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4000));

  // Evaluate profile image status and empty src elements in the DOM
  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const img = document.querySelector('img[src*="profile-photo"]');
      const allVideos = Array.from(document.querySelectorAll('video')).map(v => ({
        src: v.getAttribute('src'),
        currentSrc: v.currentSrc,
        readyState: v.readyState
      }));
      const allEmptySrc = Array.from(document.querySelectorAll('[src=""]')).map(el => el.tagName);
      return {
        profileImgFound: !!img,
        profileImgSrc: img ? img.src : null,
        profileImgComplete: img ? img.complete : null,
        profileImgNaturalWidth: img ? img.naturalWidth : null,
        profileImgNaturalHeight: img ? img.naturalHeight : null,
        allVideos,
        allEmptySrc
      };
    })()`,
    returnByValue: true
  });

  console.log('DOM Evaluation Result:', JSON.stringify(evalResult.result.value, null, 2));

  console.log('Captured Console Messages Count:', consoleMessages.length);
  consoleMessages.forEach(m => console.log(JSON.stringify(m)));

  // Filter for errors
  const errors = consoleMessages.filter(m => m.type === 'error' || (m.args && m.args.some(a => String(a).includes('error') || String(a).includes('An empty string'))));
  console.log('Total error messages:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', JSON.stringify(errors, null, 2));
  } else {
    console.log('SUCCESS: Zero errors detected! No empty string ("") src error!');
  }

  console.log('Failed HTTP requests:', JSON.stringify(failedRequests, null, 2));

  // Capture screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  const screenshotPath = 'C:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/profile_big_verified.png';
  fs.writeFileSync(screenshotPath, buffer);
  console.log('Screenshot saved to:', screenshotPath);

  // Capture mobile screenshot
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));
  const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  const mobileBuffer = Buffer.from(mobileScreenshot.data, 'base64');
  const mobileScreenshotPath = 'C:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/profile_big_mobile.png';
  fs.writeFileSync(mobileScreenshotPath, mobileBuffer);
  console.log('Mobile screenshot saved to:', mobileScreenshotPath);

  // Reset viewport
  await send('Emulation.clearDeviceMetricsOverride');

  ws.close();
}

run().catch(console.error);
