export const updateApiKeyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop("rl_123456789");

const apiKey = await reloop.apiKey.update("key_123456789", {
  name: "Updated production key",
  enabled: true
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://api.reloop.sh/api-key/v1/key_123456789 \\
  -H "Authorization: Bearer rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated production key",
    "enabled": true
  }'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.api_keys.update(
    "key_123456789",
    name="Updated production key",
    enabled=True
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
    
    reloop.api_keys().update("key_123456789", UpdateApiKeyParams {
            name: Some("Updated production key".to_string()),
        enabled: Some(true),
        }).await?;

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
    
    _, _ = reloop.ApiKeys().Update("key_123456789", reloop.UpdateApiKeyParams{
        Name: "Updated production key",
        Enabled: reloop.Bool(true)
    })
}`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->apiKeys->update(
  'key_123456789',
  parameters: [
    'name' => 'Updated production key',
    'enabled' => true,
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

reloop.apiKeys().update("key_123456789", new UpdateApiKeyParams("Updated production key", true));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using Reloop.Email.Models;

var reloop = ReloopEmail.Client("rl_123456789");

await reloop.ApiKeys().UpdateAsync("key_123456789", new UpdateApiKeyParams
{
    Name = "Updated production key",
    Enabled = true,
});`,
	},
];
