export const updateWebhookXCodeSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `const response = await fetch("https://reloop.sh/webhook/v1/wh_123456789", {
  method: "PATCH",
  headers: {
    "Authorization": "Bearer rl_123456789",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    status: "paused"
  })
});

const webhook = await response.json();`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl -X PATCH "https://reloop.sh/webhook/v1/wh_123456789" \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "paused"
  }'`,
  },
];
