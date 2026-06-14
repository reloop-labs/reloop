export const duplicateTemplateXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop("rl_123456789");

const newTemplate = await reloop.template.duplicate("tpl_123456789");`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/template/v1/tpl_123456789/duplicate \\
  -H "Authorization: Bearer rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.post(
    "https://reloop.sh/template/v1/tpl_123456789/duplicate",
    headers={
        "Authorization": "Bearer rl_123456789",
    },
)

new_template = response.json()`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->post('https://reloop.sh/template/v1/tpl_123456789/duplicate', [
    'headers' => [
        'Authorization' => 'Bearer rl_123456789',
    ],
]);

$newTemplate = json_decode($response->getBody(), true);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/template/v1/tpl_123456789/duplicate"))
    .header("Authorization", "Bearer rl_123456789")
    .POST(HttpRequest.BodyPublishers.noBody())
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

var response = await client.PostAsync(
    "https://reloop.sh/template/v1/tpl_123456789/duplicate",
    null
);`,
	},
];
