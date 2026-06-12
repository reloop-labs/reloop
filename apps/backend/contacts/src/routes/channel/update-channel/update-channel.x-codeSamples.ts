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

const { response: channel, error } = await reloop.contacts().channels().update('chn_123456789', {
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
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().channels().update(
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
		source: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Channels.Update("chn_123456789", map[string]interface{}{
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
		source: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("re_123456789".to_string(), None);
    
    reloop.contacts().channels().update("chn_123456789", json!({
        "name": "Marketing News",
        "description": "Internal marketing updates",
        "visibility": "private",
    })).await?;

    Ok(())
}`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.email.ReloopEmail;
import java.util.*;

ReloopEmail reloop = ReloopEmail.client("re_123456789");

reloop.contacts().channels().update("chn_123456789", Map.of("name", "Marketing News", "description", "Internal marketing updates", "visibility", "private"));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().Channels.UpdateAsync("chn_123456789", new Dictionary<string, object?>
{
    ["name"] = "Marketing News",
    ["description"] = "Internal marketing updates",
    ["visibility"] = "private",
});`,
	},
];
