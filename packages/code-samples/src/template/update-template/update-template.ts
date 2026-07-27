import type { CodeSample } from "../../types";

export const updateTemplateXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const updatedTemplate = await reloop.template.update("tpl_123456789", {
  name: "Updated Welcome Email",
  subject: "Welcome to Reloop! (Updated)"
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PUT https://reloop.sh/template/v1/tpl_123456789 \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Welcome Email",
    "subject": "Welcome to Reloop! (Updated)"
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

const updatedTemplate = reloop.template.update("tpl_123456789", {
  name: "Updated Welcome Email",
  subject: "Welcome to Reloop! (Updated)"
});`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->put('https://reloop.sh/template/v1/tpl_123456789', [
    'headers' => [
        'Authorization' => 'Bearer rl_123456789',
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'name' => 'Updated Welcome Email',
        'subject' => 'Welcome to Reloop! (Updated)',
    ],
]);

$updatedTemplate = json_decode($response->getBody(), true);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
HttpClient client = HttpClient.newHttpClient();

String body = """
    {
      "name": "Updated Welcome Email",
      "subject": "Welcome to Reloop! (Updated)"
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/template/v1/tpl_123456789"))
    .header("Authorization", "Bearer rl_123456789")
    .header("Content-Type", "application/json")
    .PUT(BodyPublishers.ofString(body))
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
    name = "Updated Welcome Email",
    subject = "Welcome to Reloop! (Updated)"
};

var response = await client.PutAsJsonAsync(
    "https://reloop.sh/template/v1/tpl_123456789",
    payload
);`,
	},
];
