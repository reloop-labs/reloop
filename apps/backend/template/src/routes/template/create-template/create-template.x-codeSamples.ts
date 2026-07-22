export const createTemplateXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const template = await reloop.template.create({
  name: "Welcome Email",
  subject: "Welcome to Reloop!",
  content: []
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/template/v1/create \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Welcome Email",
    "subject": "Welcome to Reloop!",
    "content": []
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

const template = reloop.template.create({
  name: "Welcome Email",
  subject: "Welcome to Reloop!",
  content: []
});`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->post('https://reloop.sh/template/v1/create', [
    'headers' => [
        'Authorization' => 'Bearer rl_123456789',
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'name' => 'Welcome Email',
        'subject' => 'Welcome to Reloop!',
        'content' => [],
    ],
]);

$template = json_decode($response->getBody(), true);`,
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
      "name": "Welcome Email",
      "subject": "Welcome to Reloop!",
      "content": []
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/template/v1/create"))
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
    name = "Welcome Email",
    subject = "Welcome to Reloop!",
    content = new object[] {}
};

var response = await client.PostAsJsonAsync(
    "https://reloop.sh/template/v1/create",
    payload
);`,
	},
];
