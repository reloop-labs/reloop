export const deleteGroupXCodeSamples = [
  {
    id: "node",
    lang: "javascript",
    label: "Node.js",
    source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response, error } = await reloop.contacts.deleteGroup("grp_123456789");
if (error) throw error;`,
  },
  {
    id: "curl",
    lang: "bash",
    label: "cURL",
    source: `curl -X DELETE https://reloop.sh/api/contacts/v1/groups/grp_123456789 \\
  -H "x-api-key: rl_123456789"`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

reloop.contacts.delete_group("grp_123456789")`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `$reloop = Reloop::client('rl_123456789');

$reloop->contacts->deleteGroup('grp_123456789');`,
  },
  {
    id: "java",
    lang: "java",
    label: "Java",
    source: `import sh.reloop.ReloopClient;
import sh.reloop.models.Models.*;

ReloopClient reloop = new ReloopClient("rl_123456789");

reloop.contacts.deleteGroup("grp_123456789");`,
  },
  {
    id: "dotnet",
    lang: "csharp",
    label: ".NET",
    source: `using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.Contacts.DeleteGroupAsync("grp_123456789");`,
  },
  {
    id: "go",
    lang: "go",
    label: "Go",
    source: `import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.Contacts.DeleteGroup("grp_123456789")`,
  },
  {
    id: "rust",
    lang: "rust",
    label: "Rust",
    source: `use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.contacts().delete_group("grp_123456789").await?;

    Ok(())
}`,
  },
  {
    id: "ruby",
    lang: "ruby",
    label: "Ruby",
    source: `require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.contacts.delete_group("grp_123456789")`,
  },
  {
    id: "elixir",
    lang: "elixir",
    label: "Elixir",
    source: `client = Reloop.client("rl_123456789")

{:ok, result} = Reloop.Services.Contacts.delete_group(client, "grp_123456789")`,
  }
];
