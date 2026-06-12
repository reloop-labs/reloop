const updateChannelBody = `{
  "name": "Marketing News",
  "description": "Internal marketing updates",
  "visibility": "private"
}`;

export const updateChannelXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response: channel, error } = await reloop.contacts.channels.update('chn_123456789', {
  name: 'Marketing News',
  description: 'Internal marketing updates',
  visibility: 'private',
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/contacts/v1/channels/chn_123456789 \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${updateChannelBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->channels->update(
  'chn_123456789',
  parameters: [
      'name' => 'Marketing News',
      'description' => 'Internal marketing updates',
      'visibility' => 'private',
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `reloop = Reloop(api_key="re_123456789")

reloop.contacts.channels.update(
    "chn_123456789",
    name="Marketing News",
    description="Internal marketing updates",
    visibility="private"
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/channels/chn_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  name: 'Marketing News',
  description: 'Internal marketing updates',
  visibility: 'private',
}.to_json

response = http.request(request)
channel = JSON.parse(response.body)`,
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
    
    _, _ = client.Contacts.Channels.Update("chn_123456789", map[string]interface{}{
        "name": "Marketing News",
        "description": "Internal marketing updates",
        "visibility": "private"
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
        .patch("https://reloop.sh/api/contacts/v1/channels/chn_123456789")
        .header("x-api-key", "re_123456789")
        .json(&json!({
            "name": "Marketing News",
            "description": "Internal marketing updates",
            "visibility": "private"
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
		source: `import sh.reloop.ReloopClient;
import java.util.*;

ReloopClient reloop = new ReloopClient("re_123456789");

reloop.contacts.channels.update("chn_123456789", Map.of("name", "Marketing News", "description", "Internal marketing updates", "visibility", "private"));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using System.Net.Http;
using System.Net.Http.Json;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key", "re_123456789");

var update = new {
    name = "Marketing News",
    description = "Internal marketing updates",
    visibility = "private",
};

var response = await client.PatchAsJsonAsync(
    "https://reloop.sh/api/contacts/v1/channels/chn_123456789",
    update
);`,
	},
];
