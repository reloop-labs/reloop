import type { CodeSample } from "../../../types";

/** POST /api/workflow/v1/automations/:automation_id/enroll */
export const enrollContactXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { enrollment, enrollmentError } = await reloop.automations.enroll("auto_123456789", {
  email: "john.doe@example.com",
  firstName: "John",
});
if (enrollmentError) throw enrollmentError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/workflow/v1/automations/auto_123456789/enroll \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john.doe@example.com","firstName":"John"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.post(
    "https://reloop.sh/api/workflow/v1/automations/auto_123456789/enroll",
    headers={"x-api-key": "rl_123456789"},
    json={
        "email": "john.doe@example.com",
        "firstName": "John"
    },
)
res.raise_for_status()
print(res.json())`,
	},
];
