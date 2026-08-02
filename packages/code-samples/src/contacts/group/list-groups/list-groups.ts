import type { CodeSample } from "../../../types";

export const listGroupsXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { groups, groupError } = await reloop.contacts.groups.list({
  page: 1,
  limit: 10,
});

if (groupError) throw groupError;

console.log(groups.total, groups.groups);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/api/contacts/v1/groups/list?page=1&limit=10" \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.groups.list({
  "page": 1,
  "limit": 10,
})

if result.group_error:
    raise result.group_error

print(result.groups["total"], result.groups["groups"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\\Reloop;

$reloop = Reloop::client('rl_123456789');

$groups = $reloop->contacts->groups->list([
    'page' => 1,
    'limit' => 10,
]);
echo $groups['total'] . ' ' . $groups['groups'] . PHP_EOL;`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

ListGroupsParams params = new ListGroupsParams();
params.page = 1;
params.limit = 10;
var groups = reloop.contacts.groups.list(params);
System.out.println(groups.total + " " + groups.groups);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.ListGroupsAsync(new Dictionary<string, object?> { ["page"] = 1, ["limit"] = 10 });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

groups, _ := client.Contacts.ListGroups(map[string]interface{}{"page": 1, "limit": 10})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().list_groups(Some(ListGroupsParams { page: Some(1), limit: Some(10), ..Default::default() })).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

groups = reloop.contacts.list_groups(page: 1, limit: 10)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, groups} = Reloop.Services.Contacts.list_groups(client, %{page: 1, limit: 10})`,
	},
];
