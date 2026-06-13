export const updateContactChannelXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response, error } = await reloop.contacts.channels.updateSubscription("chn_123456789", {
  contact_id: "con_123456789",
  subscription: "opt_out",
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/contacts/channel/chn_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"contact_id": "con_123456789","subscription": "opt_out"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.channels.update_subscription("chn_123456789", contact_id="con_123456789", subscription="opt_out")`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->channels->updateSubscription('chn_123456789', ['contact_id' => 'con_123456789', 'subscription' => 'opt_out']);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.updateSubscription("chn_123456789", Map.of("contact_id", "con_123456789", "subscription", "opt_out"));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.UpdateSubscriptionAsync("chn_123456789", new Dictionary<string, object?> { ["contact_id"] = "con_123456789", ["subscription"] = "opt_out" });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Channels.UpdateSubscription("chn_123456789", map[string]interface{"contact_id": "con_123456789", "subscription": "opt_out"})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().update_subscription("chn_123456789", UpdateContactChannelParams { contact_id: Some("con_123456789".to_string()), subscription: "opt_out".to_string(), ..Default::default() }).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.channels.update_subscription("chn_123456789", contact_id: "con_123456789", subscription: "opt_out")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, result} = Reloop.Services.ContactChannels.update_subscription(client, "chn_123456789", %{contact_id: "con_123456789", subscription: "opt_out"})`,
	},
];
