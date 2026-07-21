export const updateApiKeyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.update("key_123456789", {
  name: "Updated Key Name",
});

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.name);`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/api-key/v1/key_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Updated Key Name"}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.update("key_123456789", {
  "name": "Updated Key Name",
})

if result.api_key_error:
    raise result.api_key_error

print(result.api_key["id"], result.api_key["name"])`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKeys->update('key_123456789', ['name' => 'Updated Key Name']);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

ApiKey apiKey = reloop.apiKeys.update("key_123456789", new UpdateApiKeyParams("Updated Key Name"));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var apiKey = await reloop.ApiKeys.UpdateAsync("key_123456789", new UpdateApiKeyParams(Name: "Updated Key Name"));`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

apiKey, _ := client.ApiKeys.Update("key_123456789", reloop.UpdateApiKeyParams{
    Name: "Updated Key Name",
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

    reloop.api_keys().update("key_123456789", UpdateApiKeyParams {
        name: "Updated Key Name".to_string(),
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

api_key = reloop.api_keys.update("key_123456789", name: "Updated Key Name")`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, api_key} = Reloop.Services.ApiKey.update(client, "key_123456789", %{name: "Updated Key Name"})`,
	},
];
