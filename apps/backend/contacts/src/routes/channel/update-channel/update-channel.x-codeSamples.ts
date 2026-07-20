export const updateChannelXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channel, channelError } = await reloop.contacts.channels.update(
  "chn_123456789",
  { name: "Marketing News" },
);

if (channelError) throw channelError;

console.log(channel.id, channel.name);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/contacts/v1/channels/chn_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Marketing News"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

channel = reloop.contacts.channels.update("chn_123456789", name="Marketing News")`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$channel = $reloop->contacts->channels->update('chn_123456789', ['name' => 'Marketing News']);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.update("chn_123456789", Map.of("name", "Marketing News"));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.UpdateAsync("chn_123456789", new Dictionary<string, object?> { ["name"] = "Marketing News" });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

channel, _ := client.Contacts.Channels.Update("chn_123456789", map[string]interface{"name": "Marketing News"})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().update("chn_123456789", UpdateChannelParams { name: Some("Marketing News".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

channel = reloop.contacts.channels.update("chn_123456789", name: "Marketing News")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, channel} = Reloop.Services.ContactChannels.update(client, "chn_123456789", %{name: "Marketing News"})`,
	},
];
