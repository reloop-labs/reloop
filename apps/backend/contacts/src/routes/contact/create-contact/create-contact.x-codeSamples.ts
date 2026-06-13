const createContactBody = `{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "subscribed",
  "properties": {
    "company": "Reloop",
    "role": "Developer"
  },
  "groupIds": ["grp_123456789"],
  "channels": [
    {
      "channelId": "channel_123456789",
      "subscription": "opt_in"
    }
  ]
}`;

export const createContactXCodeSamples = [
	{
		id: "node",
		lang: "js",
		label: "Node.js",
		source: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_123456789');

const { data: contact, error } = await reloop.contacts().create({
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Developer',
  },
  groupIds: ['grp_123456789'],
  channels: [
    {
      channelId: 'channel_123456789',
      subscription: 'opt_in',
    },
  ],
});`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/contacts/create \\
  -H "x-api-key: re_123456789" \\
  -H "Content-Type: application/json" \\
  -d '${createContactBody}'`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `$reloop = Reloop::client('re_123456789');

$reloop->contacts->create(
  parameters: [
      'email' => 'john.doe@example.com',
      'first_name' => 'John',
      'last_name' => 'Doe',
      'unsubscribed' => false,
      'properties' => [
          'company' => 'Reloop',
          'role' => 'Developer',
      ],
      'group_ids' => ['grp_123456789'],
      'channels' => [
          [
              'channel_id' => 'channel_123456789',
              'subscription' => 'opt_in',
          ],
      ],
  ],
);`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="re_123456789")

reloop.contacts().create(
    email="john.doe@example.com",
    first_name="John",
    last_name="Doe",
    unsubscribed=False,
    properties={
        "company": "Reloop",
        "role": "Developer",
    },
    group_ids=["grp_123456789"],
    channels=[
        {
            "channel_id": "channel_123456789",
            "subscription": "opt_in",
        },
    ],
)`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `require 'net/http'
require 'json'

uri = URI('https://reloop.sh/api/contacts/create')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['x-api-key'] = 're_123456789'
request['Content-Type'] = 'application/json'
request.body = {
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'subscribed',
  properties: {
    company: 'Reloop',
    role: 'Developer',
  },
  groupIds: ['grp_123456789'],
  channels: [
    {
      channelId: 'channel_123456789',
      subscription: 'opt_in',
    },
  ],
}.to_json

response = http.request(request)
contact = JSON.parse(response.body)`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_123456789",
    })
    
    _, _ = reloop.Contacts().Create(map[string]interface{}{
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "unsubscribed": false,
        "properties": map[string]interface{}{"company": "Reloop", "role": "Developer"},
        "group_ids": []interface{}{"grp_123456789"},
        "channels": []interface{}{map[string]interface{}{"channel_id": "channel_123456789", "subscription": "opt_in"}}
    })
}`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop_email::ReloopEmail;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new("re_123456789".to_string(), None);
    
    reloop.contacts().create(json!({
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "unsubscribed": false,
        "properties": {
        "company": "Reloop",
        "role": "Developer",
    },
        "group_ids": [
        "grp_123456789",
    ],
        "channels": [
        {
        "channel_id": "channel_123456789",
        "subscription": "opt_in",
    },
    ],
    })).await?;

    Ok(())
}`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.email.ReloopEmail;
import java.util.*;

ReloopEmail reloop = ReloopEmail.client("re_123456789");

Map<String, Object> params = new HashMap<>();
params.put("email", "john.doe@example.com");
params.put("first_name", "John");
params.put("last_name", "Doe");
params.put("unsubscribed", false);
params.put("properties", Map.of("company", "Reloop", "role", "Developer"));
params.put("group_ids", List.of("grp_123456789"));
params.put("channels", List.of(Map.of("channel_id", "channel_123456789", "subscription", "opt_in")));
reloop.contacts().create(params);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop.Email;
using System.Collections.Generic;

var reloop = ReloopEmail.Client("re_123456789");

var parameters = new Dictionary<string, object?>();
parameters["email"] = "john.doe@example.com";
parameters["first_name"] = "John";
parameters["last_name"] = "Doe";
parameters["unsubscribed"] = false;
parameters["properties"] = new Dictionary<string, object?>
{
    ["company"] = "Reloop",
    ["role"] = "Developer",
};
parameters["group_ids"] = new object?[] { "grp_123456789" };
parameters["channels"] = new object?[] { new Dictionary<string, object?>
{
    ["channel_id"] = "channel_123456789",
    ["subscription"] = "opt_in",
} };
await reloop.Contacts().CreateAsync(parameters);`,
	},
];
