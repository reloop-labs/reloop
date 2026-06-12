export const getApiKeyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "@reloop/node";

const reloop = new Reloop({ key: "rl_123456789" });

const apiKey = await reloop.apiKey.get("key_123456789");`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl https://api.reloop.sh/api-key/v1/key_123456789 \\
  -H "Authorization: Bearer rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.get(
    "https://api.reloop.sh/api-key/v1/key_123456789",
    headers={
        "Authorization": "Bearer rl_123456789",
    },
)

api_key = response.json()`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->apiKeys->get('key_123456789');`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/api-key/v1/key_123456789"))
    .header("Authorization", "Bearer rl_123456789")
    .GET()
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using System.Net.Http;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer rl_123456789");

var response = await client.GetAsync(
    "https://api.reloop.sh/api-key/v1/key_123456789"
);`,
	},
];
