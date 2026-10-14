import type { CodeSample } from "../../../types";

/** PATCH /api/workflow/v1/events/:event_id */
export const updateEventXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { event, eventError } = await reloop.events.update("evt_123456789", {
  description: "Fired when an account is created",
  properties: [{ name: "plan", propertyType: "string", required: true }],
});
if (eventError) throw eventError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/workflow/v1/events/evt_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"description":"Fired when an account is created","properties":[{"name":"plan","propertyType":"string","required":true}]}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.patch(
    "https://reloop.sh/api/workflow/v1/events/evt_123456789",
    headers={"x-api-key": "rl_123456789"},
    json={
        "description": "Fired when an account is created",
        "properties": [
            {
                "name": "plan",
                "propertyType": "string",
                "required": True
            }
        ]
    },
)
res.raise_for_status()
print(res.json())`,
	},
];
