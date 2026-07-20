export const createContactXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { contact, contactError } = await reloop.contacts.create({
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  status: "subscribed",
  properties: { company: "Reloop", role: "Developer" },
  groupIds: ["grp_123456789"],
  channels: [{ channelId: "chn_123456789", subscription: "opt_in" }],
});
if (contactError) throw contactError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/create \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "john.doe@example.com","firstName": "John","lastName": "Doe","status": "subscribed","properties": {"company": "Reloop","role": "Developer"},"groupIds": ["grp_123456789"],"channels": [{"channelId": "chn_123456789","subscription": "opt_in"}]}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

contact = reloop.contacts.create(
    email="john.doe@example.com",
    first_name="John",
    last_name="Doe",
    status="subscribed",
    properties={"company": "Reloop", "role": "Developer"},
    group_ids=["grp_123456789"],
    channels=[{"channel_id": "chn_123456789", "subscription": "opt_in"}],
)`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$contact = $reloop->contacts->create([
    'email' => 'john.doe@example.com',
    'first_name' => 'John',
    'last_name' => 'Doe',
    'status' => 'subscribed',
    'properties' => ['company' => 'Reloop', 'role' => 'Developer'],
    'group_ids' => ['grp_123456789'],
    'channels' => [['channel_id' => 'chn_123456789', 'subscription' => 'opt_in']],
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

Contact contact = reloop.contacts.create(Map.of(
    "email", "john.doe@example.com",
    "firstName", "John",
    "lastName", "Doe",
    "status", "subscribed"
));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var contact = await reloop.Contacts.CreateAsync(new Dictionary<string, object?>
{
    ["email"] = "john.doe@example.com",
    ["firstName"] = "John",
    ["lastName"] = "Doe",
    ["status"] = "subscribed",
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

contact, _ := client.Contacts.Create(map[string]interface{}{
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "subscribed",
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

    reloop.contacts().create(CreateContactParams {
        email: "john.doe@example.com".to_string(),
        first_name: Some("John".to_string()),
        last_name: Some("Doe".to_string()),
        status: Some(ContactStatus::Subscribed),
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

contact = reloop.contacts.create(
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  status: "subscribed",
  properties: { company: "Reloop", role: "Developer" },
  group_ids: ["grp_123456789"],
  channels: [{ channel_id: "chn_123456789", subscription: "opt_in" }],
)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, contact} = Reloop.Services.Contacts.create(client, %{
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  status: "subscribed",
  properties: %{company: "Reloop", role: "Developer"},
  group_ids: ["grp_123456789"],
  channels: [%{channel_id: "chn_123456789", subscription: "opt_in"}]
})`,
	},
];
