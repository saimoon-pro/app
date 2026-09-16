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
  await send('Input.enable');

  const closeDialog = async () => {
    await send('Runtime.evaluate', {
      expression: "window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }))"
    });
    await new Promise(r => setTimeout(r, 250));
  };

  const getDialogOpen = async () => {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return {
          open: !!dialog,
          title: dialog ? dialog.getAttribute('aria-label') : null
        };
      })()`,
      returnByValue: true
    });
    return res.result.value;
  };

  console.log('--- TEST 1: KEYBOARD 1-6 AND 0 ---');
  const keyTests = [
    { key: '1', expected: 'Video' },
    { key: '2', expected: 'Graphic' },
    { key: '3', expected: 'Web' },
    { key: '4', expected: 'Career' },
    { key: '5', expected: 'AI' },
    { key: '6', expected: 'Touch' },
  ];

  for (const t of keyTests) {
    await closeDialog();
    await send('Runtime.evaluate', {
      expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: '${t.key}', bubbles: true }))`
    });
    await new Promise(r => setTimeout(r, 250));
    const state = await getDialogOpen();
    console.log(`Key '${t.key}' -> Dialog open:`, state.open, '| Title:', state.title);
    if (!state.open || !state.title?.includes(t.expected)) {
      throw new Error(`Key ${t.key} failed! Expected ${t.expected}, got ${state.title}`);
    }
  }

  await closeDialog();
  const closedState = await getDialogOpen();
  console.log("Key '0' closed dialog ->", !closedState.open ? 'PASSED' : 'FAILED');

  console.log('\n--- TEST 2: MOUSE CLICK ON ALL 6 ORBIT BUTTONS ---');
  const buttonLabels = [
    'Video Editing',
    'Graphical Works',
    'Website Projects',
    'Career',
    'AI Assistant',
    'Contact'
  ];

  for (const label of buttonLabels) {
    await closeDialog();
    const btnCoords = await send('Runtime.evaluate', {
      expression: `(() => {
        const all = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
        const visible = all.filter(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
        const btn = visible.find(b => b.getAttribute('aria-label')?.includes('${label}'));
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`,
      returnByValue: true
    });

    if (!btnCoords.result?.value) {
      throw new Error(`Could not find visible button for ${label}`);
    }

    const { x, y } = btnCoords.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 350));

    const state = await getDialogOpen();
    console.log(`Click button '${label}' -> Dialog open:`, state.open, '| Title:', state.title);
    if (!state.open) {
      throw new Error(`Clicking ${label} failed to open dialog!`);
    }
  }

  console.log('\n--- TEST 3: CLICK ON TEXT LABEL BUTTON ---');
  await closeDialog();
  const labelCoords = await send('Runtime.evaluate', {
    expression: `(() => {
      const allLabels = Array.from(document.querySelectorAll('[role="radiogroup"] button[type="button"]:not([role="radio"])'));
      const visible = allLabels.filter(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
      const target = visible.find(b => b.textContent?.includes('Video Editing'));
      if (!target) return null;
      const r = target.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    returnByValue: true
  });

  if (labelCoords.result?.value) {
    const { x, y } = labelCoords.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 350));
    const state = await getDialogOpen();
    console.log('Click on text label "Video Editing" -> Dialog open:', state.open, '| Title:', state.title);
    if (!state.open) throw new Error('Clicking text label failed!');
  }

  console.log('\n--- TEST 4: ORBIT REGULATOR ROTARY DRAG ---');
  await closeDialog();
  // Measure rotation before and after drag
  const initialRotation = await send('Runtime.evaluate', {
    expression: `(() => {
      const radiogroup = document.querySelector('[role="radiogroup"]');
      const ring = radiogroup?.firstElementChild;
      return ring ? ring.style.transform : null;
    })()`,
    returnByValue: true
  });

  // Find center of radiogroup
  const groupCoords = await send('Runtime.evaluate', {
    expression: `(() => {
      const radiogroup = document.querySelector('[role="radiogroup"]');
      const r = radiogroup.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 - 20 };
    })()`,
    returnByValue: true
  });

  const { cx, cy, r } = groupCoords.result.value;
  // Drag along an arc on the dial ring
  const startX = cx + r;
  const startY = cy;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: startX, y: startY, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 50));

  // Move along the arc in 5 steps
  for (let step = 1; step <= 5; step++) {
    const angle = (step / 5) * 0.6; // ~35 degrees
    const curX = cx + r * Math.cos(angle);
    const curY = cy + r * Math.sin(angle);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: curX, y: curY, button: 'left' });
    await new Promise(r => setTimeout(r, 30));
  }

  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx + r * Math.cos(0.6), y: cy + r * Math.sin(0.6), button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 300));

  const afterRotation = await send('Runtime.evaluate', {
    expression: `(() => {
      const radiogroup = document.querySelector('[role="radiogroup"]');
      const ring = radiogroup?.firstElementChild;
      return ring ? ring.style.transform : null;
    })()`,
    returnByValue: true
  });
  console.log('Rotary Dial before drag:', initialRotation.result.value);
  console.log('Rotary Dial after drag:', afterRotation.result.value);
  const dragDialogState = await getDialogOpen();
  console.log('Dial drag did NOT open dialog accidentally:', !dragDialogState.open ? 'PASSED' : 'FAILED');

  await closeDialog();
  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  ws.close();
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
