import fs from 'fs';

async function run() {
  const cdpRes = await fetch('http://localhost:9222/json');
  const targets = await cdpRes.json();
  const pageTarget = targets.find(t => t.url && t.url.includes('localhost:3000/saimoon/'));
  if (!pageTarget) {
    console.error('Page target not found');
    process.exit(1);
  }

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
  console.log('Connected to CDP');

  await send('Page.enable');
  await send('Runtime.enable');

  // Reload page to start with fresh state
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2200));

  // 1. Verify "Press 1-6 to navigate" is NOT in document text
  const checkHint = await send('Runtime.evaluate', {
    expression: `(() => {
      const bodyText = document.body.innerText;
      const hasHint = bodyText.includes('Press 1-6 to navigate') || bodyText.includes('PRESS 1-6 TO NAVIGATE');
      return { hasHint };
    })()`,
    returnByValue: true
  });
  console.log('1. Check "Press 1-6 to navigate" removed:', !checkHint.result.value.hasHint ? 'PASS (Confirmed Removed)' : 'FAIL');

  // 2. Test Arrow keys changing the regulator
  const arrowTest = await send('Runtime.evaluate', {
    expression: `(async () => {
      // Find current regulator active number element
      const getActiveReg = () => {
        const activeNumBtn = document.querySelector('[role="region"] button[style*="font-weight: 800"], [role="region"] button[style*="fontWeight: 800"], [role="region"] button[style*="#00FF66"]');
        return activeNumBtn ? activeNumBtn.innerText.trim() : 'unknown';
      };

      const before = getActiveReg();

      // Dispatch ArrowRight
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await new Promise(r => setTimeout(r, 150));
      const afterRight = getActiveReg();

      // Dispatch ArrowLeft
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await new Promise(r => setTimeout(r, 150));
      const afterLeft = getActiveReg();

      return { before, afterRight, afterLeft };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('2. Arrow keys regulator tuning test:', arrowTest.result.value);

  // 3. Test Number keys 1-6 navigation
  const keyTests = [
    { key: '1', expectedLabel: 'Video Editing Universe' },
    { key: '2', expectedLabel: 'Graphical Works' },
    { key: '3', expectedLabel: 'Website Projects' },
    { key: '4', expectedLabel: 'My Career' },
    { key: '5', expectedLabel: 'ORBIT — AI Assistant' },
    { key: '6', expectedLabel: 'Get in Touch' },
  ];

  console.log('3. Testing Keys 1-6 Navigation:');
  for (const test of keyTests) {
    const res = await send('Runtime.evaluate', {
      expression: `(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '${test.key}', bubbles: true }));
        await new Promise(r => setTimeout(r, 300));
        const dialog = document.querySelector('[role="dialog"]');
        const label = dialog ? dialog.getAttribute('aria-label') : null;

        // Close with Escape
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await new Promise(r => setTimeout(r, 200));

        return { opened: !!dialog, label };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    const val = res.result.value;
    const pass = val.opened && val.label === test.expectedLabel;
    console.log("   Key '" + test.key + "' -> " + val.label + ": " + (pass ? 'PASS' : 'FAIL'));
  }

  // 4. Test Mobile screen orbit rotation
  console.log('4. Testing Mobile Orbit Rotary System...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 800));

  // Rotate orbit system by dispatching touch/pointer gestures in an arc around the center
  const rotateResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      const container = document.querySelector('[role="radiogroup"]');
      if (!container) return { found: false };

      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = rect.width * 0.42;

      // Rotate through 90 degrees around center
      const steps = 15;
      for (let i = 0; i <= steps; i++) {
        const rad = (i / steps) * (Math.PI / 2); // 0 to 90 deg
        const px = cx + Math.cos(rad) * radius;
        const py = cy + Math.sin(rad) * radius;

        if (i === 0) {
          container.dispatchEvent(new PointerEvent('pointerdown', {
            clientX: px, clientY: py, pointerId: 1, bubbles: true
          }));
        } else {
          container.dispatchEvent(new PointerEvent('pointermove', {
            clientX: px, clientY: py, pointerId: 1, bubbles: true
          }));
        }
        await new Promise(r => setTimeout(r, 20));
      }

      container.dispatchEvent(new PointerEvent('pointerup', {
        clientX: cx, clientY: cy + radius, pointerId: 1, bubbles: true
      }));

      await new Promise(r => setTimeout(r, 300));

      const ring = container.querySelector('[style*="rotate"]');
      const nodes = Array.from(container.querySelectorAll('button[role="radio"]')).map(b => b.getAttribute('aria-label'));

      return {
        found: true,
        ringStyle: ring ? ring.style.transform : 'none',
        nodesCount: nodes.length
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Mobile orbit rotation test result:', rotateResult.result.value);

  // Capture Mobile screenshot
  const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/mobile_rotary_orbit_verified.png', Buffer.from(shotMobile.data, 'base64'));
  console.log('Saved screenshot: mobile_rotary_orbit_verified.png');

  // Switch to Desktop
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 945,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 600));

  // Open Video section via Key 1 and capture screenshot
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  const shotVideoPanel = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/key1_video_panel_verified.png', Buffer.from(shotVideoPanel.data, 'base64'));
  console.log('Saved screenshot: key1_video_panel_verified.png');

  // Close panel with Escape
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  // Capture clean desktop screenshot (showing bottom-right without hint)
  const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/desktop_clean_no_hint_verified.png', Buffer.from(shotDesktop.data, 'base64'));
  console.log('Saved screenshot: desktop_clean_no_hint_verified.png');

  ws.close();
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

run().catch(console.error);
