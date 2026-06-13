export const listApiKeysXCodeSamples = [
  {
    id: "node",
    lang: "javascript",
    label: "Node.js",
    source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response: apiKeys, error } = await reloop.apiKey.list({ page: 1, limit: 10 });
if (error) throw error;`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl "https://reloop.sh/api/api-key/v1/?page=1&limit=10" \\
  -H "x-api-key: rl_123456789"`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

api_keys = reloop.api_keys.list(page=1, limit=10)`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `$reloop = Reloop::client('rl_123456789');

$apiKeys = $reloop->apiKeys->list(['page' => 1, 'limit' => 10]);`,
  },
  {
    id: "java",
    lang: "java",
    label: "Java",
    source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

ApiKeyListResponse apiKeys = reloop.apiKeys.list(new ApiKeyListParams(1, 10, null, null, null));`,
  },
  {
    id: "dotnet",
    lang: "csharp",
    label: ".NET",
    source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var apiKeys = await reloop.ApiKeys.ListAsync(new ApiKeyListParams
{
    Page = 1,
    Limit = 10,
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

apiKeys, _ := client.ApiKeys.List(&reloop.ApiKeyListParams{
    Page: reloop.Int(1),
    Limit: reloop.Int(10),
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

    reloop.api_keys().list(Some(ApiKeyListParams {
        page: Some(1),
        limit: Some(10),
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

api_keys = reloop.api_keys.list(page: 1, limit: 10)`,
  },
  {
    id: "elixir",
    lang: "elixir",
    label: "Elixir",
    source: `client = Reloop.client("rl_123456789")

{:ok, api_keys} = Reloop.Services.ApiKey.list(client, %{page: 1, limit: 10})`,
  }
];
