export const getDomainNameserversXCodeSamples = [
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `# Session cookie required (not available with API keys)
curl "https://reloop.sh/api/domain/v1/nameservers/dom_123456789" \\
  -H "Cookie: reloop.session_token=<session>"`,
	},
];
