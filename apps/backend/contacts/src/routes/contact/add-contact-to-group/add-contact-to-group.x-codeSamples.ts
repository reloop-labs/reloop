const addContactToGroupBody = `{
  "contact_id": "cont_123456789"
}`;

export const addContactToGroupXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response, error } = await reloop.contacts.groups.addContact('grp_123456789', {
  contact_id: 'cont_123456789',
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/group/grp_123456789 \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${addContactToGroupBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php
// composer require reloop/reloop-email
require_once 'vendor/autoload.php';

use Reloop\\Reloop;

$reloop = new Reloop('re_123456789');

$result = $reloop->contacts->groups->addContact('grp_123456789', [
    'contact_id' => 'cont_123456789',
]);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `import requests

response = requests.post(
    'https://reloop.sh/api/contacts/group/grp_123456789',
    headers={
        'x-api-key': 're_123456789',
        'Content-Type': 'application/json',
    },
    json={'contact_id': 'cont_123456789'},
)

result = response.json()`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/group/grp_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = { contact_id: 'cont_123456789' }.to_json

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
  body, _ := json.Marshal(map[string]string{"contact_id": "cont_123456789"})

  req, _ := http.NewRequest("POST", "https://reloop.sh/api/contacts/group/grp_123456789", bytes.NewBuffer(body))
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
        .post("https://reloop.sh/api/contacts/group/grp_123456789")
        .header("x-api-key", "re_123456789")
        .json(&json!({ "contact_id": "cont_123456789" }))
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

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/api/contacts/group/grp_123456789"))
    .header("x-api-key", "re_123456789")
    .header("Content-Type", "application/json")
    .POST(BodyPublishers.ofString("{\\"contact_id\\": \\"cont_123456789\\"}"))
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

var payload = new { contact_id = "cont_123456789" };

var response = await client.PostAsJsonAsync(
    "https://reloop.sh/api/contacts/group/grp_123456789",
    payload
);`,
	},
];
