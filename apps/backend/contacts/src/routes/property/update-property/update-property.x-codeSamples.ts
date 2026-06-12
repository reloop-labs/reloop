const updatePropertyBody = `{
  "fallbackValue": "N/A"
}`;

export const updatePropertyXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response: property, error } = await reloop.contacts.updateProperty('prop_123456789', {
  fallbackValue: 'N/A',
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/contacts/v1/properties/prop_123456789 \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${updatePropertyBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->updateProperty(
  'prop_123456789',
  parameters: [
      'fallback_value' => 'N/A',
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `reloop = Reloop(api_key="re_123456789")

reloop.contacts.update_property(
    "prop_123456789",
    fallback_value="N/A"
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/properties/prop_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = { fallbackValue: 'N/A' }.to_json

response = http.request(request)
property = JSON.parse(response.body)`,
	},
		{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop

func main() {
    client, _ := reloop.NewClient(reloop.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = client.Contacts.UpdateProperty("prop_123456789", map[string]interface{}{
        "fallback_value": "N/A"
    })
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
        .patch("https://reloop.sh/api/contacts/v1/properties/prop_123456789")
        .header("x-api-key", "re_123456789")
        .json(&json!({ "fallbackValue": "N/A" }))
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
    .uri(URI.create("https://reloop.sh/api/contacts/v1/properties/prop_123456789"))
    .header("x-api-key", "re_123456789")
    .header("Content-Type", "application/json")
    .method("PATCH", BodyPublishers.ofString("{\\"fallbackValue\\": \\"N/A\\"}"))
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

var update = new { fallbackValue = "N/A" };

var response = await client.PatchAsJsonAsync(
    "https://reloop.sh/api/contacts/v1/properties/prop_123456789",
    update
);`,
	},
];
