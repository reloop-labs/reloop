import type { CodeSample } from "../../../types";

/** GET /api/workflow/v1/automations/:automation_id */
export const getAutomationXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { automation, automationError } = await reloop.automations.get("auto_123456789");
if (automationError) throw automationError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X GET https://reloop.sh/api/workflow/v1/automations/auto_123456789 \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.get(
    "https://reloop.sh/api/workflow/v1/automations/auto_123456789",
    headers={"x-api-key": "rl_123456789"},
)
res.raise_for_status()
print(res.json())`,
	},
];
