export const createDomainXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `const response = await fetch("https://api.reloop.sh/api/domain/v1/create", {
  method: "POST",
  headers: {
    "x-api-key": "rl_123456789",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    domain: "send.example.com",
    customReturnPath: "send",
    clickTracking: true,
    openTracking: true,
    tls: "opportunistic",
    sendingEmail: true,
    receivingEmail: true
  })
});

const domain = await response.json();`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://api.reloop.sh/api/domain/v1/create \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "send.example.com",
    "customReturnPath": "send",
    "clickTracking": true,
    "openTracking": true,
    "tls": "opportunistic",
    "sendingEmail": true,
    "receivingEmail": true
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.post(
    "https://api.reloop.sh/api/domain/v1/create",
    headers={
        "x-api-key": "rl_123456789",
        "Content-Type": "application/json",
    },
    json={
        "domain": "send.example.com",
        "customReturnPath": "send",
        "clickTracking": True,
        "openTracking": True,
        "tls": "opportunistic",
        "sendingEmail": True,
        "receivingEmail": True,
    },
)

domain = response.json()`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->post('https://api.reloop.sh/api/domain/v1/create', [
    'headers' => [
        'x-api-key' => 'rl_123456789',
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'domain' => 'send.example.com',
        'customReturnPath' => 'send',
        'clickTracking' => true,
        'openTracking' => true,
        'tls' => 'opportunistic',
        'sendingEmail' => true,
        'receivingEmail' => true,
    ],
]);

$domain = json_decode($response->getBody(), true);`,
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
      "domain": "send.example.com",
      "customReturnPath": "send",
      "clickTracking": true,
      "openTracking": true,
      "tls": "opportunistic",
      "sendingEmail": true,
      "receivingEmail": true
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/api/domain/v1/create"))
    .header("x-api-key", "rl_123456789")
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
client.DefaultRequestHeaders.Add("x-api-key", "rl_123456789");

var payload = new {
    domain = "send.example.com",
    customReturnPath = "send",
    clickTracking = true,
    openTracking = true,
    tls = "opportunistic",
    sendingEmail = true,
    receivingEmail = true
};

var response = await client.PostAsJsonAsync(
    "https://api.reloop.sh/api/domain/v1/create",
    payload
);`,
	},
];
