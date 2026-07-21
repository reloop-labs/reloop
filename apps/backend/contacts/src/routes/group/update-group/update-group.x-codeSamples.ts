export const updateGroupXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { group, groupError } = await reloop.contacts.groups.update(
  "grp_123456789",
  { name: "Loyal Customers" },
);

if (groupError) throw groupError;

console.log(group.id, group.name);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/contacts/v1/groups/grp_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Loyal Customers"}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.groups.update("grp_123456789", {
  "name": "Loyal Customers",
})

if result.group_error:
    raise result.group_error

print(result.group["id"], result.group["name"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$group = $reloop->contacts->updateGroup('grp_123456789', ['name' => 'Loyal Customers']);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.updateGroup("grp_123456789", Map.of("name", "Loyal Customers"));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.UpdateGroupAsync("grp_123456789", new Dictionary<string, object?> { ["name"] = "Loyal Customers" });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

group, _ := client.Contacts.UpdateGroup("grp_123456789", map[string]interface{"name": "Loyal Customers"})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().update_group("grp_123456789", UpdateGroupParams { name: "Loyal Customers".to_string() }).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

group = reloop.contacts.update_group("grp_123456789", name: "Loyal Customers")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, group} = Reloop.Services.Contacts.update_group(client, "grp_123456789", %{name: "Loyal Customers"})`,
	},
];
