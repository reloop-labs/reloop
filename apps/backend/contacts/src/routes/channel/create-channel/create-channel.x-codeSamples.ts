export const createChannelXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channel, channelError } = await reloop.contacts.channels.create({
  name: "Product Updates",
  description: "Get the latest news about our products",
  defaultSubscription: "opt_in",
  visibility: "public",
});

if (channelError) throw channelError;

console.log(channel.id, channel.name);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/v1/channels/create \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Product Updates","description": "Get the latest news about our products","defaultSubscription": "opt_in","visibility": "public"}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.channels.create({
  "name": "Product Updates",
  "description": "Get the latest news about our products",
  "defaultSubscription": "opt_in",
  "visibility": "public",
})

if result.channel_error:
    raise result.channel_error

print(result.channel["id"], result.channel["name"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$channel = $reloop->contacts->channels->create([
    'name' => 'Product Updates',
    'description' => 'Get the latest news about our products',
    'default_subscription' => 'opt_in',
    'visibility' => 'public',
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.create(Map.of(
    "name", "Product Updates",
    "description", "Get the latest news about our products",
    "defaultSubscription", "opt_in",
    "visibility", "public"
));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.CreateAsync(new Dictionary<string, object?>
{
    ["name"] = "Product Updates",
    ["description"] = "Get the latest news about our products",
    ["defaultSubscription"] = "opt_in",
    ["visibility"] = "public",
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

channel, _ := client.Contacts.Channels.Create(map[string]interface{}{
    "name": "Product Updates",
    "description": "Get the latest news about our products",
    "defaultSubscription": "opt_in",
    "visibility": "public",
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

    reloop.contacts().channels().create(CreateChannelParams {
        name: "Product Updates".to_string(),
        description: Some("Get the latest news about our products".to_string()),
        default_subscription: Some("opt_in".to_string()),
        visibility: Some(ChannelVisibility::Public),
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

channel = reloop.contacts.channels.create(
  name: "Product Updates",
  description: "Get the latest news about our products",
  default_subscription: "opt_in",
  visibility: "public",
)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, channel} = Reloop.Services.ContactChannels.create(client, %{
  name: "Product Updates",
  description: "Get the latest news about our products",
  default_subscription: "opt_in",
  visibility: "public"
})`,
	},
];
