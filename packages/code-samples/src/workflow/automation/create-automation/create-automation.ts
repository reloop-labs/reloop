import type { CodeSample } from "../../../types";

/** POST /api/workflow/v1/automations */
export const createAutomationXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { automation, automationError } = await reloop.automations.create({
  name: "Welcome",
  status: "active",
  steps: [
    { key: "start", type: "trigger", config: { eventName: "user.signed_up" } },
    { key: "is_pro", type: "condition", config: { type: "rule", field: "trigger.plan", operator: "eq", value: "pro" } },
    { key: "welcome_pro", type: "send_email", config: { template: { id: "tmpl_123456789" } } },
    { key: "wait", type: "delay", config: { amount: 1, unit: "days" } },
    { key: "welcome_free", type: "send_email", config: { template: { id: "tmpl_987654321" } } },
  ],
  connections: [
    { from: "start", to: "is_pro" },
    { from: "is_pro", to: "welcome_pro", type: "condition_met" },
    { from: "is_pro", to: "wait", type: "condition_not_met" },
    { from: "wait", to: "welcome_free" },
  ],
});
if (automationError) throw automationError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/workflow/v1/automations \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Welcome","status":"active","steps":[{"key":"start","type":"trigger","config":{"eventName":"user.signed_up"}},{"key":"is_pro","type":"condition","config":{"type":"rule","field":"trigger.plan","operator":"eq","value":"pro"}},{"key":"welcome_pro","type":"send_email","config":{"template":{"id":"tmpl_123456789"}}},{"key":"wait","type":"delay","config":{"amount":1,"unit":"days"}},{"key":"welcome_free","type":"send_email","config":{"template":{"id":"tmpl_987654321"}}}],"connections":[{"from":"start","to":"is_pro"},{"from":"is_pro","to":"welcome_pro","type":"condition_met"},{"from":"is_pro","to":"wait","type":"condition_not_met"},{"from":"wait","to":"welcome_free"}]}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

res = requests.post(
    "https://reloop.sh/api/workflow/v1/automations",
    headers={"x-api-key": "rl_123456789"},
    json={
        "name": "Welcome",
        "status": "active",
        "steps": [
            {
                "key": "start",
                "type": "trigger",
                "config": {
                    "eventName": "user.signed_up"
                }
            },
            {
                "key": "is_pro",
                "type": "condition",
                "config": {
                    "type": "rule",
                    "field": "trigger.plan",
                    "operator": "eq",
                    "value": "pro"
                }
            },
            {
                "key": "welcome_pro",
                "type": "send_email",
                "config": {
                    "template": {
                        "id": "tmpl_123456789"
                    }
                }
            },
            {
                "key": "wait",
                "type": "delay",
                "config": {
                    "amount": 1,
                    "unit": "days"
                }
            },
            {
                "key": "welcome_free",
                "type": "send_email",
                "config": {
                    "template": {
                        "id": "tmpl_987654321"
                    }
                }
            }
        ],
        "connections": [
            {
                "from": "start",
                "to": "is_pro"
            },
            {
                "from": "is_pro",
                "to": "welcome_pro",
                "type": "condition_met"
            },
            {
                "from": "is_pro",
                "to": "wait",
                "type": "condition_not_met"
            },
            {
                "from": "wait",
                "to": "welcome_free"
            }
        ]
    },
)
res.raise_for_status()
print(res.json())`,
	},
];
