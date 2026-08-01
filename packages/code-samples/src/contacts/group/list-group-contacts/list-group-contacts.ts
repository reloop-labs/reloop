import type { CodeSample } from "../../../types";

export const listGroupContactsXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { contacts, groupError } = await reloop.contacts.groups.listContacts(
  "grp_123456789",
  { page: 1, limit: 10 },
);

if (groupError) throw groupError;

console.log(contacts.total, contacts.contacts);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/api/contacts/v1/groups/grp_123456789/contacts?page=1&limit=10" \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.groups.listContacts("grp_123456789", {
  "page": 1,
  "limit": 10,
})

if result.group_error:
    raise result.group_error

print(result.contacts["total"], result.contacts["contacts"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use ReloopReloop;

$reloop = Reloop::client('rl_123456789');

$contacts = $reloop->contacts->groups->listContacts('grp_123456789', [
    'page' => 1,
    'limit' => 10,
]);
echo $contacts['total'] . ' ' . $contacts['contacts'] . PHP_EOL;`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

ListGroupContactsParams params = new ListGroupContactsParams();
params.page = 1;
params.limit = 10;
var contacts = reloop.contacts.groups.listContacts("grp_123456789", params);
System.out.println(contacts.total + " " + contacts.contacts);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Groups.ListContactsAsync("grp_123456789", new Dictionary<string, object?> { ["page"] = 1, ["limit"] = 10 });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Groups.ListContacts("grp_123456789", map[string]interface{"page": 1, "limit": 10})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().groups().list_contacts("grp_123456789", Some(ListContactsParams { page: Some(1), limit: Some(10), ..Default::default() })).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.groups.list_contacts("grp_123456789", page: 1, limit: 10)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, result} = Reloop.Services.ContactGroups.list_contacts(client, "grp_123456789", %{page: 1, limit: 10})`,
	},
];
