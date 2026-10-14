import type { CodeSample } from "../../../types";

/** POST /api/workflow/v1/automations/:automation_id/pause */
export const pauseAutomationXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { automation, automationError } = await reloop.automations.pause("auto_123456789");
if (automationError) throw automationError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/workflow/v1/automations/auto_123456789/pause \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.post(
    "https://reloop.sh/api/workflow/v1/automations/auto_123456789/pause",
    headers={"x-api-key": "rl_123456789"},
)
res.raise_for_status()
print(res.json())`,
	},
];
