export const deleteApiKeyXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop("rl_123456789");

const result = await reloop.apiKey.delete("key_123456789");`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X DELETE https://api.reloop.sh/api-key/v1/key_123456789 \\
  -H "Authorization: Bearer rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.api_keys.delete("key_123456789")`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("rl_123456789".to_string(), None);
    
    reloop.api_keys().delete("key_123456789").await?;

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
    
    _, _ = reloop.ApiKeys().Delete("key_123456789")
}`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('rl_123456789');

$reloop->apiKeys->delete('key_123456789');`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("rl_123456789");

reloop.apiKeys().delete("key_123456789");`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using Reloop.Email.Models;

var reloop = ReloopEmail.Client("rl_123456789");

await reloop.ApiKeys().DeleteAsync("key_123456789");`,
	},
];
