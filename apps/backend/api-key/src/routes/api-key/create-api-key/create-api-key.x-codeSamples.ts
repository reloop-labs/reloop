export const createApiKeyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "@reloop/node";

const reloop = new Reloop({ key: "rl_123456789" });

const apiKey = await reloop.apiKey.create({
  name: "Production key",
  enabled: true,
  rateLimitEnabled: true
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://api.reloop.sh/api-key/v1/ \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production key",
    "enabled": true,
    "rateLimitEnabled": true
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `reloop = Reloop(api_key="rl_123456789")

reloop.api_keys.create(
    name="Production key",
    enabled=True,
    rate_limit_enabled=True
)`,
	},
			{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop

func main() {
    client, _ := reloop.NewClient(reloop.ClientOptions{
        APIKey: "rl_123456789",
    })
    
    _, _ = client.ApiKeys.Create(reloop.CreateApiKeyParams{
        Name: "Production key",
        Enabled: reloop.Bool(true),
        RateLimitEnabled: reloop.Bool(true)
    })
}`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->apiKeys->create(
  parameters: [
    'name' => 'Production key',
    'enabled' => true,
    'rate_limit_enabled' => true,
  ],
);`,
	},
		{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.apiKeys.create(new CreateApiKeyParams("Production key", true, true));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using System.Net.Http;
using System.Net.Http.Json;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer rl_123456789");

var payload = new {
    name = "Production key",
    enabled = true,
    rateLimitEnabled = true
};

var response = await client.PostAsJsonAsync(
    "https://api.reloop.sh/api-key/v1/",
    payload
);`,
	},
];
