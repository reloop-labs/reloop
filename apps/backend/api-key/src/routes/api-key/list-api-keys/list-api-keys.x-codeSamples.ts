export const listApiKeysXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "@reloop/node";

const reloop = new Reloop({ key: "rl_123456789" });

const apiKeys = await reloop.apiKey.list({
  page: 1,
  limit: 10
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://api.reloop.sh/api-key/v1/?page=1&limit=10" \\
  -H "Authorization: Bearer rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.get(
    "https://api.reloop.sh/api-key/v1/",
    headers={
        "Authorization": "Bearer rl_123456789",
    },
    params={
        "page": 1,
        "limit": 10,
    },
)

api_keys = response.json()`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->apiKeys->list(
  options: [
    'page' => 1,
    'limit' => 10,
  ],
);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/api-key/v1/?page=1&limit=10"))
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
    "https://api.reloop.sh/api-key/v1/?page=1&limit=10"
);`,
	},
];
