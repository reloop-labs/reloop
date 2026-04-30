export const updateContactChannelXCodeSamples = [
  {
    id: "node",
    lang: "js",
    label: "Node.js",
    source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const response = await reloop.audience.channels.updateStatus('top_987654321', {
  contact_id: 'cont_123456789',
  subscription: 'opt_in'
});`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl -X PATCH https://reloop.sh/api/contacts/v1/channel/top_987654321 \\
  -H "Authorization: Bearer re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"contactId": "cont_123456789", "status": "subscribed"}'`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->patch('https://reloop.sh/api/contacts/v1/channel/top_987654321', [
    'headers' => [
        'Authorization' => 'Bearer re_123456789',
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'contactId' => 'cont_123456789',
        'status'    => 'subscribed',
    ],
]);

$result = json_decode($response->getBody(), true);`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `import requests

response = requests.patch(
    'https://reloop.sh/api/contacts/v1/channel/top_987654321',
    headers={
        'Authorization': 'Bearer re_123456789',
        'Content-Type': 'application/json',
    },
    json={'contactId': 'cont_123456789', 'status': 'subscribed'}
)

result = response.json()`,
  },
  {
    id: "ruby",
    lang: "ruby",
    label: "Ruby",
    source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/channel/top_987654321')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(uri)
request['Authorization'] = 'Bearer re_123456789'
request['Content-Type'] = 'application/json'
request.body = { contactId: 'cont_123456789', status: 'subscribed' }.to_json

response = http.request(request)
result = JSON.parse(response.body)`,
  },
  {
    id: "go",
    lang: "go",
    label: "Go",
    source: `package main

import (
  "bytes"
  "encoding/json"
  "net/http"
)

func main() {
  body, _ := json.Marshal(map[string]string{
    "contactId": "cont_123456789",
    "status":    "subscribed",
  })

  req, _ := http.NewRequest("PATCH", "https://reloop.sh/api/contacts/v1/channel/top_987654321", bytes.NewBuffer(body))
  req.Header.Set("Authorization", "Bearer re_123456789")
  req.Header.Set("Content-Type", "application/json")

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
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let client = Client::new();

    let response = client
        .patch("https://reloop.sh/api/contacts/v1/channel/top_987654321")
        .header("Authorization", "Bearer re_123456789")
        .json(&json!({ "contactId": "cont_123456789", "status": "subscribed" }))
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
import java.net.http.HttpRequest.BodyPublishers;

HttpClient client = HttpClient.newHttpClient();

String body = "{\\"contactId\\": \\"cont_123456789\\", \\"status\\": \\"subscribed\\"}";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/api/contacts/v1/channel/top_987654321"))
    .header("Authorization", "Bearer re_123456789")
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
client.DefaultRequestHeaders.Add("Authorization", "Bearer re_123456789");

var payload = new { contactId = "cont_123456789", status = "subscribed" };

var response = await client.PostAsJsonAsync(
    "https://reloop.sh/api/contacts/v1/channel/top_987654321",
    payload
);`,
  },
];
