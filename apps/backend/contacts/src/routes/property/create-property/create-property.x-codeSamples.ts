const createPropertyBody = `{
  "name": "company_name",
  "type": "string",
  "fallbackValue": "Unknown"
}`;

export const createPropertyXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response: property, error } = await reloop.contacts.createProperty({
  name: 'company_name',
  type: 'string',
  fallbackValue: 'Unknown',
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/v1/properties/create \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${createPropertyBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->createProperty(
  parameters: [
      'name' => 'company_name',
      'type' => 'string',
      'fallback_value' => 'Unknown',
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `reloop = Reloop(api_key="re_123456789")

reloop.contacts.create_property(
    name="company_name",
    type="string",
    fallback_value="Unknown"
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/properties/create')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  name: 'company_name',
  type: 'string',
  fallbackValue: 'Unknown',
}.to_json

response = http.request(request)
property = JSON.parse(response.body)`,
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
    "name":          "company_name",
    "type":          "string",
    "fallbackValue": "Unknown",
  })

  req, _ := http.NewRequest("POST", "https://reloop.sh/api/contacts/v1/properties/create", bytes.NewBuffer(body))
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
        .post("https://reloop.sh/api/contacts/v1/properties/create")
        .header("x-api-key", "re_123456789")
        .json(&json!({
            "name": "company_name",
            "type": "string",
            "fallbackValue": "Unknown"
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

String body = "{\\"name\\": \\"company_name\\", \\"type\\": \\"string\\", \\"fallbackValue\\": \\"Unknown\\"}";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/api/contacts/v1/properties/create"))
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

var property = new {
    name = "company_name",
    type = "string",
    fallbackValue = "Unknown",
};

var response = await client.PostAsJsonAsync(
    "https://reloop.sh/api/contacts/v1/properties/create",
    property
);`,
	},
];
