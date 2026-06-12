export const createVersionXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({ key: "rl_123456789" });

const version = await reloop.template.createVersion("tpl_123456789", {
  content: [],
  isMajor: true,
  name: "v1.0.0"
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://api.reloop.sh/template/v1/tpl_123456789/versions \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": [],
    "isMajor": true,
    "name": "v1.0.0"
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.post(
    "https://api.reloop.sh/template/v1/tpl_123456789/versions",
    headers={
        "Authorization": "Bearer rl_123456789",
        "Content-Type": "application/json",
    },
    json={
        "content": [],
        "isMajor": True,
        "name": "v1.0.0",
    },
)

version = response.json()`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->post('https://api.reloop.sh/template/v1/tpl_123456789/versions', [
    'headers' => [
        'Authorization' => 'Bearer rl_123456789',
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'content' => [],
        'isMajor' => true,
        'name' => 'v1.0.0',
    ],
]);

$version = json_decode($response->getBody(), true);`,
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
      "content": [],
      "isMajor": true,
      "name": "v1.0.0"
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/template/v1/tpl_123456789/versions"))
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
    content = new object[] {},
    isMajor = true,
    name = "v1.0.0"
};

var response = await client.PostAsJsonAsync(
    "https://api.reloop.sh/template/v1/tpl_123456789/versions",
    payload
);`,
	},
];
