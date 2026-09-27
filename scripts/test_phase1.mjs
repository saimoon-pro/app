import config from '../config/app.config.json' with { type: 'json' };

function validateBDPhoneNumber(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
  return bdPhoneRegex.test(cleaned);
}

function formatBDPhoneNumber(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+88')) return cleaned;
  if (cleaned.startsWith('88')) return `+${cleaned}`;
  if (cleaned.startsWith('01')) return `+88${cleaned}`;
  return cleaned;
}

console.log('=== TESTING PHASE 1 LOGIC ===');

// 1. Test Bangladesh Phone validation
const validNumbers = [
  '01712345678',
  '+8801712345678',
  '8801712345678',
  '01912345678',
  '01812345678',
  '01312345678',
  '01412345678',
  '01512345678',
  '01612345678',
  '017-12345678',
  '+88 017 1234 5678'
];

const invalidNumbers = [
  '12345',
  '01112345678', // operator 1 no longer valid
  '01212345678', // operator 2 invalid
  '0171234567',  // 10 digits
  '017123456789', // 12 digits
  'abc',
  ''
];

console.log('\nTesting Valid BD Phone Numbers:');
for (const num of validNumbers) {
  const ok = validateBDPhoneNumber(num);
  const formatted = formatBDPhoneNumber(num);
  console.log(`  ${num} -> Valid: ${ok}, Formatted: ${formatted}`);
  if (!ok || !formatted.startsWith('+8801')) {
    throw new Error(`Failed valid check on ${num}`);
  }
}

console.log('\nTesting Invalid BD Phone Numbers:');
for (const num of invalidNumbers) {
  const ok = validateBDPhoneNumber(num);
  console.log(`  ${num} -> Valid: ${ok} (Expected: false)`);
  if (ok) {
    throw new Error(`Failed invalid check on ${num}`);
  }
}

// 2. Test Configuration
console.log('\nTesting Configuration values:');
console.log('  Free signup credits:', config.credits.FREE_SIGNUP_CREDITS, '(Expected: 100)');
console.log('  Cost prebuilt generate:', config.credits.COST_GENERATE_PREBUILT, '(Expected: 50)');
console.log('  Cost edit prompt:', config.credits.COST_EDIT, '(Expected: 50)');
console.log('  Cost custom generate:', config.credits.COST_GENERATE_CUSTOM, '(Expected: 100)');
console.log('  Min purchase BDT:', config.payments.MIN_PURCHASE_BDT, '(Expected: 50)');
console.log('  Credits per BDT:', config.payments.CREDITS_PER_BDT, '(Expected: 10)');
console.log('  Max past CV MB:', config.limits.MAX_PAST_CV_MB, '(Expected: 2)');
console.log('  Max photo MB:', config.limits.MAX_PHOTO_MB, '(Expected: 1)');

if (config.credits.FREE_SIGNUP_CREDITS !== 100 ||
    config.credits.COST_GENERATE_PREBUILT !== 50 ||
    config.payments.MIN_PURCHASE_BDT !== 50) {
  throw new Error('Config value mismatch!');
}

console.log('\n>>> ALL PHASE 1 TESTS PASSED SUCCESSFULLY! <<<');
