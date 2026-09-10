import type { CodeSample } from "../../types";

export const checkTempEmailXCodeSamples: CodeSample[] = [
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/tools/v1/temp-email-checker \\
  -H "Content-Type: application/json" \\
  -d '{"email": "you@mailinator.com"}'`,
	},
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `// No SDK, no API key — it is a plain POST.
const res = await fetch(
  "https://reloop.sh/api/tools/v1/temp-email-checker",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "you@mailinator.com" }),
  },
);

const result = await res.json();`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `# pip install requests
import requests

result = requests.post(
    "https://reloop.sh/api/tools/v1/temp-email-checker",
    json={"email": "you@mailinator.com"},
).json()`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `body, _ := json.Marshal(map[string]string{
    "email": "you@mailinator.com",
})

res, err := http.Post(
    "https://reloop.sh/api/tools/v1/temp-email-checker",
    "application/json",
    bytes.NewReader(body),
)`,
	},
];
