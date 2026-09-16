/**
 * ORBIT AI Service — v14.0 Enterprise Autonomous Agent
 * Professional Digital Clone & Website Operator for Muhammad Saimoon Hassan
 * Multi-Model Orchestration:
 * - Gemini 2.0 Flash: High-level Analysis, File/URL checking, Video/Image referencing
 * - OpenAI GPT-4o-mini: Core conversation, thinking, reasoning
 * - Groq (Llama-3.3-70b): High-speed calculation, pricing, strategy
 * - Local Autonomous Engine: Instant fallback with zero-latency portfolio retrieval & website automation
 */

import Papa from 'papaparse';
import type { ContentItem } from '@/types/content';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AITokens {
  gemini?: string;
  openai?: string;
  groq?: string;
  [key: string]: string | undefined;
}

export interface OrbitEnterpriseBrain {
  VERSION: string;
  AGENT_NAME: string;
  OWNER: { NAME: string; COMPANY: string; TITLE: string; ROLES: string[]; EXPERIENCE: string };
  IDENTITY: { TYPE: string; ROLE: string; MISSION: { PRIMARY: string; SECONDARY: string; TERTIARY: string }; PERSONALITY: string[] };
  COMMUNICATION_ENGINE: { LANGUAGES: string; STYLE: string[]; RULES: string[] };
  OWNER_EXPERTISE: { VIDEO: string[]; DESIGN: string[]; WEB: string[]; AI: string[]; MARKETING: string[] };
  CLIENT_DISCOVERY_ENGINE: { OBJECTIVE: string; QUESTIONS: string[] };
  SALES_ENGINE: { FRAMEWORK: string[]; PRINCIPLES: string[] };
  CLIENT_PSYCHOLOGY: { OBJECTIVES: string[] };
  LEAD_SCORING_ENGINE: { FACTORS: string[] };
  PRICING_ENGINE: { MODE: string; ANALYZE: string[]; OUTPUT: string[]; RULES: string[] };
  CUSTOM_PACKAGE_BUILDER: { ENABLED: boolean; CAPABILITIES: string[] };
  PROJECT_ANALYSIS_ENGINE: { CAPABILITIES: string[]; WORKFLOW: string[] };
  PORTFOLIO_RETRIEVAL_SYSTEM: { PURPOSE: string; WORKFLOW: string[] };
  OBJECTION_HANDLING: { BUDGET: string[]; TRUST: string[]; TIMELINE: string[] };
  CRM_MEMORY_SYSTEM: { STORE: string[] };
  CONSULTATION_MODE: { ENABLED: boolean; RULES: string[] };
  ADVANCED_REASONING: { ENABLED: boolean; TASKS: string[] };
  MULTIMODAL_INTELLIGENCE: { INPUTS: string[]; OUTPUTS: string[] };
  WEBSITE_BEHAVIOR: { WELCOME_MESSAGE: string; PRIORITIES: string[] };
  FAILSAFE_RULES: string[];
  SUCCESS_METRICS: Record<string, string>;
}

export interface OrbitInstructionsRoot {
  ORBIT_ENTERPRISE_BRAIN: OrbitEnterpriseBrain;
}

export interface VideoSuggestion {
  id: string; title: string; category: string;
  thumbnail: string; videoUrl: string; description: string;
}

export interface OrbitActionDetails {
  action: 'navigate' | 'resume' | 'regulator' | 'sound' | 'home' | 'whatsapp';
  param?: string;
  label?: string;
}

export interface OrbitResponse {
  text: string;
  suggestedSection?: string;
  videoSuggestions?: VideoSuggestion[];
  portfolioSuggestions?: ContentItem[];
  ctaButton?: { label: string; url: string };
  action?: 'navigate' | 'contact' | 'show_videos' | 'show_portfolio' | 'open_resume' | 'change_regulator';
  actionDetails?: OrbitActionDetails;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const SHEET_ID = '1lkc5llkD_zYwDbFTgn-YV9ITotvSu81zlC9sGiE5dwA';
const TOKENS_GID = '2104203463';
const WHATSAPP_NUMBER = '8801778011899';

let tokenCache: AITokens | null = null;
let instructionsCache: OrbitEnterpriseBrain | null = null;

// ─── Fetch Tokens ─────────────────────────────────────────────────────────────

export async function fetchTokens(): Promise<AITokens> {
  if (tokenCache) return tokenCache;
  const urls = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${TOKENS_GID}`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=tokens`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Tokens`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const parsed = Papa.parse(await res.text(), { header: true, skipEmptyLines: true });
      if (!parsed.data?.length) continue;
      const tokens: AITokens = {};
      (parsed.data as Record<string, string>[]).forEach(row => {
        const svc = (row['Service'] || row['Name'] || row['AI'] || row['Provider'] || row['Inteligence'] || row['Intelligence'] || '').toLowerCase().trim();
        const key = (row['Key'] || row['Token'] || row['API_KEY'] || row['api_key'] || row['Api key'] || row['API Key'] || '').trim();
        if (!svc || !key || key.length < 8) return;
        if (svc.includes('gemini') || svc.includes('google')) tokens.gemini = key;
        else if (svc.includes('openai') || svc.includes('chatgpt') || svc.includes('gpt')) tokens.openai = key;
        else if (svc.includes('groq')) tokens.groq = key;
        else tokens[svc] = key;
      });
      if (Object.keys(tokens).length > 0) { tokenCache = tokens; return tokens; }
    } catch { /* try next */ }
  }
  tokenCache = {};
  return {};
}

export async function fetchOrbitInstructions(): Promise<OrbitEnterpriseBrain | null> {
  if (instructionsCache) return instructionsCache;
  try {
    const res = await fetch('/orbit-instructions.json');
    if (!res.ok) return null;
    const data = await res.json() as OrbitInstructionsRoot;
    if (data.ORBIT_ENTERPRISE_BRAIN) {
      instructionsCache = data.ORBIT_ENTERPRISE_BRAIN;
      return instructionsCache;
    }
    return null;
  } catch { return null; }
}

// ─── Intelligent Portfolio Search Helper ──────────────────────────────────────

export function searchPortfolioItems(query: string, content: ContentItem[]): ContentItem[] {
  const q = query.toLowerCase().trim();
  if (!content || content.length === 0) return [];

  // Scored matching based on query terms & synonyms
  const scored = content.map((item) => {
    let score = 0;
    const title = item.title.toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const type = (item.contentType || '').toLowerCase();
    const tags = (item.tags || []).map((t) => t.toLowerCase()).join(' ');

    // Specific video categories
    if (/(documentary|ডকুমেন্টারি|maker|hand)/i.test(q) && (cat.includes('documentary') || tags.includes('documentary') || title.includes('documentary'))) score += 12;
    if (/(podcast|interview|টকশো|talking)/i.test(q) && (title.includes('podcast') || desc.includes('podcast') || tags.includes('podcast'))) score += 12;
    if (/(motion|vfx|typography|kinetic|কাইনেটিক|মোশন)/i.test(q) && (cat.includes('motion') || type.includes('motion') || tags.includes('motion') || title.includes('motion'))) score += 12;
    if (/(promo|brand film|commercial|ad|বিজ্ঞাপন|ব্র্যান্ড|luminex)/i.test(q) && (cat.includes('promotional') || tags.includes('promotional') || title.includes('brand film') || title.includes('luminex'))) score += 12;
    if (/(tvc|ovc|short film|টিভি|echoes)/i.test(q) && (cat.includes('tvc') || tags.includes('tvc') || title.includes('short film') || title.includes('echoes'))) score += 12;
    if (/(ai|automation|reels|social|এআই)/i.test(q) && (cat.includes('ai') || tags.includes('ai') || tags.includes('reels') || title.includes('ai'))) score += 12;

    // Design categories
    if (/(ui|ux|app|mobile|dashboard|analytics|saas|অ্যাপ|ইউআই)/i.test(q) && (type.includes('uiux') || tags.includes('saas') || tags.includes('dashboard') || tags.includes('mobile') || title.includes('flowstate') || title.includes('analytics'))) score += 12;
    if (/(logo|brand identity|branding|লোগো|ব্র্যান্ডিং)/i.test(q) && (type.includes('graphic') || title.includes('brand') || tags.includes('brand') || tags.includes('logo'))) score += 12;
    if (/(illustration|art|digital|portrait|ড্রয়িং)/i.test(q) && (type.includes('illustration') || title.includes('digital fragments'))) score += 12;

    // Web categories
    if (/(web|website|ecommerce|ইকমার্স|সাইট|react|next|app|fullstack)/i.test(q) && (type.includes('website') || Boolean(item.websiteUrl))) score += 12;

    // Word token hits
    const words = q.split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      if (title.includes(w)) score += 5;
      if (cat.includes(w)) score += 4;
      if (tags.includes(w)) score += 4;
      if (desc.includes(w)) score += 2;
    }

    return { item, score };
  });

  const matches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
  if (matches.length > 0) return matches.slice(0, 4).map(m => m.item);

  // Broad type fallbacks
  if (/(video|ভিডিও|edit|film|reel)/i.test(q)) {
    return content.filter(c => c.contentType === 'Video Editing').slice(0, 4);
  }
  if (/(design|ui|ux|graphic|লোগো|ডিজাইন)/i.test(q)) {
    return content.filter(c => ['UIUX Design', 'Illustration', 'Graphic Design'].includes(c.contentType)).slice(0, 4);
  }
  if (/(web|website|ওয়েবসাইট)/i.test(q)) {
    return content.filter(c => c.contentType === 'Website Project').slice(0, 4);
  }

  return content.slice(0, 4);
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

export function buildSystemPrompt(inst: OrbitEnterpriseBrain | null, content: ContentItem[]): string {
  const videos = content.filter(c => c.contentType === 'Video Editing').slice(0, 20)
    .map(v => `• "${v.title}" [${v.category}]${v.videoUrl ? ` URL:${v.videoUrl}` : ''}${v.description ? ` | ${v.description.slice(0, 70)}` : ''}`).join('\n');
  const websites = content.filter(c => c.contentType === 'Website Project').slice(0, 10)
    .map(w => `• "${w.title}"${w.websiteUrl ? ` ${w.websiteUrl}` : ''}${w.description ? ` | ${w.description.slice(0, 70)}` : ''}`).join('\n');
  const designs = content.filter(c => ['UIUX Design','Illustration','Graphic Design','Post Design'].includes(c.contentType)).slice(0, 10)
    .map(d => `• "${d.title}" [${d.contentType}]${d.description ? ` | ${d.description.slice(0, 70)}` : ''}`).join('\n');

  const ownerName = inst?.OWNER.NAME || 'Muhammad Saimoon Hassan';
  const ownerCo = inst?.OWNER.COMPANY || 'Helixonix';

  return `You are ORBIT Agent v14.0, the autonomous AI web agent and strategic representative of ${ownerName} and ${ownerCo}.
You are not just a chatbot — you are an active AGENT with the power to control and navigate this website for the user.

--- IDENTITY & OWNER ---
Owner: ${ownerName} (${inst?.OWNER.TITLE || 'Creative Director, Lead Video Editor, UI/UX Designer & Web Developer'})
Company: ${ownerCo}
Experience: ${inst?.OWNER.EXPERIENCE || '5+ Years of Industry Experience across USA, UK, Canada, Germany, BD'}
Key Stats: 340+ Commercial Videos, 25+ High-Performance Web Apps, Enterprise AI Automation Systems.

--- COMPLETE WEBSITE KNOWLEDGE (YOU KNOW EVERYTHING ABOUT THIS SITE) ---
1. Keyboard Navigation Shortcuts:
   • Number Keys 1-6: 1=Video Editing, 2=Graphical Works, 3=Website Projects, 4=My Career, 5=ORBIT AI Assistant, 6=Contact.
   • '0' Key or 'Escape': Instantly closes any active dialog/modal and returns to the main window hero view.
   • Left/Right Arrow Keys: Smoothly switches between the 6 background 3D video atmosphere regulators (Regulator 1 to 6).
2. Rotary Orbit Dial:
   • On mobile/touchscreens, users can rotate the central orbit dial like a physical regulator wheel with their finger.
   • On desktop, users can click and drag the dial to rotate.
   • Clicks or taps on the 6 orbit buttons directly open the respective universe section.
3. Sound System:
   • Ambient audio and mechanical detent ticks are enabled by default. Can be toggled with the speaker icon at the bottom-left corner.
4. Resume / CV:
   • Accessible from the hero "View Resume / CV" button or by asking you.
5. Direct Contact:
   • WhatsApp: +${WHATSAPP_NUMBER}
   • Email: muhammadsaimoonhassan@gmail.com
   • Simplified Contact form: Auto-embeds Name, Email, Project Details, and Budget directly into WhatsApp.

--- CRITICAL PRICING CONSULTATION RULES ---
When the user asks about price, cost, rates, budget, or quotes in ANY language (e.g. "koto taka lagbe", "pricing kemon", "what is your rate", "how much for video edit"):
1. Explain that pricing is custom-tailored based on project scope, complexity, timeline, and deliverables.
2. Instruct the user to contact Saimoon directly to discuss their specific project for an exact personalized quote.
3. ALWAYS attach a direct WhatsApp button using the [CTA_BUTTON] tag with pre-filled text!

--- MULTILINGUAL INTELLIGENCE ---
• Detect language automatically.
• If user writes in Unicode Bangla (ক-হ) or Romanized Banglish (kemon acho, vai, kaj korbo, koto taka lagbe) -> Respond fluently in natural Bengali.
• If user writes in Hindi (kya, kaise, bolo) -> Respond in Hindi.
• If user writes in English -> Respond in English.
• Maintain a professional, visionary, helpful, and confident tone.

--- PORTFOLIO DATABASE ---
Videos:
${videos || '(no videos)'}
Websites:
${websites || '(no websites)'}
Designs:
${designs || '(no designs)'}

--- STRUCTURED ACTION PROTOCOL (AUTOMATION TAGS) ---
Append these tags at the END of your response to execute automations on the website:

1. To display matching portfolio items:
   [SHOW_PORTFOLIO]{"items":["Exact Title 1","Exact Title 2"]}[/SHOW_PORTFOLIO]

2. To navigate the user to a specific section:
   [NAVIGATE]section_name[/NAVIGATE]
   (valid: career, video, design, web, contact)

3. For WhatsApp or external action button:
   [CTA_BUTTON]{"label":"Chat on WhatsApp for Pricing Quote","url":"https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Saimoon!%20I%20would%20like%20to%20get%20a%20price%20quote%20for%20my%20project."}[/CTA_BUTTON]

4. To trigger website automations:
   [EXECUTE_ACTION]{"action":"resume|regulator|sound|home","param":"1-6"}[/EXECUTE_ACTION]

CRITICAL: DO NOT TRANSLATE THE TAG NAMES (keep [SHOW_PORTFOLIO], [CTA_BUTTON], [NAVIGATE], [EXECUTE_ACTION] in English even when speaking in Bangla).`;
}

// ─── Intent Detection ─────────────────────────────────────────────────────────

type Intent = 'analysis' | 'pricing' | 'conversation';

function detectIntent(text: string): Intent {
  const lower = text.toLowerCase();
  
  // URL detection
  const hasUrl = /(http[s]?:\/\/[^\s]+)|(youtube\.com|youtu\.be|drive\.google\.com)/.test(lower);
  if (hasUrl) return 'analysis';

  // Pricing keywords
  const wantsPricing = /\b(price|cost|budget|quote|taka|dam|খরচ|দাম|বাজেট|rate|estimate|package|kat|koto|charge|how much|taka lagbe)\b/.test(lower);
  if (wantsPricing) return 'pricing';

  // Explicit analysis keywords
  const wantsAnalysis = /\b(analyze|check|file|image|picture|photo|pdf|link|chobi|check koro)\b/.test(lower);
  if (wantsAnalysis) return 'analysis';

  return 'conversation';
}

// ─── Provider Adapters ────────────────────────────────────────────────────────

type Msg = { role: string; text: string };

async function callGemini(key: string, sys: string, hist: Msg[], msg: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const contents = [
    ...hist.slice(-16).map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: msg }] },
  ];
  if (sessionStorage.getItem('orbit_429_gemini')) throw new Error('Quota exceeded');
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sys }] },
      contents,
      generationConfig: { temperature: 0.85, maxOutputTokens: 2048, topP: 0.95 },
      tools: [{ googleSearch: {} }],
    }),
  });
  if (res.status === 429) sessionStorage.setItem('orbit_429_gemini', 'true');
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini empty response');
  return text;
}

async function callGroq(key: string, sys: string, hist: Msg[], msg: string): Promise<string> {
  const messages = [
    { role: 'system', content: sys },
    ...hist.slice(-16).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
    { role: 'user', content: msg },
  ];
  if (sessionStorage.getItem('orbit_429_groq')) throw new Error('Quota exceeded');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.7, max_tokens: 1024 }),
  });
  if (res.status === 429) sessionStorage.setItem('orbit_429_groq', 'true');
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq empty response');
  return text;
}

async function callOpenAI(key: string, sys: string, hist: Msg[], msg: string): Promise<string> {
  const messages = [
    { role: 'system', content: sys },
    ...hist.slice(-16).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
    { role: 'user', content: msg },
  ];
  if (sessionStorage.getItem('orbit_429_openai')) throw new Error('Quota exceeded');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.85, max_tokens: 1500 }),
  });
  if (res.status === 429) sessionStorage.setItem('orbit_429_openai', 'true');
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI empty response');
  return text;
}

// ─── Response Parser ──────────────────────────────────────────────────────────

export function parseOrbitResponse(raw: string, content: ContentItem[]): OrbitResponse {
  let text = raw;
  const result: OrbitResponse = { text: '' };

  // 1. [EXECUTE_ACTION] Tag
  const actionMatch = text.match(/\[EXECUTE_ACTION\]\s*(\{[\s\S]*?\})/i);
  if (actionMatch) {
    const fullTag = text.match(/\[EXECUTE_ACTION\][\s\S]*?(?:\[\/[a-zA-Z_]+\]|$)/i);
    if (fullTag) text = text.replace(fullTag[0], '').trim();
    try {
      const parsed = JSON.parse(actionMatch[1].trim());
      result.actionDetails = parsed;
      if (parsed.action === 'resume') result.action = 'open_resume';
      else if (parsed.action === 'regulator') result.action = 'change_regulator';
      else if (parsed.action === 'navigate') {
        result.action = 'navigate';
        result.suggestedSection = parsed.param;
      }
    } catch { /* ignore */ }
  }

  // 2. [SHOW_PORTFOLIO] Tag
  const portMatch = text.match(/\[SHOW_PORTFOLIO\]\s*(\{[\s\S]*?\})/i);
  if (portMatch) {
    const fullTagToRemove = text.match(/\[SHOW_PORTFOLIO\][\s\S]*?(?:\[\/[a-zA-Z_]+\]|$)/i);
    if (fullTagToRemove) text = text.replace(fullTagToRemove[0], '').trim();
    
    try {
      const { items: requested = [] } = JSON.parse(portMatch[1].trim());
      const suggestions: ContentItem[] = [];
      for (const title of requested as string[]) {
        const tl = title.toLowerCase();
        const found = content.find(v => v.title.toLowerCase().includes(tl.slice(0, 12)) || tl.includes(v.title.toLowerCase().slice(0, 12)));
        if (found && !suggestions.find(s => s.id === found.id)) suggestions.push(found);
      }
      if (suggestions.length === 0 && content.length > 0) {
        content.slice(0, 4).forEach(v => suggestions.push(v));
      }
      if (suggestions.length > 0) {
        result.portfolioSuggestions = suggestions.slice(0, 4);
        result.action = 'show_portfolio';
      }
    } catch { /* ignore */ }
  }

  // 3. Legacy [VIDEO_SUGGESTIONS] Tag
  const videoMatch = text.match(/\[VIDEO_SUGGESTIONS\]\s*(\{[\s\S]*?\})/i);
  if (videoMatch) {
    const fullTagToRemove = text.match(/\[VIDEO_SUGGESTIONS\][\s\S]*?(?:\[\/[a-zA-Z_]+\]|$)/i);
    if (fullTagToRemove) text = text.replace(fullTagToRemove[0], '').trim();
    
    try {
      const { videos: requested = [] } = JSON.parse(videoMatch[1].trim());
      const allVids = content.filter(c => c.contentType === 'Video Editing');
      const suggestions: VideoSuggestion[] = [];
      for (const title of requested as string[]) {
        const tl = title.toLowerCase();
        const found = allVids.find(v => v.title.toLowerCase().includes(tl.slice(0, 12)) || tl.includes(v.title.toLowerCase().slice(0, 12)));
        if (found && !suggestions.find(s => s.id === found.id)) {
          suggestions.push({ id: found.id, title: found.title, category: found.category, thumbnail: found.thumbnailUrl, videoUrl: found.videoUrl, description: found.description });
        }
      }
      if (suggestions.length === 0 && allVids.length > 0) {
        allVids.slice(0, 4).forEach(v => suggestions.push({ id: v.id, title: v.title, category: v.category, thumbnail: v.thumbnailUrl, videoUrl: v.videoUrl, description: v.description }));
      }
      if (suggestions.length > 0) {
        result.videoSuggestions = suggestions.slice(0, 4);
        result.action = 'show_videos';
      }
    } catch { /* ignore */ }
  }

  // 4. [CTA_BUTTON] Tag
  const ctaMatch = text.match(/\[CTA_BUTTON\]\s*(\{[\s\S]*?\})/i);
  if (ctaMatch) {
    const fullTagToRemove = text.match(/\[CTA_BUTTON\][\s\S]*?(?:\[\/[a-zA-Z_]+\]|$)/i);
    if (fullTagToRemove) text = text.replace(fullTagToRemove[0], '').trim();
    try {
      const parsed = JSON.parse(ctaMatch[1].trim());
      if (parsed.label && parsed.url) {
        result.ctaButton = { label: parsed.label, url: parsed.url };
      }
    } catch { /* ignore */ }
  }

  // 5. [NAVIGATE] Tag
  const navMatch = text.match(/\[NAVIGATE\]\s*([a-zA-Z_]+)\s*(?:\[\/[a-zA-Z_]+\]|$)/i);
  if (navMatch) {
    const fullTagToRemove = text.match(/\[NAVIGATE\][\s\S]*?(?:\[\/[a-zA-Z_]+\]|$)/i);
    if (fullTagToRemove) text = text.replace(fullTagToRemove[0], '').trim();
    
    const section = navMatch[1].trim().toLowerCase();
    if (['career', 'video', 'design', 'web', 'contact'].includes(section)) {
      result.suggestedSection = section;
      if (!result.action) result.action = 'navigate';
    }
  }

  result.text = text.trim();
  return result;
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

export async function sendToOrbit(userMsg: string, history: Msg[], content: ContentItem[]): Promise<OrbitResponse> {
  const [tokens, inst] = await Promise.all([fetchTokens(), fetchOrbitInstructions()]);
  const sys = buildSystemPrompt(inst, content);

  let raw = '';
  let provider = 'local-nlp';
  const intent = detectIntent(userMsg);

  // 1. Try Local Autonomous NLP Engine first for targeted matches & instant automations
  const localResponse = localOrbitBrain(userMsg, content, inst, false);
  if (localResponse) {
    console.log(`[ORBIT v14.0 / ${provider}] Handled autonomously`);
    return parseOrbitResponse(localResponse, content);
  }

  // 2. Complex Query -> Multi-Model Cloud API
  if (intent === 'analysis' && tokens.gemini) {
    try { raw = await callGemini(tokens.gemini, sys, history, userMsg); provider = 'gemini-2.0-flash (Analysis)'; }
    catch { /* silent fallback */ }
  }

  if (!raw && intent === 'pricing' && tokens.groq) {
    try { raw = await callGroq(tokens.groq, sys, history, userMsg); provider = 'groq/llama-3.3-70b (Pricing)'; }
    catch { /* silent fallback */ }
  }

  if (!raw && tokens.openai) {
    try { raw = await callOpenAI(tokens.openai, sys, history, userMsg); provider = 'openai/gpt-4o-mini (Conversation)'; }
    catch { /* silent fallback */ }
  }

  // 3. Fallback Cascade
  if (!raw && tokens.gemini) {
    try { raw = await callGemini(tokens.gemini, sys, history, userMsg); provider = 'gemini-2.0-flash (Fallback)'; }
    catch {}
  }
  if (!raw && tokens.groq) {
    try { raw = await callGroq(tokens.groq, sys, history, userMsg); provider = 'groq/llama-3.3-70b (Fallback)'; }
    catch {}
  }

  // 4. Absolute Fallback to Autonomous Local Brain
  if (!raw) {
    raw = localOrbitBrain(userMsg, content, inst, true) ||
      `I am ORBIT, your digital assistant for Muhammad Saimoon Hassan's portfolio. How can I assist you today? [NAVIGATE]contact[/NAVIGATE]`;
    provider = 'local-fallback';
  }

  console.log(`[ORBIT v14.0 / ${provider}]`, raw.slice(0, 100));
  return parseOrbitResponse(raw, content);
}

// ─── Language Detection ───────────────────────────────────────────────────────

type Lang = 'bangla' | 'hindi' | 'arabic' | 'english';

function detectLanguage(input: string): Lang {
  if (/[\u0980-\u09FF]/.test(input)) return 'bangla';
  if (/[\u0900-\u097F]/.test(input)) return 'hindi';
  if (/[\u0600-\u06FF]/.test(input)) return 'arabic';

  const lower = input.toLowerCase().trim();
  const romanBanglaWords = [
    'kemon','ache','acho','achis','apni','tumi','ami','amra','tader','amader',
    'bolo','bolun','bol','shono','dakho','dekhao','dekhan','bujho','bujhe','bujhte','bujhi',
    'ki','ke','koi','keno','kivabe','koto','kothay','kothai','kobe',
    'thik','theek','thak','hobe','hocche','holo','hosse','hoiche',
    'lagbe','dorkar','chai','jani','janina','janbo','jante','jabe',
    'vai','bhai','apa','apu','dada','didi','mama','chacha',
    'boro','choto','shundor','valo','bhalo','kharap','sundor',
    'dao','nao','jao','aso','esho','jaben','asben',
    'ektu','aro','shob','onno','kono','theke','diye','niye',
    'bangla','bujho','lekh','likho','likhun','porun','poro',
    'dhekhao','dikhao','show','dekhi','dekhbo',
    'project','kaj','kaje','kori','korbo','korte','korecho','korechi',
    'price','dam','taka','koto taka','budget','kharch',
    'video','design','website','logo','brand',
    'help','halp','sahajjo','sahayta',
    'salam','assalamu','namaskar','nomoskar',
    'dhonnobad','shukriya','thanks','tnx','shuvo',
  ];
  if (romanBanglaWords.some(w => lower.includes(w))) return 'bangla';

  const romanHindiWords = ['kya','kaise','theek hai','nahi','haan','aap','hum','mujhe','tumhara','bolo'];
  if (romanHindiWords.some(w => lower.includes(w))) return 'hindi';

  return 'english';
}

// ─── Local Autonomous NLP Brain ──────────────────────────────────────────────

function localOrbitBrain(input: string, content: ContentItem[], inst: OrbitEnterpriseBrain | null, isFallback: boolean): string | null {
  const lower = input.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).length;
  const lang = detectLanguage(input);

  const name = inst?.OWNER.NAME || 'Muhammad Saimoon Hassan';
  const co = inst?.OWNER.COMPANY || 'Helixonix';

  // ── 1. Website Usage & Navigation Knowledge ──
  const isWebsiteHelp = /\b(how to use|how to navigate|website use|kivabe use|kivabe chalabo|shortcuts|control|controls|keyboard|shortcut|নিয়ম|কিভাবে চালাব|কিভাবে ব্যবহার)\b/i.test(lower);
  if (isWebsiteHelp) {
    if (lang === 'bangla') {
      return `এই ওয়েবসাইটটি ব্রাউজ করার জন্য রয়েছে সম্পূর্ণ ইন্টারঅ্যাক্টিভ কন্ট্রোল সিস্টেম:\n\n` +
        `• কীবোর্ড ১-৬: ১ প্রেস করলে ভিডিও এডিটিং, ২ প্রেস করলে গ্রাফিক্স, ৩ এ ওয়েবসাইট, ৪ এ ক্যারিয়ার, ৫ এ এআই অ্যাসিস্ট্যান্ট (আমি), এবং ৬ এ কন্টাক্ট সেকশনে যাবেন।\n` +
        `• কীবোর্ড ০ বা Escape: যেকোনো ওপেন প্যানেল বা মোডাল বন্ধ করে আবার মেইন হোম স্ক্রিনে ফিরে আসবেন।\n` +
        `• কীবোর্ড Left/Right Arrow: ৬টি ভিন্ন 3D ভিডিও ব্যাকগ্রাউন্ড অ্যাটমোস্ফিয়ার (রেগুলেটর ১-৬) পরিবর্তন করতে পারবেন।\n` +
        `• সেন্ট্রাল অরবিট রেগুলেটর: মোবাইলে আঙুল দিয়ে বা ডেসকটপে ক্লিক অ্যান্ড ড্র্যাগ করে ফিজিক্যাল রেগুলেটরের মতো ডায়াল ঘোরাতে পারবেন। প্রতিটি অপশনে ট্যাপ করলে সেকশনটি ওপেন হবে।\n` +
        `• সাউন্ড: সাইটের অ্যাম্বিয়েন্ট ও মেকানিক্যাল সাউন্ড বাই-ডিফল্ট অন রয়েছে; নিচের বাম কোণায় স্পিকার আইকনে ক্লিক করে যেকোনো সময় মিউট করতে পারেন।`;
    }
    return `Here is how to navigate and use this digital universe portfolio:\n\n` +
      `• Keyboard Numbers 1–6: 1 = Video Editing, 2 = Graphical Works, 3 = Website Projects, 4 = Career, 5 = ORBIT AI Assistant, 6 = Contact.\n` +
      `• Key '0' or Escape: Immediately closes any open section/panel and returns to the main window hero view.\n` +
      `• Left & Right Arrow Keys: Smoothly switches between the 6 background 3D atmosphere regulators (Regulators 1 to 6).\n` +
      `• Rotary Orbit Dial: On mobile/touchscreen, rotate the orbit dial with your finger just like a mechanical dial; on desktop, click and drag. Clicking any node opens that universe.\n` +
      `• Sound System: Ambient sound effects and mechanical ticks are enabled by default (toggle via the bottom-left speaker icon).\n` +
      `• Resume: View Saimoon's verified CV anytime by asking me or clicking the hero "View Resume / CV" button.`;
  }

  // ── 2. Pricing & Cost Queries (Explicit WhatsApp Button Requirement) ──
  const hasPrice = /\b(price|pricing|cost|budget|quote|taka|dam|খরচ|দাম|বাজেট|rate|rates|estimate|package|kat|koto|charge|how much|taka lagbe|koto taka)\b/i.test(lower);
  if (hasPrice) {
    const waQuoteMsg = encodeURIComponent(`Hello Saimoon! I would like to get an accurate price quote for my project.`);
    const ctaTag = `[CTA_BUTTON]{"label":"Chat on WhatsApp for Pricing Quote","url":"https://wa.me/${WHATSAPP_NUMBER}?text=${waQuoteMsg}"}[/CTA_BUTTON]`;

    if (lang === 'bangla') {
      return `সাইমুন হাসানের প্রতিটি প্রোজেক্ট কাস্টম-মেড এবং প্রিমিয়াম কোয়ালিটির। প্রাইসিং মূলত নির্ভর করে প্রোজেক্টের রিকোয়ারমেন্ট, ডিটেইলস, কাজের পরিমাণ এবং ডেলিভারি ডেডলাইনের উপর।\n\n` +
        `আপনার নির্দিষ্ট প্রোজেক্টের সেরা বাজেট ও এক্স্যাক্ট প্রাইস কোটেশন জানার জন্য সরাসরি সাইমুনের সাথে WhatsApp-এ কথা বলুন। নিচের বাটনে ক্লিক করলেই সরাসরি WhatsApp চ্যাট ওপেন হবে।\n\n` +
        `${ctaTag}`;
    }
    return `Every project with ${name} and ${co} is custom-crafted to the highest standard. Pricing is tailored strictly based on your project scope, complexity, deliverables, and timeline.\n\n` +
      `To receive an accurate and transparent price quote for your exact needs, please connect directly with Saimoon on WhatsApp. Click the button below to start a direct consultation:\n\n` +
      `${ctaTag}`;
  }

  // ── 3. Resume / CV Request ──
  const wantsResume = /\b(resume|cv|biodata|bio|qualification|সার্টিফিকেট|সিভি|রেজুমে)\b/i.test(lower);
  if (wantsResume) {
    if (lang === 'bangla') {
      return `সাইমুন হাসানের ফুল প্রফেশনাল রেজুমে ও সিভি ওপেন করা হয়েছে। আপনি তাঁর ৫+ বছরের এক্সপেরিয়েন্স, টেকনিক্যাল স্কিলস ও ক্লায়েন্ট ট্র্যাক রেকর্ড দেখতে পারেন। [EXECUTE_ACTION]{"action":"resume","label":"View Resume / CV"}[/EXECUTE_ACTION]`;
    }
    return `Opening Muhammad Saimoon Hassan's complete professional Resume / CV. You can review his 5+ years of verified industry experience, client portfolio, and technical skill sets. [EXECUTE_ACTION]{"action":"resume","label":"View Resume / CV"}[/EXECUTE_ACTION]`;
  }

  // ── 4. Atmosphere Regulator Change Request ──
  const wantsRegulator = /\b(regulator|atmosphere|background|change video|world|ওয়ার্ল্ড|ব্যাকগ্রাউন্ড|রেগুলেটর)\b/i.test(lower);
  if (wantsRegulator) {
    const numMatch = lower.match(/\b([1-6])\b/);
    const targetReg = numMatch ? numMatch[1] : '2';
    if (lang === 'bangla') {
      return `ব্যাকগ্রাউন্ড অ্যাটমোস্ফিয়ার পরিবর্তন করে রেগুলেটর ${targetReg}-এ নিয়ে যাচ্ছি। [EXECUTE_ACTION]{"action":"regulator","param":"${targetReg}","label":"Switch to Atmosphere ${targetReg}"}[/EXECUTE_ACTION]`;
    }
    return `Switching background atmosphere to Regulator ${targetReg}. [EXECUTE_ACTION]{"action":"regulator","param":"${targetReg}","label":"Switch to Atmosphere ${targetReg}"}[/EXECUTE_ACTION]`;
  }

  // ── 5. Specific Portfolio Discovery (Videos, Graphics, Websites) ──
  const hasVideo = /\b(video|ভিডিও|reel|film|edit|animation|motion|youtube|podcast|documentary|tvc|ovc|commercial)\b/i.test(lower);
  const hasDesign = /\b(design|logo|brand|ডিজাইন|লোগো|ব্র্যান্ড|ui|ux|graphic|illustration|poster|dashboard)\b/i.test(lower);
  const hasWeb = /\b(web|website|ওয়েব|সাইট|app|software|develop|react|next|ecommerce|fullstack)\b/i.test(lower);
  const hasCareer = /\b(career|experience|about|achievements|bio|কেমন|কে|পরিচয়|ক্যারিয়ার|অভিজ্ঞতা)\b/i.test(lower);
  const hasContact = /\b(contact|hire|talk|call|phone|whatsapp|কন্টাক্ট|যোগাযোগ|হোয়াটসঅ্যাপ)\b/i.test(lower);

  // Specific content search
  if (hasVideo || hasDesign || hasWeb) {
    const matchingItems = searchPortfolioItems(input, content);
    const itemTitles = JSON.stringify({ items: matchingItems.map(m => m.title) });

    if (hasVideo) {
      if (lang === 'bangla') {
        return `সাইমুন হাসানের ৩৪০+ কমার্শিয়াল ভিডিও কাজের মধ্যে থেকে আপনার রিকোয়ারমেন্ট অনুযায়ী সেরা কাজগুলো নিচে সাজেস্ট করা হলো। ক্লিক করে প্রিভিউ দেখতে পারেন: [SHOW_PORTFOLIO]${itemTitles}[/SHOW_PORTFOLIO] [NAVIGATE]video[/NAVIGATE]`;
      }
      return `Here are specific video works crafted by Muhammad Saimoon Hassan matching your inquiry. Click any card to preview the full work or open details: [SHOW_PORTFOLIO]${itemTitles}[/SHOW_PORTFOLIO] [NAVIGATE]video[/NAVIGATE]`;
    }

    if (hasWeb) {
      if (lang === 'bangla') {
        return `${co} দ্বারা ডেভেলপ করা হাই-পারফরম্যান্স ওয়েবসাইট ও ওয়েব অ্যাপ্লিকেশনগুলো নিচে প্রদর্শিত হলো: [SHOW_PORTFOLIO]${itemTitles}[/SHOW_PORTFOLIO] [NAVIGATE]web[/NAVIGATE]`;
      }
      return `Here are high-performance web applications and design systems delivered by ${co}: [SHOW_PORTFOLIO]${itemTitles}[/SHOW_PORTFOLIO] [NAVIGATE]web[/NAVIGATE]`;
    }

    if (hasDesign) {
      if (lang === 'bangla') {
        return `UI/UX ডিজাইন, ব্র্যান্ড আইডেন্টিটি এবং গ্রাফিক্সের নির্বাচিত কাজগুলো নিচে সাজেস্ট করা হলো: [SHOW_PORTFOLIO]${itemTitles}[/SHOW_PORTFOLIO] [NAVIGATE]design[/NAVIGATE]`;
      }
      return `Here are selected UI/UX design systems, brand identities, and visual artworks: [SHOW_PORTFOLIO]${itemTitles}[/SHOW_PORTFOLIO] [NAVIGATE]design[/NAVIGATE]`;
    }
  }

  // ── 6. Career / About ──
  if (hasCareer) {
    if (lang === 'bangla') {
      return `মুহাম্মদ সাইমুন হাসান হলেন ${co}-এর ফাউন্ডার, লিড ভিডিও এডিটর, UI/UX ডিজাইনার এবং ফুল-স্ট্যাক ওয়েব ডেভেলপার। তাঁর ৫+ বছরের এক্সপেরিয়েন্স রয়েছে এবং তিনি আন্তর্জাতিক ক্লায়েন্টদের জন্য ৩৪০+ কমার্শিয়াল ভিডিও তৈরি করেছেন। বিস্তারিত জানতে ক্যারিয়ার সেকশন দেখুন: [NAVIGATE]career[/NAVIGATE]`;
    }
    return `Muhammad Saimoon Hassan is the Founder of ${co}, Lead Video Editor, UI/UX Designer, and Web Developer with 5+ years of verified industry experience across 340+ commercial videos. Explore his full career background: [NAVIGATE]career[/NAVIGATE]`;
  }

  // ── 7. Contact / Direct Hire ──
  if (hasContact) {
    const waHireMsg = encodeURIComponent(`Hello Saimoon! I visited your portfolio website and would like to discuss a project.`);
    const ctaTag = `[CTA_BUTTON]{"label":"Direct WhatsApp Chat","url":"https://wa.me/${WHATSAPP_NUMBER}?text=${waHireMsg}"}[/CTA_BUTTON]`;

    if (lang === 'bangla') {
      return `প্রোজেক্ট নিয়ে আলোচনা করার জন্য সরাসরি WhatsApp-এ যোগাযোগ করুন অথবা আমাদের কন্টাক্ট সেকশনে আপনার নাম, ইমেইল, কাজের বিবরণ ও বাজেট লিখে কন্টিনিউ করুন: [NAVIGATE]contact[/NAVIGATE] ${ctaTag}`;
    }
    return `To discuss your project goals directly, reach out on WhatsApp or fill out the streamlined contact section: [NAVIGATE]contact[/NAVIGATE] ${ctaTag}`;
  }

  // ── 8. Greetings ──
  const isGreeting = /\b(hi|hello|hey|salam|kemon|ache|acho|aso|namaskar|nomoskar|হ্যালো|হাই|সালাম)\b/i.test(lower) && wordCount < 8;
  if (isGreeting) {
    if (lang === 'bangla') {
      return `হ্যালো! আমি ORBIT, ${co}-এর অটোনোমাস এআই এজেন্ট। সাইমুন হাসানের ভিডিও এডিটিং, গ্রাফিক্স ডিজাইন, ওয়েবসাইট প্রজেক্ট, প্রাইসিং অথবা এই ওয়েবসাইট ব্যবহারের যেকোনো বিষয়ে আমি সাহায্য করতে পারি। আপনি কি দেখতে চান বলুন!`;
    }
    return `Hello! I am ORBIT, the autonomous AI web agent for ${co}. I can help you explore Muhammad Saimoon Hassan's video editing portfolio, UI/UX designs, web apps, custom pricing quotes, or guide you on how to use this website. What would you like to see?`;
  }

  if (!isFallback) return null; // Route unknown general chat to Cloud API

  // Absolute fallback
  if (lang === 'bangla') {
    return `আমি ORBIT, এই ওয়েবসাইটের এআই এজেন্ট। আপনি কোনো নির্দিষ্ট ভিডিও, ডিজাইন বা ওয়েবসাইট কাজ দেখতে চাইলে আমাকে জানান, আমি সাথে সাথে তা খুঁজে দেব। আর প্রাইসিং জানতে চাইলে নিচের বাটনে ক্লিক করে সাইমুনের সাথে সরাসরি WhatsApp-এ কথা বলুন। [CTA_BUTTON]{"label":"WhatsApp এ যোগাযোগ করুন","url":"https://wa.me/${WHATSAPP_NUMBER}"}[/CTA_BUTTON]`;
  }
  return `I am ORBIT, your autonomous AI web agent. Whether you want to view specific video editing projects, design systems, web development work, or get a custom price quote — tell me what you need! [CTA_BUTTON]{"label":"Connect on WhatsApp","url":"https://wa.me/${WHATSAPP_NUMBER}"}[/CTA_BUTTON]`;
}
