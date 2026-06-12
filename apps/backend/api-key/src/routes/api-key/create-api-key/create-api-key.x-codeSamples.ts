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
		source: `import requests

response = requests.post(
    "https://api.reloop.sh/api-key/v1/",
    headers={
        "Authorization": "Bearer rl_123456789",
        "Content-Type": "application/json",
    },
    json={
        "name": "Production key",
        "enabled": True,
        "rateLimitEnabled": True,
    },
)

api_key = response.json()`,
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
		source: `import java.net.URI;
import java.net.http.*;
import java.net.http.HttpRequest.BodyPublishers;

HttpClient client = HttpClient.newHttpClient();

String body = """
    {
      "name": "Production key",
      "enabled": true,
      "rateLimitEnabled": true
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/api-key/v1/"))
    .header("Authorization", "Bearer rl_123456789")
    .header("Content-Type", "application/json")
    .POST(BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());`,
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
