import type { CodeSample } from "../../../types";

/** POST /api/workflow/v1/events */
export const createEventXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { event, eventError } = await reloop.events.create({
  name: "User signed up",
  key: "user.signed_up",
  properties: [{ name: "plan", propertyType: "string", required: true }],
});
if (eventError) throw eventError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/workflow/v1/events \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"User signed up","key":"user.signed_up","properties":[{"name":"plan","propertyType":"string","required":true}]}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.post(
    "https://reloop.sh/api/workflow/v1/events",
    headers={"x-api-key": "rl_123456789"},
    json={
        "name": "User signed up",
        "key": "user.signed_up",
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
