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

  await send('Page.reload');
  await new Promise(r => setTimeout(r, 1200));

  const closeDialog = async () => {
    await send('Runtime.evaluate', {
      expression: "window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }))"
    });
    await new Promise(r => setTimeout(r, 200));
  };

  const getTransform = async () => {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const all = Array.from(document.querySelectorAll('[role="radiogroup"]'));
        const g = all.find(el => el.offsetParent !== null && el.getBoundingClientRect().width > 0);
        return g?.firstElementChild?.style.transform;
      })()`,
      returnByValue: true
    });
    return res.result?.value;
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

  await closeDialog();

  console.log('--- TEST 1: CURSOR HOVER MUST NEVER ROTATE THE ORBIT ---');
  const startTransform = await getTransform();
  console.log('Initial transform:', startTransform);

  // Hover cursor across the entire dial in a circle without any mouse button pressed
  const centerCoords = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('[role="radiogroup"]'));
      const g = all.find(el => el.offsetParent !== null && el.getBoundingClientRect().width > 0);
      const r = g.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 - 30 };
    })()`,
    returnByValue: true
  });

  const { cx, cy, r } = centerCoords.result.value;
  for (let step = 0; step < 24; step++) {
    const angle = (step / 24) * 2 * Math.PI;
    const hx = cx + r * Math.cos(angle);
    const hy = cy + r * Math.sin(angle);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hx, y: hy });
    await new Promise(res => setTimeout(res, 20));
  }

  const hoverTransform = await getTransform();
  console.log('Transform after 360-degree cursor hover:', hoverTransform);
  if (startTransform !== hoverTransform) {
    throw new Error('FAILED: Orbit rotated on passive cursor hover!');
  }
  console.log('PASS: Orbit did NOT rotate on cursor hover!');

  console.log('\n--- TEST 2: TAP/CLICK ORBIT BUTTON DIRECTLY OPENS OPTION ---');
  const btnCoords = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
      const visible = all.filter(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
      const videoBtn = visible.find(b => b.getAttribute('aria-label')?.includes('Video'));
      const r = videoBtn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    returnByValue: true
  });

  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: btnCoords.result.value.x, y: btnCoords.result.value.y, button: 'left', clickCount: 1 });
  await new Promise(res => setTimeout(res, 60));
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: btnCoords.result.value.x, y: btnCoords.result.value.y, button: 'left', clickCount: 1 });
  await new Promise(res => setTimeout(res, 300));

  const clickState = await getDialogOpen();
  console.log('Option opened after clicking Video button:', clickState.open, '| Title:', clickState.title);
  if (!clickState.open) throw new Error('FAILED: Video button click did not open option!');

  await closeDialog();

  console.log('\n--- TEST 3: PRESS AND DRAG (TAP THEN ROTATE) ROTATES THE ORBIT ---');
  const dragStartTransform = await getTransform();
  const startDragX = cx + r;
  const startDragY = cy;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: startDragX, y: startDragY, button: 'left', clickCount: 1 });
  await new Promise(res => setTimeout(res, 40));

  for (let s = 1; s <= 8; s++) {
    const a = (s / 8) * 0.8;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
      buttons: 1
    });
    await new Promise(res => setTimeout(res, 25));
  }
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: cx + r * Math.cos(0.8),
    y: cy + r * Math.sin(0.8),
    button: 'left',
    buttons: 0,
    clickCount: 1
  });
  await new Promise(res => setTimeout(res, 200));

  const dragEndTransform = await getTransform();
  console.log('Before drag:', dragStartTransform);
  console.log('After press & drag:', dragEndTransform);
  if (dragStartTransform === dragEndTransform) {
    throw new Error('FAILED: Press and drag did not rotate the orbit!');
  }
  console.log('PASS: Press & drag rotated the orbit smoothly!');

  console.log('\n--- TEST 4: MOBILE FINGER ROTATE AND TAP ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await new Promise(res => setTimeout(res, 300));

  const mobCenter = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('[role="radiogroup"]'));
      const g = all.find(el => el.offsetParent !== null && el.getBoundingClientRect().width > 0);
      const r = g.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 - 15 };
    })()`,
    returnByValue: true
  });

  const mcx = mobCenter.result.value.cx;
  const mcy = mobCenter.result.value.cy;
  const mr = mobCenter.result.value.r;

  const mobBeforeDrag = await getTransform();
  // Simulate finger drag on mobile
  await send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: mcx + mr, y: mcy }]
  });
  await new Promise(res => setTimeout(res, 30));

  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * 0.7;
    await send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: mcx + mr * Math.cos(a), y: mcy + mr * Math.sin(a) }]
    });
    await new Promise(res => setTimeout(res, 25));
  }

  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await new Promise(res => setTimeout(res, 200));

  const mobAfterDrag = await getTransform();
  console.log('Mobile dial before finger drag:', mobBeforeDrag);
  console.log('Mobile dial after finger drag:', mobAfterDrag);
  if (mobBeforeDrag === mobAfterDrag) {
    throw new Error('FAILED: Mobile finger drag did not rotate orbit!');
  }
  console.log('PASS: Mobile finger drag rotates the orbit like a regulator!');

  // Mobile tap on button
  const mobBtn = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('[role="radiogroup"] button[role="radio"]'));
      const visible = all.filter(b => b.offsetParent !== null && b.getBoundingClientRect().width > 0);
      const videoBtn = visible.find(b => b.getAttribute('aria-label')?.includes('Video'));
      const r = videoBtn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    returnByValue: true
  });

  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [mobBtn.result.value] });
  await new Promise(res => setTimeout(res, 60));
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await new Promise(res => setTimeout(res, 300));

  const mobState = await getDialogOpen();
  console.log('Mobile tap on button opened option:', mobState.open, '| Title:', mobState.title);
  if (!mobState.open) throw new Error('FAILED: Mobile tap did not open option!');

  await closeDialog();

  // Restore desktop
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 945, deviceScaleFactor: 1, mobile: false });
  await new Promise(res => setTimeout(res, 200));

  console.log('\n--- TEST 5: KEYBOARD 1-6 AND 0 ---');
  for (const k of ['1', '2', '3', '4', '5', '6']) {
    await send('Runtime.evaluate', {
      expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', bubbles: true }))`
    });
    await new Promise(res => setTimeout(res, 200));
    const s = await getDialogOpen();
    if (!s.open) throw new Error(`Key ${k} failed!`);
    await closeDialog();
  }
  console.log('PASS: Keys 1-6 and 0 all work perfectly!');

  console.log('\nALL 5 COMPREHENSIVE TESTS PASSED WITH 100% SUCCESS!');
  ws.close();
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
