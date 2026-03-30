export const updateDomainXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `const response = await fetch("https://api.reloop.sh/api/domain/v1/domain_123456789", {
  method: "PATCH",
  headers: {
    "x-api-key": "rl_123456789",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    clickTracking: true,
    openTracking: true,
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
		source: `curl -X PATCH https://api.reloop.sh/api/domain/v1/domain_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clickTracking": true,
    "openTracking": true,
    "sendingEmail": true,
    "receivingEmail": true
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.patch(
    "https://api.reloop.sh/api/domain/v1/domain_123456789",
    headers={
        "x-api-key": "rl_123456789",
        "Content-Type": "application/json",
    },
    json={
        "clickTracking": True,
        "openTracking": True,
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

$response = $client->patch('https://api.reloop.sh/api/domain/v1/domain_123456789', [
    'headers' => [
        'x-api-key' => 'rl_123456789',
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'clickTracking' => true,
        'openTracking' => true,
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
      "clickTracking": true,
      "openTracking": true,
      "sendingEmail": true,
      "receivingEmail": true
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/api/domain/v1/domain_123456789"))
    .header("x-api-key", "rl_123456789")
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
client.DefaultRequestHeaders.Add("x-api-key", "rl_123456789");

var payload = new {
    clickTracking = true,
    openTracking = true,
    sendingEmail = true,
    receivingEmail = true
};

var request = new HttpRequestMessage(
    HttpMethod.Patch,
    "https://api.reloop.sh/api/domain/v1/domain_123456789"
) {
    Content = JsonContent.Create(payload)
};

var response = await client.SendAsync(request);`,
	},
];
