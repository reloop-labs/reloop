export const updateContactXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { contact, contactError } = await reloop.contacts.update("con_123456789", { firstName: "Jane" });
if (contactError) throw contactError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/contacts/con_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"firstName": "Jane"}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.update("con_123456789", {
  "firstName": "Jane",
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

$contact = $reloop->contacts->update('con_123456789', [
    'firstName' => 'Jane',
]);`,
	},
			{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.ContactModels.UpdateContactParams;

ReloopClient reloop = new ReloopClient("rl_123456789");

UpdateContactParams params = new UpdateContactParams();
params.firstName = "Jane";
var contact = reloop.contacts.update("con_123456789", params);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.UpdateAsync("con_123456789", new Dictionary<string, object?> { ["firstName"] = "Jane" });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

contact, _ := client.Contacts.Update("con_123456789", map[string]interface{"firstName": "Jane"})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().update("con_123456789", UpdateContactParams { first_name: Some("Jane".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

contact = reloop.contacts.update("con_123456789", first_name: "Jane")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, contact} = Reloop.Services.Contacts.update(client, "con_123456789", %{first_name: "Jane"})`,
	},
];
