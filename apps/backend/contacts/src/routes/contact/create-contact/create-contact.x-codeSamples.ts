const createContactBody = `{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "subscribed",
  "properties": {
    "company": "Reloop",
    "role": "Developer"
  },
  "groupIds": ["grp_123456789"],
  "channels": [
    {
      "channelId": "channel_123456789",
      "subscription": "opt_in"
    }
  ]
}`;

export const createContactXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { data: contact, error } = await reloop.contacts.create({
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Developer',
  },
  groupIds: ['grp_123456789'],
  channels: [
    {
      channelId: 'channel_123456789',
      subscription: 'opt_in',
    },
  ],
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/create \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${createContactBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
$client = new \\GuzzleHttp\\Client();

$response = $client->post('https://reloop.sh/api/contacts/create', [
    'headers' => [
        'x-api-key'     => 're_123456789',
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'email'      => 'john.doe@example.com',
        'firstName'  => 'John',
        'lastName'   => 'Doe',
        'status'     => 'subscribed',
        'properties' => [
            'company' => 'Reloop',
            'role'    => 'Developer',
        ],
        'groupIds'   => ['grp_123456789'],
        'channels'   => [
            [
                'channelId'    => 'channel_123456789',
                'subscription' => 'opt_in',
            ],
        ],
    ],
]);

$contact = json_decode($response->getBody(), true);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.post(
    'https://reloop.sh/api/contacts/create',
    headers={
        'x-api-key': 're_123456789',
        'Content-Type': 'application/json',
    },
    json={
        'email': 'john.doe@example.com',
        'firstName': 'John',
        'lastName': 'Doe',
        'status': 'subscribed',
        'properties': {
            'company': 'Reloop',
            'role': 'Developer',
        },
        'groupIds': ['grp_123456789'],
        'channels': [
            {
                'channelId': 'channel_123456789',
                'subscription': 'opt_in',
            },
        ],
    },
)

contact = response.json()`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/create')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Developer',
  },
  groupIds: ['grp_123456789'],
  channels: [
    {
      channelId: 'channel_123456789',
      subscription: 'opt_in',
    },
  ],
}.to_json

response = http.request(request)
contact = JSON.parse(response.body)`,
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
  body, _ := json.Marshal(map[string]any{
    "email":     "john.doe@example.com",
    "firstName": "John",
    "lastName":  "Doe",
    "status":    "subscribed",
    "properties": map[string]string{
      "company": "Reloop",
      "role":    "Developer",
    },
    "groupIds": []string{"grp_123456789"},
    "channels": []map[string]string{
      {
        "channelId":    "channel_123456789",
        "subscription": "opt_in",
      },
    },
  })

  req, _ := http.NewRequest("POST", "https://reloop.sh/api/contacts/create", bytes.NewBuffer(body))
  req.Header.Set("x-api-key", "re_123456789")
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
        .post("https://reloop.sh/api/contacts/create")
        .header("x-api-key", "re_123456789")
        .json(&json!({
            "email": "john.doe@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "status": "subscribed",
            "properties": {
                "company": "Reloop",
                "role": "Developer"
            },
            "groupIds": ["grp_123456789"],
            "channels": [{
                "channelId": "channel_123456789",
                "subscription": "opt_in"
            }]
        }))
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

String body = """
    ${createContactBody.replace(/\n/g, "\n    ")}
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/api/contacts/create"))
    .header("x-api-key", "re_123456789")
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
client.DefaultRequestHeaders.Add("x-api-key", "re_123456789");

var contact = new {
    email = "john.doe@example.com",
    firstName = "John",
    lastName = "Doe",
    status = "subscribed",
    properties = new Dictionary<string, string> {
        ["company"] = "Reloop",
        ["role"] = "Developer",
    },
    groupIds = new[] { "grp_123456789" },
    channels = new[] {
        new {
            channelId = "channel_123456789",
            subscription = "opt_in",
        },
    },
};

var response = await client.PostAsJsonAsync(
    "https://reloop.sh/api/contacts/create",
    contact
);`,
	},
];
