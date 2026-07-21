export const listContactsXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { contacts, contactError } = await reloop.contacts.list({
  page: 1,
  limit: 10,
  status: "subscribed",
});
if (contactError) throw contactError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/api/contacts/list?page=1&limit=10&status=subscribed" \\
  -H "x-api-key: rl_123456789"`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.list({
  "page": 1,
  "limit": 10,
  "status": "subscribed",
})
if result.contact_error:
    raise result.contact_error`,
	},
			{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$contacts = $reloop->contacts->list([
    'page' => 1,
    'limit' => 10,
    'status' => 'subscribed',
]);`,
	},
			{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.ContactModels.ListContactsParams;

ReloopClient reloop = new ReloopClient("rl_123456789");

ListContactsParams params = new ListContactsParams();
params.page = 1;
params.limit = 10;
params.status = "subscribed";
var contacts = reloop.contacts.list(params);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var contacts = await reloop.Contacts.ListAsync(new Dictionary<string, object?>
{
    ["page"] = 1,
    ["limit"] = 10,
    ["status"] = "subscribed",
});`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

contacts, _ := client.Contacts.List(map[string]interface{}{
    "page": 1,
    "limit": 10,
    "status": "subscribed",
})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().list(Some(ListContactsParams {
        page: Some(1),
        limit: Some(10),
        status: Some(ContactStatus::Subscribed),
        ..Default::default()
    })).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

contacts = reloop.contacts.list(page: 1, limit: 10, status: "subscribed")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, contacts} = Reloop.Services.Contacts.list(client, %{page: 1, limit: 10, status: "subscribed"})`,
	},
];
