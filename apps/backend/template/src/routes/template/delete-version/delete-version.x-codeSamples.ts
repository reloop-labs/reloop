export const deleteVersionXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

await reloop.template.deleteVersion("tpl_123456789", "ver_123456789");`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X DELETE https://reloop.sh/template/v1/tpl_123456789/versions/ver_123456789 \\
  -H "Authorization: Bearer rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.delete(
    "https://reloop.sh/template/v1/tpl_123456789/versions/ver_123456789",
    headers={
        "Authorization": "Bearer rl_123456789",
    },
)`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$client->delete('https://reloop.sh/template/v1/tpl_123456789/versions/ver_123456789', [
    'headers' => [
        'Authorization' => 'Bearer rl_123456789',
    ],
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/template/v1/tpl_123456789/versions/ver_123456789"))
    .header("Authorization", "Bearer rl_123456789")
    .DELETE()
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

var response = await client.DeleteAsync(
    "https://reloop.sh/template/v1/tpl_123456789/versions/ver_123456789"
);`,
	},
];
