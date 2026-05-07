export const deleteContactXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const response = await reloop.audience.delete('cont_123456789');`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X DELETE https://reloop.sh/api/contacts/v1/cont_123456789 \\
  -H "Authorization: Bearer re_123456789"`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->delete('https://reloop.sh/api/contacts/v1/cont_123456789', [
    'headers' => ['Authorization' => 'Bearer re_123456789'],
]);

$result = json_decode($response->getBody(), true);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.delete(
    'https://reloop.sh/api/contacts/v1/cont_123456789',
    headers={'Authorization': 'Bearer re_123456789'}
)

result = response.json()`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/cont_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(uri)
request['Authorization'] = 'Bearer re_123456789'

response = http.request(request)
result = JSON.parse(response.body)`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `package main

import "net/http"

func main() {
  req, _ := http.NewRequest("DELETE", "https://reloop.sh/api/contacts/v1/cont_123456789", nil)
  req.Header.Set("Authorization", "Bearer re_123456789")

  client := &http.Client{}
  resp, _ := client.Do(req)
  defer resp.Body.Close()
}`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reqwest::Client;

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let client = Client::new();

    let response = client
        .delete("https://reloop.sh/api/contacts/v1/cont_123456789")
        .header("Authorization", "Bearer re_123456789")
        .send()
        .await?;

    Ok(())
}`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/api/contacts/v1/cont_123456789"))
    .header("Authorization", "Bearer re_123456789")
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
client.DefaultRequestHeaders.Add("Authorization", "Bearer re_123456789");

var response = await client.DeleteAsync(
    "https://reloop.sh/api/contacts/v1/cont_123456789"
);`,
	},
];
