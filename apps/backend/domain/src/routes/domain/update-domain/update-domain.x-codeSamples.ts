export const updateDomainXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domain, domainError } = await reloop.domain.update("dom_123456789", {
  click_tracking: false,
  open_tracking: true,
  sending_email: true,
});

if (domainError) throw domainError;

console.log(domain.id, domain.isClickTrackingEnabled);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/domain/v1/dom_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"click_tracking": false}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.update("dom_123456789", {
  "click_tracking": False,
  "open_tracking": True,
  "sending_email": True,
})

if result.domain_error:
    raise result.domain_error

print(result.domain["id"], result.domain["isClickTrackingEnabled"])`,
	},
			{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$domain = $reloop->domain->update('dom_123456789', [
    'click_tracking' => false,
    'open_tracking' => true,
    'sending_email' => true,
]);
echo $domain['id'] . ' ' . $domain['isClickTrackingEnabled'] . PHP_EOL;`,
	},
			{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.DomainModels.UpdateDomainParams;

ReloopClient reloop = new ReloopClient("rl_123456789");

UpdateDomainParams params = new UpdateDomainParams();
params.clickTracking = false;
params.openTracking = true;
params.sendingEmail = true;
var domain = reloop.domain.update("dom_123456789", params);
System.out.println(domain.id + " " + domain.isClickTrackingEnabled);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var domain = await reloop.Domain.UpdateAsync("dom_123456789", new UpdateDomainParams
{
    ClickTracking = false,
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

domain, _ := client.Domain.Update("dom_123456789", reloop.UpdateDomainParams{
    ClickTracking: reloop.Bool(false),
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

    reloop.domain().update("dom_123456789", UpdateDomainParams {
        click_tracking: Some(false),
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

domain = reloop.domain.update("dom_123456789", click_tracking: false)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, domain} = Reloop.Services.Domain.update(client, "dom_123456789", %{click_tracking: false})`,
	},
];
