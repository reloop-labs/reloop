export const createDomainXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: domain, error } = await reloop.domain.create({
  domain: "send.example.com",
  click_tracking: true,
  open_tracking: true,
  tls: "opportunistic",
  sending_email: true,
  receiving_email: false,
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/domain/v1/create \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "send.example.com","click_tracking": true,"open_tracking": true,"tls": "opportunistic","sending_email": true,"receiving_email": false}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

domain = reloop.domain.create(
    domain="send.example.com",
    click_tracking=True,
    open_tracking=True,
    tls="opportunistic",
    sending_email=True,
    receiving_email=False,
)`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$domain = $reloop->domain->create([
    'domain' => 'send.example.com',
    'click_tracking' => true,
    'open_tracking' => true,
    'tls' => 'opportunistic',
    'sending_email' => true,
    'receiving_email' => false,
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

Domain domain = reloop.domain.create(
    new CreateDomainParams(
        "send.example.com",
        true,
        true,
        "opportunistic",
        true,
        false
    )
);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var domain = await reloop.Domain.CreateAsync(new CreateDomainParams(
    Domain: "send.example.com",
    ClickTracking: true,
    OpenTracking: true,
    Tls: "opportunistic",
    SendingEmail: true,
    ReceivingEmail: false
));`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

domain, _ := client.Domain.Create(reloop.CreateDomainParams{
    Domain: "send.example.com",
    ClickTracking: reloop.Bool(true),
    OpenTracking: reloop.Bool(true),
    Tls: reloop.String("opportunistic"),
    SendingEmail: reloop.Bool(true),
    ReceivingEmail: reloop.Bool(false),
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

    reloop.domain().create(CreateDomainParams {
        domain: "send.example.com".to_string(),
        click_tracking: Some(true),
        open_tracking: Some(true),
        tls: Some("opportunistic".to_string()),
        sending_email: Some(true),
        receiving_email: Some(false),
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

domain = reloop.domain.create(
  domain: "send.example.com",
  click_tracking: true,
  open_tracking: true,
  tls: "opportunistic",
  sending_email: true,
  receiving_email: false,
)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, domain} = Reloop.Services.Domain.create(client, %{
  domain: "send.example.com",
  click_tracking: true,
  open_tracking: true,
  tls: "opportunistic",
  sending_email: true,
  receiving_email: false
})`,
	},
];
