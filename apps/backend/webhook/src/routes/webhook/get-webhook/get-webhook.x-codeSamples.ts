export const getWebhookXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `const response = await fetch("https://reloop.sh/webhook/v1/wh_123456789", {
  headers: {
    "Authorization": "Bearer rl_123456789"
  }
});

const webhook = await response.json();`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/webhook/v1/wh_123456789" \\
  -H "Authorization: Bearer rl_123456789"`,
	},
];
