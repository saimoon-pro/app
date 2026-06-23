/**
 * ORBIT AI Service — v12.0 Ultimate (Enterprise Brain)
 * Professional Digital Clone of Muhammad Saimoon Hassan
 * Multi-Model Orchestration:
 * - Gemini 2.0 Flash: Analysis, File/URL checking, Video/Image referencing
 * - OpenAI GPT-4o-mini: Core conversation, thinking, reasoning
 * - Groq (Llama-3.3-70b): Pricing, quick estimates, high-speed calculation
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

// Full Type matching v12.0 JSON
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

export interface OrbitResponse {
  text: string;
  suggestedSection?: string;
  videoSuggestions?: VideoSuggestion[]; // Keeping for backward compatibility
  portfolioSuggestions?: ContentItem[];
  ctaButton?: { label: string; url: string };
  action?: 'navigate' | 'contact' | 'show_videos' | 'show_portfolio';
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const SHEET_ID = '1lkc5llkD_zYwDbFTgn-YV9ITotvSu81zlC9sGiE5dwA';
const TOKENS_GID = '2104203463';
let tokenCache: AITokens | null = null;
let instructionsCache: OrbitEnterpriseBrain | null = null;

// ─── Fetch tokens ─────────────────────────────────────────────────────────────

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

// ─── System Prompt Builder ────────────────────────────────────────────────────

export function buildSystemPrompt(inst: OrbitEnterpriseBrain | null, content: ContentItem[]): string {
  const videos = content.filter(c => c.contentType === 'Video Editing').slice(0, 20)
    .map(v => `• "${v.title}" [${v.category}]${v.videoUrl ? ` URL:${v.videoUrl}` : ''}${v.description ? ` | ${v.description.slice(0, 70)}` : ''}`).join('\n');
  const websites = content.filter(c => c.contentType === 'Website Project').slice(0, 10)
    .map(w => `• "${w.title}"${w.websiteUrl ? ` ${w.websiteUrl}` : ''}${w.description ? ` | ${w.description.slice(0, 70)}` : ''}`).join('\n');
  const designs = content.filter(c => ['UIUX Design','Illustration','Graphic Design','Post Design'].includes(c.contentType)).slice(0, 10)
    .map(d => `• "${d.title}" [${d.contentType}]${d.description ? ` | ${d.description.slice(0, 70)}` : ''}`).join('\n');

  if (!inst) {
    return `You are ORBIT, the AI representative of Saimoon Hassan and Helixonix. You are highly intelligent, analytical, and an expert consultant. Respond in the exact language the user writes in.`;
  }

  return `You are ${inst.AGENT_NAME} (${inst.VERSION}), the ${inst.IDENTITY.TYPE} of ${inst.OWNER.COMPANY}.
Role: ${inst.IDENTITY.ROLE}
Personality: ${inst.IDENTITY.PERSONALITY.join(', ')}

--- MISSION ---
- ${inst.IDENTITY.MISSION.PRIMARY}
- ${inst.IDENTITY.MISSION.SECONDARY}
- ${inst.IDENTITY.MISSION.TERTIARY}

--- LANGUAGE INTELLIGENCE & COMMUNICATION (CRITICAL) ---
- Detect user language automatically.
- Unicode Bangla (ক-ৰ) OR Romanized Bangla (kemon, acho, ki korcho, vai, bujho) -> Respond entirely in natural Bangla.
- Hindi (Unicode or Romanized kya/kaise/bolo) -> Respond in Hindi.
- Arabic -> Respond in Arabic.
- English -> Respond in English.
- NEVER mix languages.
- Styles: ${inst.COMMUNICATION_ENGINE.STYLE.join(', ')}
- Rules: ${inst.COMMUNICATION_ENGINE.RULES.join(' | ')}

--- ABOUT THE OWNER (${inst.OWNER.NAME}) ---
Title: ${inst.OWNER.TITLE}
Experience: ${inst.OWNER.EXPERIENCE}
Roles: ${inst.OWNER.ROLES.join(', ')}

Expertise:
- Video: ${inst.OWNER_EXPERTISE.VIDEO.join(', ')}
- Design: ${inst.OWNER_EXPERTISE.DESIGN.join(', ')}
- Web: ${inst.OWNER_EXPERTISE.WEB.join(', ')}
- AI: ${inst.OWNER_EXPERTISE.AI.join(', ')}
- Marketing: ${inst.OWNER_EXPERTISE.MARKETING.join(', ')}

--- PORTFOLIO DATABASE ---
(You can reference these exact titles when discussing work. For any portfolio work, use the SHOW_PORTFOLIO tag below.)
Videos:
${videos || '(no videos)'}
Websites:
${websites || '(no websites)'}
Design:
${designs || '(no designs)'}

--- CONSULTATION & SALES ENGINE ---
Discovery Objective: ${inst.CLIENT_DISCOVERY_ENGINE.OBJECTIVE}
Ask these organically to qualify leads: ${inst.CLIENT_DISCOVERY_ENGINE.QUESTIONS.join(' | ')}

Sales Framework: ${inst.SALES_ENGINE.FRAMEWORK.join(' -> ')}
Sales Principles: ${inst.SALES_ENGINE.PRINCIPLES.join(' | ')}

--- PRICING ENGINE ---
When discussing pricing, consider: ${inst.PRICING_ENGINE.ANALYZE.join(', ')}
Available Packages: ${inst.PRICING_ENGINE.OUTPUT.join(', ')}
Rules: ${inst.PRICING_ENGINE.RULES.join(' | ')}
• CRITICAL: NEVER output specific monetary amounts (e.g. 5000 taka) unless the user explicitly gave a budget. You MUST ask the user about their exact requirements to estimate effort instead of hallucinating packages with random numbers.

--- CONVERSATION MEMORY ---
You have access to the conversation history. Always remember the user's previous answers, project context, and business needs. Use this memory to provide contextual answers without repeating yourself.

--- OBJECTION HANDLING ---
Budget Concerns: ${inst.OBJECTION_HANDLING.BUDGET.join(' | ')}
Trust Issues: ${inst.OBJECTION_HANDLING.TRUST.join(' | ')}
Timeline Pressure: ${inst.OBJECTION_HANDLING.TIMELINE.join(' | ')}

--- MULTIMODAL CAPABILITIES ---
You have the ability to analyze: ${inst.MULTIMODAL_INTELLIGENCE.INPUTS.join(', ')}. If the user provides a link or asks you to check a file, act accordingly.

--- FAILSAFE RULES (STRICT COMPLIANCE) ---
${inst.FAILSAFE_RULES.map(r => `• ${r}`).join('\n')}

--- STRUCTURED OUTPUT TAGS ---
When showing ANY portfolio work (videos, web, design) — append AFTER your response text:
[SHOW_PORTFOLIO]{"items":["title1","title2","title3"]}[/SHOW_PORTFOLIO]

When navigating user to a section — append AFTER your response text:
[NAVIGATE]section_name[/NAVIGATE]
(valid: career, video, design, web, contact)

When giving a direct action button like WhatsApp — append AFTER your response text:
[CTA_BUTTON]{"label":"Chat on WhatsApp","url":"https://wa.me/8801778011899"}[/CTA_BUTTON]

Rules for tags:
• Use [SHOW_PORTFOLIO] whenever user asks to see work (ANY work: video, design, web)
• Use [CTA_BUTTON] whenever the user asks for contact, hire, or WhatsApp.
• Use [NAVIGATE] when guiding user to a specific portfolio section
• Tags go at the END
• Keep response conversational but authoritative
• NEVER use multiple identical tags in the same message
• CRITICAL: DO NOT TRANSLATE THE TAGS. The tags MUST remain exactly [SHOW_PORTFOLIO], [CTA_BUTTON] etc., even if you are speaking in Bangla or Hindi. NEVER translate them.
• Welcome Message to use if greeting: "${inst.WEBSITE_BEHAVIOR.WELCOME_MESSAGE}"`;
}

// ─── Model Routing Logic ──────────────────────────────────────────────────────

type Intent = 'analysis' | 'pricing' | 'conversation';

function detectIntent(text: string): Intent {
  const lower = text.toLowerCase();
  
  // URL detection (MUST go to Gemini for search/retrieval)
  const hasUrl = /(http[s]?:\/\/[^\s]+)|(youtube\.com|youtu\.be|drive\.google\.com)/.test(lower);
  if (hasUrl) return 'analysis';

  // Pricing keywords (Must go to Groq for calculation)
  const wantsPricing = /\b(price|cost|budget|quote|taka|dam|খরচ|দাম|বাজেট|rate|estimate|package|kat|koto|charge|how much)\b/.test(lower);
  if (wantsPricing) return 'pricing';

  // Explicit analysis/reference keywords without URLs
  const wantsAnalysis = /\b(watch|see|analyze|check|file|image|picture|photo|pdf|link|chobi|dekho|dekhe|check koro)\b/.test(lower);
  if (wantsAnalysis) return 'analysis';

  return 'conversation'; // -> OpenAI
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
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
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

  // Resilient matching for legacy video suggestions
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
        const found = allVids.find(v => v.title.toLowerCase().includes(tl.slice(0,12)) || tl.includes(v.title.toLowerCase().slice(0,12)));
        if (found && !suggestions.find(s => s.id === found.id)) {
          suggestions.push({ id: found.id, title: found.title, category: found.category, thumbnail: found.thumbnailUrl, videoUrl: found.videoUrl, description: found.description });
        }
      }
      if (suggestions.length === 0 && allVids.length > 0) {
        allVids.slice(0, 3).forEach(v => suggestions.push({ id: v.id, title: v.title, category: v.category, thumbnail: v.thumbnailUrl, videoUrl: v.videoUrl, description: v.description }));
      }
      if (suggestions.length > 0) { result.videoSuggestions = suggestions.slice(0, 4); result.action = 'show_videos'; }
    } catch { /* ignore */ }
  }

  // Resilient matching for general SHOW_PORTFOLIO (videos, design, web)
  const portMatch = text.match(/\[SHOW_PORTFOLIO\]\s*(\{[\s\S]*?\})/i);
  if (portMatch) {
    const fullTagToRemove = text.match(/\[SHOW_PORTFOLIO\][\s\S]*?(?:\[\/[a-zA-Z_]+\]|$)/i);
    if (fullTagToRemove) text = text.replace(fullTagToRemove[0], '').trim();
    
    try {
      const { items: requested = [] } = JSON.parse(portMatch[1].trim());
      const suggestions: ContentItem[] = [];
      for (const title of requested as string[]) {
        const tl = title.toLowerCase();
        const found = content.find(v => v.title.toLowerCase().includes(tl.slice(0,12)) || tl.includes(v.title.toLowerCase().slice(0,12)));
        if (found && !suggestions.find(s => s.id === found.id)) suggestions.push(found);
      }
      if (suggestions.length === 0 && content.length > 0) {
        content.slice(0, 3).forEach(v => suggestions.push(v));
      }
      if (suggestions.length > 0) { result.portfolioSuggestions = suggestions.slice(0, 4); result.action = 'show_portfolio'; }
    } catch { /* ignore */ }
  }

  // Resilient matching for CTA_BUTTON
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

  const navMatch = text.match(/\[NAVIGATE\]\s*([a-zA-Z_]+)\s*(?:\[\/[a-zA-Z_]+\]|$)/i);
  if (navMatch) {
    const fullTagToRemove = text.match(/\[NAVIGATE\][\s\S]*?(?:\[\/[a-zA-Z_]+\]|$)/i);
    if (fullTagToRemove) text = text.replace(fullTagToRemove[0], '').trim();
    
    const section = navMatch[1].trim().toLowerCase();
    if (['career','video','design','web','contact'].includes(section)) {
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
  let intent = detectIntent(userMsg);

  // 1. Try Local NLP Brain FIRST for common queries (saves API quota)
  const localResponse = localOrbitBrain(userMsg, content, inst, false);
  if (localResponse) {
    console.log(`[ORBIT v12.0 / ${provider}] Handled locally`);
    return parseOrbitResponse(localResponse, content);
  }

  // 2. Complex Query -> Route to APIs
  if (intent === 'analysis' && tokens.gemini) {
    try { raw = await callGemini(tokens.gemini, sys, history, userMsg); provider = 'gemini-2.0-flash (Analysis)'; }
    catch (e) { /* silent fallback */ }
  }

  if (!raw && intent === 'pricing' && tokens.groq) {
    try { raw = await callGroq(tokens.groq, sys, history, userMsg); provider = 'groq/llama-3.3-70b (Pricing)'; }
    catch (e) { /* silent fallback */ }
  }

  if (!raw && tokens.openai) {
    try { raw = await callOpenAI(tokens.openai, sys, history, userMsg); provider = 'openai/gpt-4o-mini (Conversation)'; }
    catch (e) { /* silent fallback */ }
  }

  // 3. Ultimate Cascade
  if (!raw && tokens.gemini) {
    try { raw = await callGemini(tokens.gemini, sys, history, userMsg); provider = 'gemini-2.0-flash (Fallback)'; }
    catch (e) {}
  }
  if (!raw && tokens.groq) {
    try { raw = await callGroq(tokens.groq, sys, history, userMsg); provider = 'groq/llama-3.3-70b (Fallback)'; }
    catch (e) {}
  }

  // 4. Absolute Fallback
  if (!raw) { 
    raw = localOrbitBrain(userMsg, content, inst, true) || `I am currently experiencing network limitations, but I am still here to help! What are you working on?`; 
    provider = 'local-fallback'; 
  }

  console.log(`[ORBIT v12.0 / ${provider}]`, raw.slice(0, 100));
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
    'bolo','bolun','bol','shono','dakho','dekhao','bujho','bujhe','bujhte','bujhi',
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

// ─── Local NLP Brain (Offline/Low-API Engine) ─────────────────────────────────

function localOrbitBrain(input: string, _content: ContentItem[], inst: OrbitEnterpriseBrain | null, isFallback: boolean): string | null {
  const lower = input.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).length;
  const lang = detectLanguage(input);

  const name = inst?.OWNER.NAME ?? 'Saimoon';
  const co = inst?.OWNER.COMPANY ?? 'Helixonix';
  const wa = '+8801778011899';

  // Hard cases MUST go to API (unless we are in absolute fallback mode)
  const hasUrl = /(http[s]?:\/\/[^\s]+)|(youtube\.com|youtu\.be|drive\.google\.com)/.test(lower);
  const wantsAnalysis = /\b(analyze|check|file|image|picture|photo|pdf|link|chobi|check koro)\b/.test(lower);
  const isComplex = wordCount > 20;

  if (!isFallback && (hasUrl || wantsAnalysis || isComplex)) {
    return null; // Route to API
  }

  // NLP Keyword Matching
  const hasVideo = /\b(video|ভিডিও|reel|film|edit|animation|motion|youtube)\b/.test(lower);
  const hasWeb = /\b(web|website|ওয়েব|সাইট|app|software|develop|react)\b/.test(lower);
  const hasDesign = /\b(design|logo|brand|ডিজাইন|লোগো|ব্র্যান্ড|ui|ux|graphic)\b/.test(lower);
  const hasPrice = /\b(price|cost|budget|quote|taka|dam|খরচ|দাম|বাজেট|rate|estimate|package|kat|koto|charge|how much|taka lagbe)\b/.test(lower);
  const hasContact = /\b(contact|hire|project|kaj|korbo|lagbe|দরকার|number|phone|whatsapp)\b/.test(lower);
  const isGreeting = /\b(hi|hello|hey|salam|kemon|ache|acho|aso|namaskar|nomoskar|হ্যালো|হাই|সালাম)\b/.test(lower) && wordCount < 8;

  // Psychology-driven localized responses
  if (lang === 'bangla') {
    if (isGreeting) {
      return `হ্যালো! আমি ভালো আছি। আমি Orbit, ${co}-এর AI কনসালটেন্ট। ${name} এর ক্রিয়েটিভ সার্ভিস (ভিডিও, ওয়েব, ডিজাইন, AI) নিয়ে আপনাকে কীভাবে সাহায্য করতে পারি? আপনার প্রোজেক্ট বা বিজনেস আইডিয়া নিয়ে বলুন।`;
    }
    if (hasPrice) {
      if (hasVideo) return `ভিডিও প্রোজেক্টের প্রাইসিং আসলে ভিডিওর দৈর্ঘ্য, মোশন গ্রাফিক্সের পরিমাণ, এবং আপনার ডেডলাইনের ওপর নির্ভর করে। আপনার কি নির্দিষ্ট কোনো রেফারেন্স আছে? বিস্তারিত জানালে আমি একটা একুরেট এস্টিমেট দিতে পারবো। [NAVIGATE]contact[/NAVIGATE]`;
      if (hasWeb) return `ওয়েবসাইটের প্রাইসিং নির্ভর করে কয়টি পেজ হবে, ডিজাইন কতটা প্রিমিয়াম হবে এবং কি কি ফিচার থাকবে তার উপর। আপনি কি ই-কমার্স নাকি পোর্টফোলিও টাইপ কিছু চাচ্ছেন?`;
      return `প্রাইসিং পুরোপুরি নির্ভর করে প্রোজেক্টের রিকোয়ারমেন্ট এবং স্কোপের উপর। আপনার প্রোজেক্ট সম্পর্কে একটু বিস্তারিত বললে আমি আপনাকে বেস্ট প্যাকেজ সাজেস্ট করতে পারবো। [NAVIGATE]contact[/NAVIGATE]`;
    }
    if (hasVideo) {
      return `${name} এখন পর্যন্ত ৩৪০+ কমার্শিয়াল ভিডিও তৈরি করেছেন—যার মধ্যে আছে ব্র্যান্ড ফিল্ম, রিলস, আর মোশন গ্রাফিক্স। আপনার বিজনেসের জন্য কি টাইপের ভিডিও খুঁজছেন? কিছু কাজ দেখতে চান? [SHOW_PORTFOLIO]{"items":[]}[/SHOW_PORTFOLIO]`;
    }
    if (hasWeb) {
      return `${co} ২৫+ হাই-পারফরম্যান্স ওয়েবসাইট ডেভেলপ করেছে। আপনার বিজনেসের জন্য কেমন সাইট চাচ্ছেন? [SHOW_PORTFOLIO]{"items":[]}[/SHOW_PORTFOLIO] [NAVIGATE]web[/NAVIGATE]`;
    }
    if (hasDesign) {
      return `ব্র্যান্ড আইডেন্টিটি এবং UI/UX ডিজাইনে ${name} এর দারুণ অভিজ্ঞতা আছে। আপনার কি লোগো বা ফুল ব্র্যান্ড গাইডলাইন লাগবে? [SHOW_PORTFOLIO]{"items":[]}[/SHOW_PORTFOLIO] [NAVIGATE]design[/NAVIGATE]`;
    }
    if (hasContact) {
      return `আপনার প্রোজেক্ট শুরু করার সবচেয়ে দ্রুত উপায় হলো সরাসরি WhatsApp করা (${wa})। [CTA_BUTTON]{"label":"WhatsApp এ কথা বলুন","url":"https://wa.me/8801778011899"}[/CTA_BUTTON]`;
    }

    if (!isFallback) return null; // Route unknown general chat to API
    return `আমি Orbit, ${co}-এর AI সহকারী। ${name} ভিডিও প্রোডাকশন, ব্র্যান্ডিং, ওয়েবসাইট এবং AI অটোমেশনে এক্সপার্ট। আপনার বিজনেসের গ্রোথ বা নতুন কোনো প্রোজেক্ট নিয়ে আলোচনা করতে চাইলে আমাকে জানাতে পারেন।`;
  }

  // English fallback
  if (isGreeting) {
    return `Hello! I'm Orbit, the AI consultant for ${co}. I'm here to help you with video production, web development, brand design, and AI strategy. What kind of project are you working on today?`;
  }
  if (hasPrice) {
    if (hasVideo) return `Video pricing depends on the duration, motion graphics complexity, and timeline. Do you have a reference video or specific requirements in mind? I can give you an accurate estimate once I know more. [NAVIGATE]contact[/NAVIGATE]`;
    return `Pricing always depends on the exact scope, complexity, and timeline of your project. Instead of giving you a random number, I'd love to understand your requirements first. What exactly are you looking to build? [NAVIGATE]contact[/NAVIGATE]`;
  }
  if (hasVideo) {
    return `${name} has produced 340+ commercial videos, including brand films and motion graphics. What type of video do you need for your business? [SHOW_PORTFOLIO]{"items":[]}[/SHOW_PORTFOLIO]`;
  }
  if (hasWeb) {
    return `${co} has delivered 25+ premium websites. Are you looking for an e-commerce platform, a corporate site, or a web app? [SHOW_PORTFOLIO]{"items":[]}[/SHOW_PORTFOLIO]`;
  }
  if (hasDesign) {
    return `${name}'s expertise covers full UI/UX systems and brand identities. What does your brand need right now? [SHOW_PORTFOLIO]{"items":[]}[/SHOW_PORTFOLIO]`;
  }
  if (hasContact) {
    return `The fastest way to get your project moving is reaching out directly on WhatsApp (${wa}). [CTA_BUTTON]{"label":"Chat on WhatsApp","url":"https://wa.me/8801778011899"}[/CTA_BUTTON]`;
  }

  if (!isFallback) return null; // Route unknown general chat to API
  return `I'm Orbit, ${co}'s AI consultant. Whether you need video production, brand design, web development, or AI automation — ${name} can help. Tell me more about your project goals.`;
}
