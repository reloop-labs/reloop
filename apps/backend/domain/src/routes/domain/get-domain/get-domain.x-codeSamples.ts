export const getDomainXCodeSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `const response = await fetch("https://api.reloop.sh/api/domain/v1/send.example.com", {
  method: "GET",
  headers: {
    "x-api-key": "rl_123456789"
  }
});

const domain = await response.json();`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl -X GET https://api.reloop.sh/api/domain/v1/send.example.com \\
  -H "x-api-key: rl_123456789"`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `import requests

response = requests.get(
    "https://api.reloop.sh/api/domain/v1/send.example.com",
    headers={
        "x-api-key": "rl_123456789"
    }
)

domain = response.json()`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->get('https://api.reloop.sh/api/domain/v1/send.example.com', [
    'headers' => [
        'x-api-key' => 'rl_123456789'
    ]
]);

$domain = json_decode($response->getBody(), true);`,
  },
  {
    id: "java",
    lang: "java",
    label: "Java",
    source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.reloop.sh/api/domain/v1/send.example.com"))
    .header("x-api-key", "rl_123456789")
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
client.DefaultRequestHeaders.Add("x-api-key", "rl_123456789");

var response = await client.GetAsync(
    "https://api.reloop.sh/api/domain/v1/send.example.com"
);`,
  },
];
