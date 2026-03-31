export const listWebhooksXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `const response = await fetch("https://api.reloop.sh/webhook/v1/?page=1&limit=10", {
  headers: {
    "Authorization": "Bearer rl_123456789"
  }
});

const webhooks = await response.json();`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://api.reloop.sh/webhook/v1/?page=1&limit=10" \\
  -H "Authorization: Bearer rl_123456789"`,
	},
];
