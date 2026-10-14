import type { CodeSample } from "../../types";

/**
 * POST /api/workflow/v1/events/track — fires a workflow custom event and
 * enrolls the contact in automations triggered by it.
 *
 * The SDKs don't wrap this endpoint yet, so every sample is a plain HTTP call.
 * `user.signed_up` is the placeholder event key; the dashboard swaps in the
 * real key of the automation's trigger.
 */
export const TRACK_EVENT_PLACEHOLDER_KEY = "user.signed_up";

export const trackEventXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `const res = await fetch("https://reloop.sh/api/workflow/v1/events/track", {
  method: "POST",
  headers: {
    "x-api-key": "rl_123456789",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    event: "user.signed_up",
    email: "john.doe@example.com",
    properties: { plan: "pro" },
  }),
});
const { enrollments } = await res.json();`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.post(
    "https://reloop.sh/api/workflow/v1/events/track",
    headers={"x-api-key": "rl_123456789"},
    json={
        "event": "user.signed_up",
        "email": "john.doe@example.com",
        "properties": {"plan": "pro"},
    },
)
res.raise_for_status()`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

$ch = curl_init('https://reloop.sh/api/workflow/v1/events/track');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'x-api-key: rl_123456789',
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'event' => 'user.signed_up',
        'email' => 'john.doe@example.com',
        'properties' => ['plan' => 'pro'],
    ]),
]);
$response = curl_exec($ch);`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `body := strings.NewReader(\`{
  "event": "user.signed_up",
  "email": "john.doe@example.com",
  "properties": {"plan": "pro"}
}\`)

req, _ := http.NewRequest("POST", "https://reloop.sh/api/workflow/v1/events/track", body)
req.Header.Set("x-api-key", "rl_123456789")
req.Header.Set("Content-Type", "application/json")

res, err := http.DefaultClient.Do(req)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "net/http"
require "json"

uri = URI("https://reloop.sh/api/workflow/v1/events/track")
res = Net::HTTP.post(
  uri,
  {
    event: "user.signed_up",
    email: "john.doe@example.com",
    properties: { plan: "pro" },
  }.to_json,
  "x-api-key" => "rl_123456789",
  "Content-Type" => "application/json",
)`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/workflow/v1/events/track \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"event": "user.signed_up","email": "john.doe@example.com","properties": {"plan": "pro"}}'`,
	},
];
