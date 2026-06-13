export const listTemplatesXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop("rl_123456789");

const templates = await reloop.template.list({ page: 1, limit: 10 });`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://api.reloop.sh/template/v1/list?page=1&limit=10" \\
  -H "Authorization: Bearer rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.get(
    "https://api.reloop.sh/template/v1/list",
    headers={
        "Authorization": "Bearer rl_123456789",
    },
    params={
        "page": 1,
        "limit": 10,
    },
)

templates = response.json()`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->get('https://api.reloop.sh/template/v1/list', [
    'headers' => [
        'Authorization' => 'Bearer rl_123456789',
    ],
    'query' => [
        'page' => 1,
        'limit' => 10,
    ],
]);

$templates = json_decode($response->getBody(), true);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/template/v1/list?page=1&limit=10"))
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
    "https://api.reloop.sh/template/v1/list?page=1&limit=10"
);`,
	},
];
