export const listGroupsXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response: groups, error } = await reloop.contacts.listGroups({
  page: 1,
  limit: 10,
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl "https://reloop.sh/api/contacts/v1/groups/list?page=1&limit=10" \\
  -H "x-api-key: re_123456789"`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->listGroups(
  options: [
      'page' => 1,
      'limit' => 10,
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `reloop = Reloop(api_key="re_123456789")

reloop.contacts.list_groups(
    page=1,
    limit=10
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/groups/list')
uri.query = URI.encode_www_form(page: 1, limit: 10)
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Get.new(uri)
request['x-api-key'] = 're_123456789'

response = http.request(request)
groups = JSON.parse(response.body)`,
	},
			{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop

func main() {
    client, _ := reloop.NewClient(reloop.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = client.Contacts.ListGroups(map[string]interface{}{
        "page": 1,
        "limit": 10
    })
}`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reqwest::Client;

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let client = Client::new();

    let response = client
        .get("https://reloop.sh/api/contacts/v1/groups/list")
        .header("x-api-key", "re_123456789")
        .query(&[("page", "1"), ("limit", "10")])
        .send()
        .await?;

    Ok(())
}`,
	},
		{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import java.util.*;

ReloopClient reloop = new ReloopClient("re_123456789");

reloop.contacts.listGroups(Map.of("page", 1, "limit", 10));`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using System.Net.Http;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key", "re_123456789");

var response = await client.GetAsync(
    "https://reloop.sh/api/contacts/v1/groups/list?page=1&limit=10"
);`,
	},
];
