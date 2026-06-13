export const createApiKeyXCodeSamples = [
  {
    id: "node",
    lang: "javascript",
    label: "Node.js",
    source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: apiKey, error } = await reloop.apiKey.create({ name: "Production Key" });
if (error) throw error;`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl -X POST https://reloop.sh/api/api-key/v1/ \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Production Key"}'`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

api_key = reloop.api_keys.create(name="Production Key")`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKeys->create(['name' => 'Production Key']);`,
  },
  {
    id: "java",
    lang: "java",
    label: "Java",
    source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

ApiKeyWithKey apiKey = reloop.apiKeys.create(new CreateApiKeyParams("Production Key"));`,
  },
  {
    id: "dotnet",
    lang: "csharp",
    label: ".NET",
    source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var apiKey = await reloop.ApiKeys.CreateAsync(new CreateApiKeyParams(Name: "Production Key"));`,
  },
  {
    id: "go",
    lang: "go",
    label: "Go",
    source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

apiKey, _ := client.ApiKeys.Create(reloop.CreateApiKeyParams{
    Name: "Production Key",
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

    reloop.api_keys().create(CreateApiKeyParams {
        name: "Production Key".to_string(),
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

api_key = reloop.api_keys.create(name: "Production Key")`,
  },
  {
    id: "elixir",
    lang: "elixir",
    label: "Elixir",
    source: `client = Reloop.client("rl_123456789")

{:ok, api_key} = Reloop.Services.ApiKey.create(client, %{name: "Production Key"})`,
  }
];
