import type { CodeSample } from "../../../types";

export const createGroupXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { group, groupError } = await reloop.contacts.groups.create({
  name: "Beta Testers",
});

if (groupError) throw groupError;

console.log(group.id, group.name);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/v1/groups/create \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Beta Testers"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.groups.create({
  "name": "Beta Testers",
})

if result.group_error:
    raise result.group_error

print(result.group["id"], result.group["name"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\\Reloop;

$reloop = Reloop::client('rl_123456789');

$group = $reloop->contacts->groups->create([
    'name' => 'Beta Testers',
]);
echo $group['id'] . ' ' . $group['name'] . PHP_EOL;`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

CreateGroupParams params = new CreateGroupParams();
params.name = "Beta Testers";
var group = reloop.contacts.groups.create(params);
System.out.println(group.id + " " + group.name);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.CreateGroupAsync(new Dictionary<string, object?> { ["name"] = "Beta Testers" });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

group, _ := client.Contacts.CreateGroup(map[string]interface{}{"name": "Beta Testers"})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().create_group(CreateGroupParams { name: "Beta Testers".to_string() }).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

group = reloop.contacts.create_group(name: "Beta Testers")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, group} = Reloop.Services.Contacts.create_group(client, %{name: "Beta Testers"})`,
	},
];
