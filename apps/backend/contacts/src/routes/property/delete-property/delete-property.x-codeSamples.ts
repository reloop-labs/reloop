export const deletePropertyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { property, propertyError } = await reloop.contacts.properties.delete(
  "prop_123456789",
);

if (propertyError) throw propertyError;

console.log(property.id, property.success);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X DELETE https://reloop.sh/api/contacts/v1/properties/prop_123456789 \\
  -H "x-api-key: rl_123456789"`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.properties.delete("prop_123456789")

if result.property_error:
    raise result.property_error

print(result.property["id"], result.property["success"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->deleteProperty('prop_123456789');`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.deleteProperty("prop_123456789");`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.DeletePropertyAsync("prop_123456789");`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.DeleteProperty("prop_123456789")`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().delete_property("prop_123456789").await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.delete_property("prop_123456789")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, result} = Reloop.Services.Contacts.delete_property(client, "prop_123456789")`,
	},
];
