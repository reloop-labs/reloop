const updateContactBody = `{
  "firstName": "Jane",
  "lastName": "Smith",
  "status": "subscribed",
  "properties": {
    "company": "Reloop",
    "role": "Designer"
  }
}`;

export const updateContactXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response: contact, error } = await reloop.contacts().update('cont_123456789', {
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Designer',
  },
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/contacts/cont_123456789 \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${updateContactBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->update(
  'cont_123456789',
  parameters: [
      'first_name' => 'Jane',
      'last_name' => 'Smith',
      'unsubscribed' => false,
      'properties' => [
          'company' => 'Reloop',
          'role' => 'Designer',
      ],
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().update(
    "cont_123456789",
    first_name="Jane",
    last_name="Smith",
    unsubscribed=False,
    properties={
        "company": "Reloop",
        "role": "Designer",
    },
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/cont_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Designer',
  },
}.to_json

response = http.request(request)
contact = JSON.parse(response.body)`,
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
    
    _, _ = reloop.Contacts().Update("cont_123456789", map[string]interface{}{
        "first_name": "Jane",
        "last_name": "Smith",
        "unsubscribed": false,
        "properties": map[string]interface{}{"company": "Reloop", "role": "Designer"}
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
    
    reloop.contacts().update("cont_123456789", json!({
        "first_name": "Jane",
        "last_name": "Smith",
        "unsubscribed": false,
        "properties": {
        "company": "Reloop",
        "role": "Designer",
    },
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

reloop.contacts().update("cont_123456789", Map.of("first_name", "Jane", "last_name", "Smith", "unsubscribed", false, "properties", Map.of("company", "Reloop", "role", "Designer")));`,
	},
		{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

var parameters = new Dictionary<string, object?>();
parameters["first_name"] = "Jane";
parameters["last_name"] = "Smith";
parameters["unsubscribed"] = false;
parameters["properties"] = new Dictionary<string, object?>
{
    ["company"] = "Reloop",
    ["role"] = "Designer",
};
await reloop.Contacts().UpdateAsync("cont_123456789", parameters);`,
	},
];
