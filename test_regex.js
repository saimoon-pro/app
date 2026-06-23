const text = `[VIDEO_SUGGESTIONS]{"videos":["Saas Explainer Video | Creative Sync","Saas Explainer Video | Creative Sync 2","B2B Corporate Video Ad Example for SaaS Companies | LangEase"]}
[/VIDEO_SUGUESTIONS]`;

const videoMatch = text.match(/\[VIDEO_SUGGESTIONS\]\s*(\{[\s\S]*?\})/i);
console.log("Match:", videoMatch ? "YES" : "NO");
if (videoMatch) {
  try {
    const parsed = JSON.parse(videoMatch[1]);
    console.log("Parsed:", parsed);
  } catch (e) {
    console.log("Parse Error:", e.message);
  }
}
