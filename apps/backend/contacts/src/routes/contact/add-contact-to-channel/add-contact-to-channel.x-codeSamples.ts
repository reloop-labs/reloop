const addContactToChannelBody = `{
  "contact_id": "cont_123456789",
  "subscription": "opt_in"
}`;

export const addContactToChannelXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response, error } = await reloop.contacts.channels.addContact('channel_123456789', {
  contact_id: 'cont_123456789',
  subscription: 'opt_in',
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/channel/channel_123456789 \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${addContactToChannelBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->channels->addContact(
  'channel_123456789',
  parameters: [
      'contact_id' => 'cont_123456789',
      'subscription' => 'opt_in',
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `reloop = Reloop(api_key="re_123456789")

reloop.contacts.channels.add_contact(
    "channel_123456789",
    contact_id="cont_123456789",
    subscription="opt_in"
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/channel/channel_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  contact_id: 'cont_123456789',
  subscription: 'opt_in',
}.to_json

response = http.request(request)
result = JSON.parse(response.body)`,
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
    
    _, _ = client.Contacts.Channels.AddContact("channel_123456789", map[string]interface{}{
        "contact_id": "cont_123456789",
        "subscription": "opt_in"
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
        .post("https://reloop.sh/api/contacts/channel/channel_123456789")
        .header("x-api-key", "re_123456789")
        .json(&json!({
            "contact_id": "cont_123456789",
            "subscription": "opt_in"
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

String body = "{\\"contact_id\\": \\"cont_123456789\\", \\"subscription\\": \\"opt_in\\"}";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/api/contacts/channel/channel_123456789"))
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

var payload = new { contact_id = "cont_123456789", subscription = "opt_in" };

var response = await client.PostAsJsonAsync(
    "https://reloop.sh/api/contacts/channel/channel_123456789",
    payload
);`,
	},
];
