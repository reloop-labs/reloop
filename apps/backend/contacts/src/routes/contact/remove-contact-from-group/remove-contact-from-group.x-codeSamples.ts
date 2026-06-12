const removeContactFromGroupBody = `{
  "contact_id": "cont_123456789"
}`;

export const removeContactFromGroupXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response, error } = await reloop.contacts().groups().removeContact('grp_123456789', {
  contact_id: 'cont_123456789',
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X DELETE https://reloop.sh/api/contacts/group/grp_123456789 \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${removeContactFromGroupBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->groups->removeContact(
  'grp_123456789',
  parameters: [
      'contact_id' => 'cont_123456789',
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().groups().remove_contact(
    "grp_123456789",
    contact_id="cont_123456789"
)`,
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

request = Net::HTTP::Delete.new(uri)
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
		source: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Groups.RemoveContact("grp_123456789", map[string]interface{}{
        "contact_id": "cont_123456789"
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
    
    reloop.contacts().groups().remove_contact("grp_123456789", json!({
        "contact_id": "cont_123456789",
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

reloop.contacts().groups().removeContact("grp_123456789", Map.of("contact_id", "cont_123456789"));`,
	},
		{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().Groups.RemoveContactAsync("grp_123456789", new Dictionary<string, object?>
{
    ["contact_id"] = "cont_123456789",
});`,
	},
];
