export const deleteWebhookXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `await fetch("https://api.reloop.sh/webhook/v1/wh_123456789", {
  method: "DELETE",
  headers: {
    "Authorization": "Bearer rl_123456789"
  }
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X DELETE "https://api.reloop.sh/webhook/v1/wh_123456789" \\
  -H "Authorization: Bearer rl_123456789"`,
	},
];
