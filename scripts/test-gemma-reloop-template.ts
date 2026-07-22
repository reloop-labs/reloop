import { fetch } from "bun";

// Configuration for Gemma API (Local Ollama or Cloudflare Tunnel)
const GEMMA_API_URL = process.env.GEMMA_API_URL || "http://localhost:11434/api/generate";
const MODEL_NAME = process.env.GEMMA_MODEL || "gemma2:9b";

interface GemmaResponse {
  model: string;
  response: string;
  done: boolean;
}

interface ReloopTemplatePayload {
  name: string;
  description: string;
  subject: string;
  variables: string[];
  content: Array<{ type: string; value: string }>;
}

async function testGemmaTemplateGeneration() {
  console.log(`🤖 Connecting to Google Gemma via API: ${GEMMA_API_URL}`);
  console.log(`📦 Using Model: ${MODEL_NAME}\n`);

  const prompt = `You are an AI assistant for Reloop, an email infrastructure platform.
Generate a JSON object for a promotional welcome email template.
Output ONLY valid JSON matching this exact structure, with no markdown code blocks:
{
  "name": "Welcome Onboarding Email",
  "description": "Short description of template",
  "subject": "Welcome to {{company_name}}!",
  "variables": ["company_name", "user_name"],
  "content": [
    {"type": "heading", "value": "Welcome {{user_name}}!"},
    {"type": "paragraph", "value": "Thank you for joining {{company_name}}."}
  ]
}`;

  try {
    const startTime = Date.now();
    const res = await fetch(GEMMA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2
        }
      })
    });

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as GemmaResponse;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`⚡ Response received in ${duration}s!\n`);
    console.log("--- Raw Gemma Output ---");
    console.log(data.response);
    console.log("------------------------\n");

    // Clean JSON response if enclosed in backticks
    const cleanedJson = data.response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedTemplate: ReloopTemplatePayload = JSON.parse(cleanedJson);

    console.log("✅ Successfully Parsed Reloop Template Payload:");
    console.dir(parsedTemplate, { depth: null });

    console.log("\n🎉 Test passed! Gemma generated a valid Reloop template payload.");
  } catch (err: any) {
    console.error("❌ Test Failed:", err.message || err);
    console.log("\nTip: Make sure Ollama/Cloudflare Tunnel is running with:");
    console.log("   1. ollama run gemma2:2b");
    console.log("   2. cloudflared tunnel --url http://localhost:11434");
  }
}

testGemmaTemplateGeneration();
