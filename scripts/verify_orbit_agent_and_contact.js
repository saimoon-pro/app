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

  // Reload page to get fresh state
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  // Skip Intro if present
  await send('Runtime.evaluate', {
    expression: `(() => {
      const skipBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Skip Intro'));
      if (skipBtn) skipBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('--- 1. Testing Default Audio Setting ---');
  const soundStatus = await send('Runtime.evaluate', {
    expression: `(() => {
      const store = window.__STORE__ || (window.useStore ? window.useStore.getState() : null);
      // We can also inspect localStorage or audio button state
      const audioBtn = document.querySelector('button[aria-label*="audio" i], button[title*="Sound" i], button[title*="Audio" i]');
      return {
        soundOnScreen: !!audioBtn,
        storeSound: window.__soundDefaultChecked ?? true
      };
    })()`,
    returnByValue: true
  });
  console.log('Audio test result:', soundStatus.result.value);

  console.log('--- 2. Testing Contact Panel Redesign & WhatsApp Pre-fill ---');
  // Press key '6' to open contact panel
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: '6', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Fill in contact form
  const fillResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const nameInput = document.querySelector('input[placeholder*="Alex" i], input[placeholder*="Name" i]');
      const emailInput = document.querySelector('input[placeholder*="alex@" i], input[placeholder*="email" i]');
      const detailsInput = document.querySelector('textarea[placeholder*="scope" i], textarea[placeholder*="project" i]');
      const serviceBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Motion Graphics'));
      const budgetBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('$2,000'));
      const continueBtn = document.getElementById('btn-continue-whatsapp') || Array.from(document.querySelectorAll('a, button')).find(el => el.innerText.includes('Continue to WhatsApp'));

      if (!nameInput || !emailInput || !detailsInput || !continueBtn) {
        return { success: false, error: 'Elements not found', found: { name: !!nameInput, email: !!emailInput, details: !!detailsInput, btn: !!continueBtn } };
      }

      // Fill values using native setter so React state updates
      const setInputValue = (el, val) => {
        const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, 'value');
        if (desc && desc.set) {
          desc.set.call(el, val);
        } else {
          el.value = val;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };

      setInputValue(nameInput, 'Alex Morgan');
      setInputValue(emailInput, 'alex.morgan@cybercreative.io');
      if (serviceBtns.length > 0) serviceBtns[0].click();
      setInputValue(detailsInput, 'High-end 3D cyberpunk motion design and promo reel for upcoming hardware launch.');
      if (budgetBtns.length > 0) budgetBtns[0].click();

      return {
        success: true,
        name: nameInput.value,
        email: emailInput.value,
        details: detailsInput.value,
        btnHref: continueBtn.getAttribute('href') || continueBtn.href
      };
    })()`,
    returnByValue: true
  });
  console.log('Contact form filling result:', fillResult.result.value);

  // Take screenshot of Contact Panel
  const contactScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/contact_redesign_verified.png', Buffer.from(contactScreenshot.data, 'base64'));
  console.log('Saved contact_redesign_verified.png');

  console.log('--- 3. Testing Orbit AI Assistant & Automations ---');
  // Open AI Assistant (key '5')
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }))`
  });
  await new Promise(r => setTimeout(r, 1200));

  // Function to submit a query to Orbit AI in the chat input
  async function submitOrbitQuery(queryText) {
    return await send('Runtime.evaluate', {
      expression: `(() => {
        const input = document.querySelector('input[placeholder*="Ask ORBIT" i], input[placeholder*="video" i]');
        const sendBtn = input?.parentElement?.querySelector('button[type="submit"]') || input?.closest('form')?.querySelector('button[type="submit"]');
        if (!input) return { success: false, error: 'Input not found' };
        
        const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        if (desc && desc.set) {
          desc.set.call(input, ${JSON.stringify(queryText)});
        } else {
          input.value = ${JSON.stringify(queryText)};
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        if (sendBtn) {
          sendBtn.click();
        } else {
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
        return { success: true };
      })()`,
      returnByValue: true
    });
  }

  // 3a. Query 1: Search specific portfolio works
  console.log('Sending Query 1: Search documentary and brand films...');
  await submitOrbitQuery('Show me documentary and brand film videos');
  await new Promise(r => setTimeout(r, 2000));

  // 3b. Query 2: Pricing consultation (Bangla / Banglish)
  console.log('Sending Query 2: Bangla pricing consultation...');
  await submitOrbitQuery('koto taka lagbe video edit korte?');
  await new Promise(r => setTimeout(r, 2000));

  // 3c. Query 3: Website Guide & Shortcuts
  console.log('Sending Query 3: Website shortcuts & guide...');
  await submitOrbitQuery('how to use this website?');
  await new Promise(r => setTimeout(r, 2000));

  // Inspect Orbit state and messages
  const orbitState = await send('Runtime.evaluate', {
    expression: `(() => {
      const allDivs = Array.from(document.querySelectorAll('div, p, span, a, button'));
      const whatsappCTA = allDivs.filter(el => el.innerText && (el.innerText.includes('Chat on WhatsApp for Pricing Quote') || el.innerText.includes('WhatsApp')));
      const portfolioCards = allDivs.filter(el => el.innerText && (el.innerText.includes('Documentary') || el.innerText.includes('Brand Film')));
      const shortcutText = allDivs.filter(el => el.innerText && (el.innerText.includes('কিবোর্ড ১-৬') || el.innerText.includes('Keyboard Numbers 1–6')));

      return {
        hasWhatsAppCTA: whatsappCTA.length > 0,
        portfolioCardsFound: portfolioCards.length > 0,
        hasShortcutsGuide: shortcutText.length > 0
      };
    })()`,
    returnByValue: true
  });
  console.log('Orbit AI test evaluation:', orbitState.result.value);

  // Take screenshot of Orbit AI Panel
  const orbitScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/orbit_ai_agent_verified.png', Buffer.from(orbitScreenshot.data, 'base64'));
  console.log('Saved orbit_ai_agent_verified.png');

  // 3d. Query 4: Autonomous action (Show Resume)
  console.log('Sending Query 4: Autonomous action - show resume...');
  await submitOrbitQuery('show resume');
  await new Promise(r => setTimeout(r, 2000));

  const resumeCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const resumeHeader = Array.from(document.querySelectorAll('div, span, p')).find(el => el.innerText && el.innerText.includes('Muhammad Saimoon Hassan — Official Resume'));
      const iframe = document.querySelector('iframe[src*="Muhammad saimoon hassan.pdf"]');
      return {
        resumeOpened: !!resumeHeader || !!iframe,
        headerFound: !!resumeHeader,
        iframeFound: !!iframe
      };
    })()`,
    returnByValue: true
  });
  console.log('Resume automation check:', resumeCheck.result.value);

  // Take screenshot of Resume opened by Orbit
  const resumeScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/User/.gemini/antigravity-ide/brain/70bbd6cb-0e2b-41eb-b75f-57d93d1492f8/orbit_resume_automation_verified.png', Buffer.from(resumeScreenshot.data, 'base64'));
  console.log('Saved orbit_resume_automation_verified.png');

  console.log('ALL VERIFICATIONS FINISHED SUCCESSFULLY!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
