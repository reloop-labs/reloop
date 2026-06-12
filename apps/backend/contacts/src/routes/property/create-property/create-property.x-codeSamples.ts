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

const { response: property, error } = await reloop.contacts().createProperty({
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
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().create_property(
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
		source: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().CreateProperty(map[string]interface{}{
        "name": "company_name",
        "type": "string",
        "fallback_value": "Unknown"
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
    
    reloop.contacts().create_property(json!({
        "name": "company_name",
        "type": "string",
        "fallback_value": "Unknown",
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

reloop.contacts().createProperty(Map.of("name", "company_name", "type", "string", "fallback_value", "Unknown"));`,
	},
		{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().CreatePropertyAsync(new Dictionary<string, object?>
{
    ["name"] = "company_name",
    ["type"] = "string",
    ["fallback_value"] = "Unknown",
});`,
	},
];
