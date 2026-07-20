export const addContactToChannelXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channel, channelError } = await reloop.contacts.channels.addContact(
  "chn_123456789",
  { contact_id: "con_123456789", subscription: "opt_in" },
);

if (channelError) throw channelError;

console.log(channel.subscriptionId, channel.contact.id);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/channel/chn_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"contact_id": "con_123456789","subscription": "opt_in"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.channels.add_contact("chn_123456789", contact_id="con_123456789", subscription="opt_in")`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->channels->addContact('chn_123456789', ['contact_id' => 'con_123456789', 'subscription' => 'opt_in']);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.addContact("chn_123456789", Map.of("contact_id", "con_123456789", "subscription", "opt_in"));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.AddContactAsync("chn_123456789", new Dictionary<string, object?> { ["contact_id"] = "con_123456789", ["subscription"] = "opt_in" });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Channels.AddContact("chn_123456789", map[string]interface{"contact_id": "con_123456789", "subscription": "opt_in"})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().add_contact("chn_123456789", AddContactToChannelParams { contact_id: Some("con_123456789".to_string()), subscription: Some("opt_in".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.channels.add_contact("chn_123456789", contact_id: "con_123456789", subscription: "opt_in")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, result} = Reloop.Services.ContactChannels.add_contact(client, "chn_123456789", %{contact_id: "con_123456789", subscription: "opt_in"})`,
	},
];
