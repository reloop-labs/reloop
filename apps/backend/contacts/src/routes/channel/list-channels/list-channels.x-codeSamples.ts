export const listChannelsXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channels, channelError } = await reloop.contacts.channels.list({
  page: 1,
  limit: 10,
});

if (channelError) throw channelError;

console.log(channels.total, channels.channels);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/api/contacts/v1/channels/list?page=1&limit=10" \\
  -H "x-api-key: rl_123456789"`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.contacts.channels.list({
  "page": 1,
  "limit": 10,
})

if result.channel_error:
    raise result.channel_error

print(result.channels["total"], result.channels["channels"])`,
	},
			{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$channels = $reloop->contacts->channels->list([
    'page' => 1,
    'limit' => 10,
]);
echo $channels['total'] . ' ' . $channels['channels'] . PHP_EOL;`,
	},
			{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.ContactModels.ListChannelsParams;

ReloopClient reloop = new ReloopClient("rl_123456789");

ListChannelsParams params = new ListChannelsParams();
params.page = 1;
params.limit = 10;
var channels = reloop.contacts.channels.list(params);
System.out.println(channels.total + " " + channels.channels);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.ListAsync(new Dictionary<string, object?> { ["page"] = 1, ["limit"] = 10 });`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

channels, _ := client.Contacts.Channels.List(map[string]interface{}{"page": 1, "limit": 10})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().list(Some(ListChannelsParams { page: Some(1), limit: Some(10), ..Default::default() })).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

channels = reloop.contacts.channels.list(page: 1, limit: 10)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, channels} = Reloop.Services.ContactChannels.list(client, %{page: 1, limit: 10})`,
	},
];
