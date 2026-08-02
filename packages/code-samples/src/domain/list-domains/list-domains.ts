import type { CodeSample } from "../../types";

export const listDomainsXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domains, domainError } = await reloop.domain.list({
  page: 1,
  limit: 10,
  status: "active",
});

if (domainError) throw domainError;

console.log(domains.total, domains.domains);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/api/domain/v1/list?page=1&limit=10&status=active" \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.list({
  "page": 1,
  "limit": 10,
  "status": "active",
})

if result.domain_error:
    raise result.domain_error

print(result.domains["total"], result.domains["domains"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\\Reloop;

$reloop = Reloop::client('rl_123456789');

$domains = $reloop->domain->list([
    'page' => 1,
    'limit' => 10,
    'status' => 'active',
]);
echo $domains['total'] . ' ' . $domains['domains'] . PHP_EOL;`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

ListDomainsParams params = new ListDomainsParams();
params.page = 1;
params.limit = 10;
params.status = "active";
var domains = reloop.domain.list(params);
System.out.println(domains.total + " " + domains.domains);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var domains = await reloop.Domain.ListAsync(new ListDomainsParams
{
    Page = 1,
    Limit = 10,
    Status = "active",
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

domains, _ := client.Domain.List(&reloop.ListDomainsParams{
    Page: reloop.Int(1),
    Limit: reloop.Int(10),
    Status: reloop.DomainStatusActive,
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

    reloop.domain().list(Some(ListDomainsParams {
        page: Some(1),
        limit: Some(10),
        status: Some(DomainStatus::Active),
        ..Default::default()
    })).await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

domains = reloop.domain.list(page: 1, limit: 10, status: "active")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, domains} = Reloop.Services.Domain.list(client, %{page: 1, limit: 10, status: "active"})`,
	},
];
