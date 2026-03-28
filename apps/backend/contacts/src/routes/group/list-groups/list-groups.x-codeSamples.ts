export const listGroupsXCodeSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const groups = await reloop.audience.listGroups({ limit: 10, page: 1 });`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl "https://reloop.sh/api/groups/v1/list?limit=10&page=1" \\
  -H "Authorization: Bearer re_123456789"`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->get('https://reloop.sh/api/groups/v1/list', [
    'headers' => ['Authorization' => 'Bearer re_123456789'],
    'query'   => ['limit' => 10, 'page' => 1],
]);

$groups = json_decode($response->getBody(), true);`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `import requests

response = requests.get(
    'https://reloop.sh/api/groups/v1/list',
    headers={'Authorization': 'Bearer re_123456789'},
    params={'limit': 10, 'page': 1}
)

groups = response.json()`,
  },
  {
    id: "ruby",
    lang: "ruby",
    label: "Ruby",
    source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/groups/v1/list')
uri.query = URI.encode_www_form(limit: 10, page: 1)
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Get.new(uri)
request['Authorization'] = 'Bearer re_123456789'

response = http.request(request)
groups = JSON.parse(response.body)`,
  },
  {
    id: "go",
    lang: "go",
    label: "Go",
    source: `package main

import "net/http"

func main() {
  req, _ := http.NewRequest("GET", "https://reloop.sh/api/groups/v1/list?limit=10&page=1", nil)
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
        .get("https://reloop.sh/api/groups/v1/list")
        .header("Authorization", "Bearer re_123456789")
        .query(&[("limit", "10"), ("page", "1")])
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
    .uri(URI.create("https://reloop.sh/api/groups/v1/list?limit=10&page=1"))
    .header("Authorization", "Bearer re_123456789")
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
client.DefaultRequestHeaders.Add("Authorization", "Bearer re_123456789");

var response = await client.GetAsync(
    "https://reloop.sh/api/groups/v1/list?limit=10&page=1"
);`,
  },
];
