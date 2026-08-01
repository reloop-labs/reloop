import type { CodeSample } from "../../types";

export const deleteDomainXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { domain, domainError } = await reloop.domain.delete("dom_123456789");

if (domainError) throw domainError;

console.log(domain.id);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X DELETE https://reloop.sh/api/domain/v1/dom_123456789 \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.domain.delete("dom_123456789")

if result.domain_error:
    raise result.domain_error

print(result.domain["id"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use ReloopReloop;

$reloop = Reloop::client('rl_123456789');

$domain = $reloop->domain->delete('dom_123456789');
echo $domain['id'] . PHP_EOL;`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;

ReloopClient reloop = new ReloopClient("rl_123456789");

var domain = reloop.domain.delete("dom_123456789");
System.out.println(domain.id);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var result = await reloop.Domain.DeleteAsync("dom_123456789");`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

result, _ := client.Domain.Delete("dom_123456789")`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.domain().delete("dom_123456789").await?;

    Ok(())
}`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

result = reloop.domain.delete("dom_123456789")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, result} = Reloop.Services.Domain.delete(client, "dom_123456789")`,
	},
];
