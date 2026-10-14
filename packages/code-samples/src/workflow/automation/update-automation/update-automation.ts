import type { CodeSample } from "../../../types";

/** PATCH /api/workflow/v1/automations/:automation_id */
export const updateAutomationXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { automation, automationError } = await reloop.automations.update("auto_123456789", {
  name: "Welcome series",
  description: "Greets new sign-ups",
});
if (automationError) throw automationError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/workflow/v1/automations/auto_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Welcome series","description":"Greets new sign-ups"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.patch(
    "https://reloop.sh/api/workflow/v1/automations/auto_123456789",
    headers={"x-api-key": "rl_123456789"},
    json={
        "name": "Welcome series",
        "description": "Greets new sign-ups"
    },
)
res.raise_for_status()
print(res.json())`,
	},
];
