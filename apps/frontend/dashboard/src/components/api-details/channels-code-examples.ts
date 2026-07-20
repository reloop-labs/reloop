export const codeExamples = {
	nodejs: {
		add: {
			filename: "create_channel.js",
			code: `import { Reloop } from "reloop-email";

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
		get: {
			filename: "get_channel.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channel, channelError } = await reloop.contacts.channels.get(
  "chn_123456789",
);

if (channelError) throw channelError;

console.log(channel.id, channel.name);`,
		},
		list: {
			filename: "list_channels.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channels, channelError } = await reloop.contacts.channels.list({
  page: 1,
  limit: 10,
});

if (channelError) throw channelError;

console.log(channels.total, channels.channels);`,
		},
		update: {
			filename: "update_channel.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channel, channelError } = await reloop.contacts.channels.update(
  "chn_123456789",
  { name: "Marketing News" },
);

if (channelError) throw channelError;

console.log(channel.id, channel.name);`,
		},
		delete: {
			filename: "delete_channel.js",
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { channel, channelError } = await reloop.contacts.channels.delete(
  "chn_123456789",
);

if (channelError) throw channelError;

console.log(channel.id, channel.success);`,
		},
	},
	python: {
		add: {
			filename: "create_channel.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

channel = reloop.contacts.channels.create(
    name="Product Updates",
    description="Get the latest news about our products",
    default_subscription="opt_in",
    visibility="public",
)`,
		},
		get: {
			filename: "get_channel.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

channel = reloop.contacts.channels.get("chn_123456789")`,
		},
		list: {
			filename: "list_channels.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

channels = reloop.contacts.channels.list(page=1, limit=10)`,
		},
		update: {
			filename: "update_channel.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

channel = reloop.contacts.channels.update("chn_123456789", name="Marketing News")`,
		},
		delete: {
			filename: "delete_channel.py",
			code: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.channels.delete("chn_123456789")`,
		},
	},
	php: {
		add: {
			filename: "create_channel.php",
			code: `$reloop = Reloop::client('rl_123456789');

$channel = $reloop->contacts->channels->create([
    'name' => 'Product Updates',
    'description' => 'Get the latest news about our products',
    'default_subscription' => 'opt_in',
    'visibility' => 'public',
]);`,
		},
		get: {
			filename: "get_channel.php",
			code: `$reloop = Reloop::client('rl_123456789');

$channel = $reloop->contacts->channels->get('chn_123456789');`,
		},
		list: {
			filename: "list_channels.php",
			code: `$reloop = Reloop::client('rl_123456789');

$channels = $reloop->contacts->channels->list(['page' => 1, 'limit' => 10]);`,
		},
		update: {
			filename: "update_channel.php",
			code: `$reloop = Reloop::client('rl_123456789');

$channel = $reloop->contacts->channels->update('chn_123456789', ['name' => 'Marketing News']);`,
		},
		delete: {
			filename: "delete_channel.php",
			code: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->channels->delete('chn_123456789');`,
		},
	},
	go: {
		add: {
			filename: "create_channel.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

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
		get: {
			filename: "get_channel.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

channel, _ := client.Contacts.Channels.Get("chn_123456789")`,
		},
		list: {
			filename: "list_channels.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

channels, _ := client.Contacts.Channels.List(map[string]interface{}{"page": 1, "limit": 10})`,
		},
		update: {
			filename: "update_channel.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

channel, _ := client.Contacts.Channels.Update("chn_123456789", map[string]interface{"name": "Marketing News"})`,
		},
		delete: {
			filename: "delete_channel.go",
			code: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.Channels.Delete("chn_123456789")`,
		},
	},
	ruby: {
		add: {
			filename: "create_channel.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

channel = reloop.contacts.channels.create(
  name: "Product Updates",
  description: "Get the latest news about our products",
  default_subscription: "opt_in",
  visibility: "public",
)`,
		},
		get: {
			filename: "get_channel.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

channel = reloop.contacts.channels.get("chn_123456789")`,
		},
		list: {
			filename: "list_channels.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

channels = reloop.contacts.channels.list(page: 1, limit: 10)`,
		},
		update: {
			filename: "update_channel.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

channel = reloop.contacts.channels.update("chn_123456789", name: "Marketing News")`,
		},
		delete: {
			filename: "delete_channel.rb",
			code: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.channels.delete("chn_123456789")`,
		},
	},
	rust: {
		add: {
			filename: "create_channel.rs",
			code: `use reloop::ReloopClient;
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
		get: {
			filename: "get_channel.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().get("chn_123456789").await?;

    Ok(())
}`,
		},
		list: {
			filename: "list_channels.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().list(Some(ListChannelsParams { page: Some(1), limit: Some(10), ..Default::default() })).await?;

    Ok(())
}`,
		},
		update: {
			filename: "update_channel.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().update("chn_123456789", UpdateChannelParams { name: Some("Marketing News".to_string()), ..Default::default() }).await?;

    Ok(())
}`,
		},
		delete: {
			filename: "delete_channel.rs",
			code: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().channels().delete("chn_123456789").await?;

    Ok(())
}`,
		},
	},
	java: {
		add: {
			filename: "CreateChannel.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.create(Map.of(
    "name", "Product Updates",
    "description", "Get the latest news about our products",
    "defaultSubscription", "opt_in",
    "visibility", "public"
));`,
		},
		get: {
			filename: "GetChannel.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.get("chn_123456789");`,
		},
		list: {
			filename: "ListChannels.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.list(Map.of("page", 1, "limit", 10));`,
		},
		update: {
			filename: "UpdateChannel.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.update("chn_123456789", Map.of("name", "Marketing News"));`,
		},
		delete: {
			filename: "DeleteChannel.java",
			code: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.channels.delete("chn_123456789");`,
		},
	},
	dotnet: {
		add: {
			filename: "CreateChannel.cs",
			code: `using Reloop;
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
		get: {
			filename: "GetChannel.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.GetAsync("chn_123456789");`,
		},
		list: {
			filename: "ListChannels.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.ListAsync(new Dictionary<string, object?> { ["page"] = 1, ["limit"] = 10 });`,
		},
		update: {
			filename: "UpdateChannel.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.UpdateAsync("chn_123456789", new Dictionary<string, object?> { ["name"] = "Marketing News" });`,
		},
		delete: {
			filename: "DeleteChannel.cs",
			code: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.Channels.DeleteAsync("chn_123456789");`,
		},
	},
	curl: {
		add: {
			filename: "create_channel.sh",
			code: `curl -X POST https://reloop.sh/api/contacts/v1/channels/create \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"name": "Product Updates","description": "Get the latest news about our products","defaultSubscription": "opt_in","visibility": "public"}'`,
		},
		get: {
			filename: "get_channel.sh",
			code: `curl "https://reloop.sh/api/contacts/v1/channels/chn_123456789" \\\\
  -H "x-api-key: rl_123456789"`,
		},
		list: {
			filename: "list_channels.sh",
			code: `curl "https://reloop.sh/api/contacts/v1/channels/list?page=1&limit=10" \\\\
  -H "x-api-key: rl_123456789"`,
		},
		update: {
			filename: "update_channel.sh",
			code: `curl -X PATCH https://reloop.sh/api/contacts/v1/channels/chn_123456789 \\\\
  -H "x-api-key: rl_123456789" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"name": "Marketing News"}'`,
		},
		delete: {
			filename: "delete_channel.sh",
			code: `curl -X DELETE https://reloop.sh/api/contacts/v1/channels/chn_123456789 \\\\
  -H "x-api-key: rl_123456789"`,
		},
	},
};
