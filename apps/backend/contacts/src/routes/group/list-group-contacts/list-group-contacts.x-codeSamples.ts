export const listGroupContactsXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { response: contacts, error } = await reloop.contacts().groups().listContacts('grp_123456789', {
  page: 1,
  limit: 10,
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/api/contacts/v1/groups/grp_123456789/contacts?page=1&limit=10" \\
  -H "x-api-key: re_123456789"`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->groups->listContacts(
  'grp_123456789',
  options: [
      'page' => 1,
      'limit' => 10,
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().groups().list_contacts(
    "grp_123456789",
    page=1,
    limit=10,
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/groups/grp_123456789/contacts')
uri.query = URI.encode_www_form(page: 1, limit: 10)
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Get.new(uri)
request['x-api-key'] = 're_123456789'

response = http.request(request)
contacts = JSON.parse(response.body)`,
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
    
    _, _ = reloop.Contacts().Groups.ListContacts("grp_123456789", map[string]interface{}{
        "page": 1,
        "limit": 10
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
    
    reloop.contacts().groups().list_contacts("grp_123456789", json!({
        "page": 1,
        "limit": 10,
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

reloop.contacts().groups().listContacts("grp_123456789", Map.of("page", 1, "limit", 10));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

await reloop.Contacts().Groups.ListContactsAsync("grp_123456789", new Dictionary<string, object?>
{
    ["page"] = 1,
    ["limit"] = 10,
});`,
	},
];
