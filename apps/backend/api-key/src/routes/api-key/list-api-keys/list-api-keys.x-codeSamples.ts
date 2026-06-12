export const listApiKeysXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({ key: "rl_123456789" });

const apiKeys = await reloop.apiKey.list({
  page: 1,
  limit: 10
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://api.reloop.sh/api-key/v1/?page=1&limit=10" \\
  -H "Authorization: Bearer rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.api_keys.list(
    page=1,
    limit=10
)`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop_email::ReloopEmail;
use serde_json::json;
use reloop_email::{CreateApiKeyParams, UpdateApiKeyParams, ApiKeyListParams};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("rl_123456789".to_string(), None);
    
    reloop.api_keys().list(Some(ApiKeyListParams {
            page: Some(1),
        limit: Some(10),
            ..Default::default()
        })).await?;

    Ok(())
}`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "rl_123456789",
    })
    
    _, _ = reloop.ApiKeys().List(&reloop.ApiKeyListParams{
        Page: reloop.Int(1),
    Limit: reloop.Int(10),
    })
}`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->apiKeys->list(
  options: [
    'page' => 1,
    'limit' => 10,
  ],
);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.email.ReloopEmail;
import sh.reloop.email.Models.*;

ReloopEmail reloop = ReloopEmail.client("rl_123456789");

reloop.apiKeys().list(new ApiKeyListParams(1, 10, null, null, null));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using Reloop.Email.Models;

var reloop = ReloopEmail.Client("rl_123456789");

await reloop.ApiKeys().ListAsync(new ApiKeyListParams
{
    Page = 1,
    Limit = 10,
});`,
	},
];
