import type { CodeSample } from "../../types";

export const htmlToImageXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";
import { writeFile } from "node:fs/promises";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const image = await reloop.template.htmlToImage({
  html: "<h1>Welcome</h1><p>Thanks for signing up.</p>",
  width: 600,
  format: "png"
});

await writeFile("template.png", image);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/template/v1/html-to-image \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  --output template.png \\
  -d '{
    "html": "<h1>Welcome</h1><p>Thanks for signing up.</p>",
    "width": 600,
    "format": "png"
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.post(
    "https://reloop.sh/template/v1/html-to-image",
    headers={
        "Authorization": "Bearer rl_123456789",
        "Content-Type": "application/json",
    },
    json={
        "html": "<h1>Welcome</h1><p>Thanks for signing up.</p>",
        "width": 600,
        "format": "png",
    },
)
response.raise_for_status()
open("template.png", "wb").write(response.content)`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->post('https://reloop.sh/template/v1/html-to-image', [
    'headers' => [
        'Authorization' => 'Bearer rl_123456789',
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'html' => '<h1>Welcome</h1><p>Thanks for signing up.</p>',
        'width' => 600,
        'format' => 'png',
    ],
    'sink' => 'template.png',
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;

HttpClient client = HttpClient.newHttpClient();
String body = """
    {
      "html": "<h1>Welcome</h1><p>Thanks for signing up.</p>",
      "width": 600,
      "format": "png"
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/template/v1/html-to-image"))
    .header("Authorization", "Bearer rl_123456789")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<byte[]> response = client.send(
    request, HttpResponse.BodyHandlers.ofByteArray());
Files.write(Path.of("template.png"), response.body());`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer rl_123456789");

var content = new StringContent(
    """{"html":"<h1>Welcome</h1><p>Thanks for signing up.</p>","width":600,"format":"png"}""",
    Encoding.UTF8,
    "application/json");

var response = await client.PostAsync(
    "https://reloop.sh/template/v1/html-to-image",
    content);
var bytes = await response.Content.ReadAsByteArrayAsync();
await File.WriteAllBytesAsync("template.png", bytes);`,
	},
];
