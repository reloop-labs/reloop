export const updateApiKeyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "@reloop/node";

const reloop = new Reloop({ key: "rl_123456789" });

const apiKey = await reloop.apiKey.update("key_123456789", {
  name: "Updated production key",
  enabled: true
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://api.reloop.sh/api-key/v1/key_123456789 \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated production key",
    "enabled": true
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `reloop = Reloop(api_key="rl_123456789")

reloop.api_keys.update(
    "key_123456789",
    name="Updated production key",
    enabled=True
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
    
    _, _ = client.ApiKeys.Update("key_123456789", reloop.UpdateApiKeyParams{
        Name: "Updated production key",
        Enabled: reloop.Bool(true)
    })
}`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->apiKeys->update(
  'key_123456789',
  parameters: [
    'name' => 'Updated production key',
    'enabled' => true,
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
      "name": "Updated production key",
      "enabled": true
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/api-key/v1/key_123456789"))
    .header("Authorization", "Bearer rl_123456789")
    .header("Content-Type", "application/json")
    .method("PATCH", BodyPublishers.ofString(body))
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
    name = "Updated production key",
    enabled = true
};

var response = await client.PatchAsJsonAsync(
    "https://api.reloop.sh/api-key/v1/key_123456789",
    payload
);`,
	},
];
