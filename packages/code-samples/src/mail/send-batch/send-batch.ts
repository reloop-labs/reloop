import type { CodeSample } from "../../types";

// SDKs have no batch helper yet, so samples call the HTTP endpoint directly.
export const sendBatchXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `const res = await fetch("https://reloop.sh/api/mail/v1/send/batch", {
  method: "POST",
  headers: {
    "x-api-key": "rl_123456789",
    "Content-Type": "application/json",
    "Idempotency-Key": "welcome-batch-2026-10-26",
  },
  body: JSON.stringify([
    {
      from: "Reloop <hello@send.example.com>",
      to: "ada@example.com",
      subject: "Welcome, Ada",
      html: "<p>Thanks for signing up.</p>",
    },
    {
      from: "Reloop <hello@send.example.com>",
      to: "grace@example.com",
      subject: "Welcome, Grace",
      html: "<p>Thanks for signing up.</p>",
    },
  ]),
});
const { data, errors } = await res.json();`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/mail/v1/send/batch \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: welcome-batch-2026-10-26" \\
  -d '[{"from":"Reloop <hello@send.example.com>","to":"ada@example.com","subject":"Welcome, Ada","html":"<p>Thanks for signing up.</p>"},{"from":"Reloop <hello@send.example.com>","to":"grace@example.com","subject":"Welcome, Grace","html":"<p>Thanks for signing up.</p>"}]'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.post(
    "https://reloop.sh/api/mail/v1/send/batch",
    headers={
        "x-api-key": "rl_123456789",
        "Idempotency-Key": "welcome-batch-2026-10-26",
    },
    json=[
        {
            "from": "Reloop <hello@send.example.com>",
            "to": "ada@example.com",
            "subject": "Welcome, Ada",
            "html": "<p>Thanks for signing up.</p>",
        },
        {
            "from": "Reloop <hello@send.example.com>",
            "to": "grace@example.com",
            "subject": "Welcome, Grace",
            "html": "<p>Thanks for signing up.</p>",
        },
    ],
)
body = res.json()
data, errors = body["data"], body["errors"]`,
	},
];
