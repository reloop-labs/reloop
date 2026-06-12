export const getGroupXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://reloop.sh',
  key: 're_123456789'
});

const { response: group, error } = await reloop.contacts.getGroup('grp_123456789');
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl https://reloop.sh/api/contacts/v1/groups/grp_123456789 \\
  -H "x-api-key: re_123456789"`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->getGroup('grp_123456789');`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `reloop = Reloop(api_key="re_123456789")

reloop.contacts.get_group("grp_123456789")`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/v1/groups/grp_123456789')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Get.new(uri)
request['x-api-key'] = 're_123456789'

response = http.request(request)
group = JSON.parse(response.body)`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `package main

import "net/http"

func main() {
  req, _ := http.NewRequest("GET", "https://reloop.sh/api/contacts/v1/groups/grp_123456789", nil)
  req.Header.Set("x-api-key", "re_123456789")

  client := &http.Client{}
  resp, _ := client.Do(req)
  defer resp.Body.Close()
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
        .get("https://reloop.sh/api/contacts/v1/groups/grp_123456789")
        .header("x-api-key", "re_123456789")
        .send()
        .await?;

    Ok(())
}`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://reloop.sh/api/contacts/v1/groups/grp_123456789"))
    .header("x-api-key", "re_123456789")
    .GET()
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using System.Net.Http;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key", "re_123456789");

var response = await client.GetAsync(
    "https://reloop.sh/api/contacts/v1/groups/grp_123456789"
);`,
	},
];
