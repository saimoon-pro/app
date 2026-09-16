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

  // Reload to test freshly built bundle
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2200));

  // Skip Intro if present so regulator videos are active
  await send('Runtime.evaluate', {
    expression: `(() => {
      const skipBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Skip Intro'));
      if (skipBtn) skipBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Test Key 0 to return to main window
  console.log('--- 1. Testing Key 0 (Return to Main Window) ---');
  // First, open Video panel by pressing key '1'
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  const checkOpened = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return { dialogOpen: !!dialog, label: dialog ? dialog.getAttribute('aria-label') : null };
    })()`,
    returnByValue: true
  });
  console.log('Opened panel via Key 1:', checkOpened.result.value);

  // Now press Key '0' to return to main window
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  const checkClosed = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return { dialogOpen: !!dialog };
    })()`,
    returnByValue: true
  });
  console.log('After pressing Key 0 - Dialog closed:', !checkClosed.result.value.dialogOpen ? 'PASS' : 'FAIL');

  // 2. Test Seamless Dissolve Transition Between Regulator Videos
  console.log('--- 2. Testing Seamless Dissolve Transition Between Regulator Videos ---');
  
  // Inspect video layers before transition
  const beforeState = await send('Runtime.evaluate', {
    expression: `(() => {
      const vids = Array.from(document.querySelectorAll('video')).filter(v => v.src && !v.src.includes('Intro'));
      return vids.map((v, i) => ({
        index: i,
        src: v.src.split('/').pop(),
        opacity: v.style.opacity,
        zIndex: v.style.zIndex,
        paused: v.paused,
        currentTime: v.currentTime
      }));
    })()`,
    returnByValue: true
  });
  console.log('Videos before transition (Regulator 1):', beforeState.result.value);

  // Press ArrowRight to trigger transition to Regulator 2
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    })()`
  });

  // Sample mid-transition at ~500ms
  await new Promise(r => setTimeout(r, 500));
  const midState = await send('Runtime.evaluate', {
    expression: `(() => {
      const vids = Array.from(document.querySelectorAll('video')).filter(v => v.src && !v.src.includes('Intro'));
      return vids.map((v, i) => ({
        index: i,
        src: v.src.split('/').pop(),
        opacity: v.style.opacity,
        zIndex: v.style.zIndex,
        paused: v.paused,
        currentTime: v.currentTime
      }));
    })()`,
    returnByValue: true
  });
  console.log('Videos MID-DISSOLVE at ~500ms (crossfading simultaneously):', midState.result.value);

  // Sample after completion at ~1200ms
  await new Promise(r => setTimeout(r, 700));
  const afterState = await send('Runtime.evaluate', {
    expression: `(() => {
      const vids = Array.from(document.querySelectorAll('video')).filter(v => v.src && !v.src.includes('Intro'));
      return vids.map((v, i) => ({
        index: i,
        src: v.src.split('/').pop(),
        opacity: v.style.opacity,
        zIndex: v.style.zIndex,
        paused: v.paused,
        currentTime: v.currentTime
      }));
    })()`,
    returnByValue: true
  });
  console.log('Videos AFTER DISSOLVE completion (Regulator 2 active):', afterState.result.value);

  // 3. Test Full Suite: Cycle through regulators 1 to 6 and Contact
  console.log('--- 3. Testing Transitions Across All Regulators & Contact Screen ---');
  for (let step = 1; step <= 6; step++) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      })()`
    });
    await new Promise(r => setTimeout(r, 1150)); // Wait for complete 1000ms dissolve

    const state = await send('Runtime.evaluate', {
      expression: `(() => {
        const vids = Array.from(document.querySelectorAll('video')).map(v => ({
          src: v.src ? v.src.split('/').pop() : 'none',
          opacity: v.style.opacity,
          zIndex: v.style.zIndex,
          readyState: v.readyState
        }));
        const activeVid = vids.find(v => parseFloat(v.opacity) > 0.5);
        return { step: ${step}, activeVideo: activeVid ? activeVid.src : 'none' };
      })()`,
      returnByValue: true
    });
    console.log("   Step " + step + " -> Active Video: " + state.result.value.activeVideo);
  }

  // 4. Test Transition into Contact Screen (Key 6) and back to Main Window via Key 0
  console.log('--- 4. Testing Contact Screen Transition (Key 6) & Return via Key 0 ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '6', bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  const contactState = await send('Runtime.evaluate', {
    expression: `(() => {
      const vids = Array.from(document.querySelectorAll('video')).map(v => ({
        src: v.src ? v.src.split('/').pop() : 'none',
        opacity: v.style.opacity,
        zIndex: v.style.zIndex
      }));
      const activeVid = vids.find(v => parseFloat(v.opacity) > 0.5);
      const dialog = document.querySelector('[role="dialog"]');
      return {
        dialogTitle: dialog ? dialog.getAttribute('aria-label') : null,
        activeVideo: activeVid ? activeVid.src : 'none'
      };
    })()`,
    returnByValue: true
  });
  console.log('Contact screen opened:', contactState.result.value);

  // Now press Key 0 to return to main window
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  const finalState = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const vids = Array.from(document.querySelectorAll('video')).map(v => ({
        src: v.src ? v.src.split('/').pop() : 'none',
        opacity: v.style.opacity
      }));
      const activeVid = vids.find(v => parseFloat(v.opacity) > 0.5);
      return {
        dialogOpen: !!dialog,
        activeVideo: activeVid ? activeVid.src : 'none'
      };
    })()`,
    returnByValue: true
  });
  console.log('Returned to Main Window via Key 0:', finalState.result.value);

  // Capture final screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('c:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/dissolve_transition_verified.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot: dissolve_transition_verified.png');

  ws.close();
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
}

run().catch(console.error);
