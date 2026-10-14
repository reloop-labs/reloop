import type { CodeSample } from "../../../types";

/** DELETE /api/workflow/v1/events/:event_id */
export const deleteEventXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { event, eventError } = await reloop.events.delete("evt_123456789");
if (eventError) throw eventError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X DELETE https://reloop.sh/api/workflow/v1/events/evt_123456789 \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.delete(
    "https://reloop.sh/api/workflow/v1/events/evt_123456789",
    headers={"x-api-key": "rl_123456789"},
)
res.raise_for_status()
print(res.json())`,
	},
];
