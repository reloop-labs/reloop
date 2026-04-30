export const getChannelXCodeSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const channel = await reloop.audience.getChannel('channel_123456789');`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl -X GET https://reloop.sh/api/channels/v1/channel_123456789 \\
  -H "Authorization: Bearer re_123456789"`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->get('https://reloop.sh/api/channels/v1/channel_123456789', [
    'headers' => [
        'Authorization' => 'Bearer re_123456789',
    ],
]);

$channel = json_decode($response->getBody(), true);`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `import requests

response = requests.get(
    'https://reloop.sh/api/channels/v1/channel_123456789',
    headers={
        'Authorization': 'Bearer re_123456789',
    }
)

channel = response.json()`,
  },
  {
    id: "ruby",
    lang: "ruby",
    label: "Ruby",
    source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/channels/v1/channel_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Get.new(uri)
request['Authorization'] = 'Bearer re_123456789'

response = http.request(request)
channel = JSON.parse(response.body)`,
  },
  {
    id: "go",
    lang: "go",
    label: "Go",
    source: `package main

import (
  "io/ioutil"
  "net/http"
)

func main() {
  req, _ := http.NewRequest("GET", "https://reloop.sh/api/channels/v1/channel_123456789", nil)
  req.Header.Set("Authorization", "Bearer re_123456789")

  client := &http.Client{}
  resp, _ := client.Do(req)
  defer resp.Body.Close()

  body, _ := ioutil.ReadAll(resp.Body)
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
        .get("https://reloop.sh/api/channels/v1/channel_123456789")
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
    .uri(URI.create("https://reloop.sh/api/channels/v1/channel_123456789"))
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
    "https://reloop.sh/api/channels/v1/channel_123456789"
);`,
  },
];
