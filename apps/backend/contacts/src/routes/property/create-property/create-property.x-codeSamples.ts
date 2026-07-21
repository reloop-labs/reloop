export const createPropertyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { property, propertyError } = await reloop.contacts.properties.create({
  name: "company_name",
  type: "string",
  fallbackValue: "Unknown",
});

if (propertyError) throw propertyError;

console.log(property.id, property.propertyName);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/v1/properties/create \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "company_name","type": "string","fallbackValue": "Unknown"}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.properties.create({
  "name": "company_name",
  "type": "string",
  "fallbackValue": "Unknown",
})

if result.property_error:
    raise result.property_error

print(result.property["id"], result.property["propertyName"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$property = $reloop->contacts->createProperty([
    'name' => 'company_name',
    'type' => 'string',
    'fallback_value' => 'Unknown',
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.createProperty(Map.of(
    "name", "company_name",
    "type", "string",
    "fallbackValue", "Unknown"
));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.CreatePropertyAsync(new Dictionary<string, object?>
{
    ["name"] = "company_name",
    ["type"] = "string",
    ["fallbackValue"] = "Unknown",
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

property, _ := client.Contacts.CreateProperty(map[string]interface{}{
    "name": "company_name",
    "type": "string",
    "fallbackValue": "Unknown",
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

    reloop.contacts().create_property(CreatePropertyParams {
        name: "company_name".to_string(),
        property_type: PropertyType::String,
        fallback_value: Some("Unknown".to_string()),
        ..Default::default()
    }).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

property = reloop.contacts.create_property(
  name: "company_name",
  type: "string",
  fallback_value: "Unknown",
)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, property} = Reloop.Services.Contacts.create_property(client, %{
  name: "company_name",
  type: "string",
  fallback_value: "Unknown"
})`,
	},
];
