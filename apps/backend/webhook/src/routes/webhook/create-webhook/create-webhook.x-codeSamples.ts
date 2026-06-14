export const createWebhookXCodeSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `const response = await fetch("https://reloop.sh/webhook/v1/", {
  method: "POST",
  headers: {
    "Authorization": "Bearer rl_123456789",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Payments Webhook",
    url: "https://example.com/webhooks/reloop"
  })
});

const webhook = await response.json();`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl -X POST "https://reloop.sh/webhook/v1/" \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Payments Webhook",
    "url": "https://example.com/webhooks/reloop"
  }'`,
  },
];
