export const sendEmailXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response, emailError } = await reloop.mail.send({
  from: "Reloop <hello@send.example.com>",
  to: "user@example.com",
  subject: "Welcome to Reloop",
  html: "<p>Thanks for signing up.</p>",
  text: "Thanks for signing up.",
  reply_to: "support@example.com",
  tags: [{ name: "campaign", value: "welcome" }],
});
if (emailError) throw emailError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/mail/v1/send \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"from":"Reloop <hello@send.example.com>","to":"user@example.com","subject":"Welcome to Reloop","html":"<p>Thanks for signing up.</p>","text":"Thanks for signing up.","reply_to":"support@example.com","tags":[{"name":"campaign","value":"welcome"}]}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.mail.send({
  "from": "Reloop <hello@send.example.com>",
  "to": "user@example.com",
  "subject": "Welcome to Reloop",
  "html": "<p>Thanks for signing up.</p>",
  "text": "Thanks for signing up.",
  "reply_to": "support@example.com",
  "tags": [
    {
      "name": "campaign",
      "value": "welcome",
    },
  ],
})
if result.email_error:
    raise result.email_error`,
	},
			{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$response = $reloop->mail->send([
    'from' => 'Reloop <hello@send.example.com>',
    'to' => 'user@example.com',
    'subject' => 'Welcome to Reloop',
    'html' => '<p>Thanks for signing up.</p>',
    'text' => 'Thanks for signing up.',
    'reply_to' => 'support@example.com',
    'tags' => [
        [
            'name' => 'campaign',
            'value' => 'welcome',
        ],
    ],
]);`,
	},
			{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
import sh.reloop.models.MailModels.SendMailParams;
import sh.reloop.models.MailModels.SendMailTag;
import java.util.List;

ReloopClient reloop = new ReloopClient("rl_123456789");

SendMailParams params = new SendMailParams();
params.from = "Reloop <hello@send.example.com>";
params.to = "user@example.com";
params.subject = "Welcome to Reloop";
params.html = "<p>Thanks for signing up.</p>";
params.text = "Thanks for signing up.";
params.replyTo = "support@example.com";
params.tags = List.of(new SendMailTag("campaign", "welcome"));
var response = reloop.mail.send(params);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `using Reloop;

var reloop = new ReloopClient("rl_123456789");

var result = await reloop.Mail.SendAsync(new Dictionary<string, object?>
{
    ["from"] = "Reloop <hello@send.example.com>",
    ["to"] = "user@example.com",
    ["subject"] = "Welcome to Reloop",
    ["html"] = "<p>Thanks for signing up.</p>",
    ["text"] = "Thanks for signing up.",
    ["reply_to"] = "support@example.com",
    ["tags"] = new object[] { new { name = "campaign", value = "welcome" } },
});`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `import reloop "github.com/reloop-labs/reloop-go/v2"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

result, _ := client.Mail.Send(reloop.SendMailParams{
    From:    "Reloop <hello@send.example.com>",
    To:      "user@example.com",
    Subject: "Welcome to Reloop",
    HTML:    reloop.String("<p>Thanks for signing up.</p>"),
    Text:    reloop.String("Thanks for signing up."),
    ReplyTo: "support@example.com",
    Tags: []reloop.SendMailTag{
        {Name: "campaign", Value: "welcome"},
    },
})`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `use reloop::ReloopClient;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.mail().send(json!({
        "from": "Reloop <hello@send.example.com>",
        "to": "user@example.com",
        "subject": "Welcome to Reloop",
        "html": "<p>Thanks for signing up.</p>",
        "text": "Thanks for signing up.",
        "reply_to": "support@example.com",
        "tags": [{"name": "campaign", "value": "welcome"}],
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

result = reloop.mail.send(
  from: "Reloop <hello@send.example.com>",
  to: "user@example.com",
  subject: "Welcome to Reloop",
  html: "<p>Thanks for signing up.</p>",
  text: "Thanks for signing up.",
  reply_to: "support@example.com",
  tags: [{ name: "campaign", value: "welcome" }],
)`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `client = Reloop.client("rl_123456789")

{:ok, result} = Reloop.Services.Mail.send(client, %{
  from: "Reloop <hello@send.example.com>",
  to: "user@example.com",
  subject: "Welcome to Reloop",
  html: "<p>Thanks for signing up.</p>",
  text: "Thanks for signing up.",
  reply_to: "support@example.com",
  tags: [%{name: "campaign", value: "welcome"}]
})`,
	},
];
