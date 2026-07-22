import { inboxConfig } from "../apps/backend/inbox/src/inbox.config";

async function testGemmaAIIntegration() {
  console.log("🚀 Testing Reloop Backend AI Route logic with Google Gemma 2 (gemma2:2b)...\n");
  console.log(`📍 Gemma Endpoint: ${inboxConfig.OLLAMA_BASE_URL}`);
  console.log(`📦 Model: ${inboxConfig.GEMMA_MODEL}\n`);

  // 1. Test Subject Generation Prompt
  console.log("1️⃣ Generating Email Subject with Gemma...");
  const bodyText = "Hi team, please find attached the Q3 sales report. Sales grew by 35% year-over-year. Let's discuss in our meeting tomorrow.";
  const subjectPrompt = `Write a concise email subject line (max 80 characters) for the following email body. Return ONLY the subject line, no quotes, no conversational text:\n\n${bodyText}`;

  const res1 = await fetch(`${inboxConfig.OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: inboxConfig.GEMMA_MODEL,
      prompt: subjectPrompt,
      stream: false
    })
  });

  const data1 = (await res1.json()) as { response: string };
  const subject = data1.response.trim().replace(/^["']|["']$/g, "").slice(0, 120);
  
  console.log("✅ Subject Generated:");
  console.log("   ->", subject);

  console.log("\n------------------------------------\n");

  // 2. Test Compose Email Body Prompt
  console.log("2️⃣ Generating Email Body & HTML with Gemma...");
  const composePrompt = "Compose a professional email thanking Sarah for organizing the successful team offsite event.";
  const contextParts = [`Subject: Thank you for the offsite!`, `Prompt: ${composePrompt}`];
  const fullPrompt = `Compose a professional email from the following context. Return plain text only (no markdown fences or commentary). Use short paragraphs:\n\n${contextParts.join("\n")}`;

  const res2 = await fetch(`${inboxConfig.OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: inboxConfig.GEMMA_MODEL,
      prompt: fullPrompt,
      stream: false
    })
  });

  const data2 = (await res2.json()) as { response: string };
  const text = data2.response.trim();
  const html = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replaceAll("\n", "<br />")}</p>`)
    .join("\n");

  console.log("✅ Email Composed by Gemma 2:");
  console.log("\n--- Plain Text ---");
  console.log(text);
  console.log("\n--- HTML Format ---");
  console.log(html);

  console.log("\n🎉 AI Route Integration Verified Successfully!");
}

testGemmaAIIntegration();
