export const updatePropertyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { property, propertyError } = await reloop.contacts.properties.update(
  "prop_123456789",
  { fallbackValue: "N/A" },
);

if (propertyError) throw propertyError;

console.log(property.id, property.defaultValue);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/contacts/v1/properties/prop_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"fallbackValue": "N/A"}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.properties.update("prop_123456789", {
  "fallbackValue": "N/A",
})

if result.property_error:
    raise result.property_error

print(result.property["id"], result.property["defaultValue"])`,
	},
			{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$property = $reloop->contacts->properties->update('prop_123456789', [
    'fallbackValue' => 'N/A',
]);
echo $property['id'] . ' ' . $property['defaultValue'] . PHP_EOL;`,
	},
			{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.ContactModels.UpdatePropertyParams;

ReloopClient reloop = new ReloopClient("rl_123456789");

UpdatePropertyParams params = new UpdatePropertyParams();
params.fallbackValue = "N/A";
var property = reloop.contacts.properties.update("prop_123456789", params);
System.out.println(property.id + " " + property.defaultValue);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.UpdatePropertyAsync("prop_123456789", new Dictionary<string, object?> { ["fallbackValue"] = "N/A" });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

property, _ := client.Contacts.UpdateProperty("prop_123456789", map[string]interface{"fallbackValue": "N/A"})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().update_property("prop_123456789", UpdatePropertyParams { fallback_value: Some("N/A".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

property = reloop.contacts.update_property("prop_123456789", fallback_value: "N/A")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, property} = Reloop.Services.Contacts.update_property(client, "prop_123456789", %{fallback_value: "N/A"})`,
	},
];
