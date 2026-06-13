const createChannelBody = `{
  "name": "Product Updates",
  "description": "Get the latest news about our products",
  "defaultSubscription": "opt_in",
  "visibility": "public"
}`;

export const createChannelXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { response: channel, error } = await reloop.contacts().channels().create({
  name: 'Product Updates',
  description: 'Get the latest news about our products',
  defaultSubscription: 'opt_in',
  visibility: 'public',
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/v1/channels/create \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${createChannelBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->channels->create(
  parameters: [
      'name' => 'Product Updates',
      'description' => 'Get the latest news about our products',
      'default_subscription' => 'opt_in',
      'visibility' => 'public',
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().channels().create(
    name="Product Updates",
    description="Get the latest news about our products",
    default_subscription="opt_in",
    visibility="public"
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/channels/create')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  name: 'Product Updates',
  description: 'Get the latest news about our products',
  defaultSubscription: 'opt_in',
  visibility: 'public',
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
    
    _, _ = reloop.Contacts().Channels.Create(map[string]interface{}{
        "name": "Product Updates",
        "description": "Get the latest news about our products",
        "default_subscription": "opt_in",
        "visibility": "public"
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
    
    reloop.contacts().channels().create(json!({
        "name": "Product Updates",
        "description": "Get the latest news about our products",
        "default_subscription": "opt_in",
        "visibility": "public",
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

reloop.contacts().channels().create(Map.of("name", "Product Updates", "description", "Get the latest news about our products", "default_subscription", "opt_in", "visibility", "public"));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().Channels.CreateAsync(new Dictionary<string, object?>
{
    ["name"] = "Product Updates",
    ["description"] = "Get the latest news about our products",
    ["default_subscription"] = "opt_in",
    ["visibility"] = "public",
});`,
	},
];
