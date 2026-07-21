export const listVersionsXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const versions = await reloop.template.listVersions("tpl_123456789", { page: 1, limit: 10 });`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/template/v1/tpl_123456789/versions?page=1&limit=10" \\
  -H "Authorization: Bearer rl_123456789"`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

const versions = reloop.template.listVersions("tpl_123456789", { page: 1, limit: 10 });`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->get('https://reloop.sh/template/v1/tpl_123456789/versions', [
    'headers' => [
        'Authorization' => 'Bearer rl_123456789',
    ],
    'query' => [
        'page' => 1,
        'limit' => 10,
    ],
]);

$versions = json_decode($response->getBody(), true);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/template/v1/tpl_123456789/versions?page=1&limit=10"))
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
    "https://reloop.sh/template/v1/tpl_123456789/versions?page=1&limit=10"
);`,
	},
];
