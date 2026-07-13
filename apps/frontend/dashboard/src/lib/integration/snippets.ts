import type { LanguageCode, PackageManager, SetupLanguageCode } from "./types";

export type {
	IntegrationMode,
	LanguageCode,
	PackageManager,
	SetupLanguageCode,
} from "./types";

export const languageLabels: Record<LanguageCode, string> = {
	nodejs: "Node.js",
	python: "Python",
	go: "Go",
	php: "PHP",
};

export const setupLanguageLabels: Record<SetupLanguageCode, string> = {
	...languageLabels,
	ruby: "Ruby",
};

export const nodeInstallCommands: Record<PackageManager, string> = {
	npm: "npm install reloop-email",
	pnpm: "pnpm add reloop-email",
	yarn: "yarn add reloop-email",
	bun: "bun add reloop-email",
};

export const installCommands: Record<LanguageCode, string> = {
	nodejs: nodeInstallCommands.npm,
	python: "pip install reloop-email",
	go: "go get github.com/reloop-labs/reloop-email",
	php: "composer require reloop/reloop-email",
};

export const setupInstallCommands: Record<SetupLanguageCode, string> = {
	...installCommands,
	ruby: "gem install reloop-email",
};

const sdkNames: Record<SetupLanguageCode, string> = {
	nodejs: "reloop-email",
	python: "reloop-email",
	php: "reloop/reloop-email",
	ruby: "reloop-email",
	go: "github.com/reloop-labs/reloop-email",
};

export const sendEmailCode: Record<
	LanguageCode,
	{ code: string; lang: string }
> = {
	nodejs: {
		code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: process.env.RELOOP_API_KEY });

const { response, error } = await reloop.mail.send({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Hello from Reloop!",
  text: "Hello World!",
});

if (error) throw error;
console.log(response.messageId, response.id);`,
		lang: "typescript",
	},
	python: {
		code: `import os
from reloop_email import Reloop

reloop = Reloop(api_key=os.environ["RELOOP_API_KEY"])

result = reloop.mail.send(
    from_email="sender@example.com",
    to="recipient@example.com",
    subject="Hello from Reloop!",
    text="Hello World!",
)

print(result)`,
		lang: "python",
	},
	go: {
		code: `package main

import (
  "fmt"
  "os"
  reloopemail "github.com/reloop-labs/reloop-email"
)

func main() {
  reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
    APIKey: os.Getenv("RELOOP_API_KEY"),
  })

  result, err := reloop.Mail().Send(&reloopemail.MailRequest{
    From:    "sender@example.com",
    To:      "recipient@example.com",
    Subject: "Hello from Reloop!",
    Text:    "Hello World!",
  })
  if err != nil {
    fmt.Println("Error:", err)
    return
  }
  fmt.Println("Success:", result)
}`,
		lang: "go",
	},
	php: {
		code: `$reloop = Reloop::client(getenv('RELOOP_API_KEY'));

$reloop->emails->send([
  'from' => 'sender@example.com',
  'to' => 'recipient@example.com',
  'subject' => 'Hello from Reloop!',
  'text' => 'Hello World!',
]);`,
		lang: "php",
	},
};

export function buildAiPrompt(apiKey: string): string {
	return `Integrate Reloop email sending into this project.

My API key: ${apiKey}

Requirements:
1. Detect this project's language/framework and install the correct Reloop SDK
2. Add RELOOP_API_KEY=${apiKey} to my .env file
3. Send a transactional email from sender@example.com to recipient@example.com with subject "Hello from Reloop!" and plain-text body "Hello World!"
4. Follow this project's existing conventions and handle errors properly

Supported SDKs:
- Node.js / Python: reloop-email
- Go: github.com/reloop-labs/reloop-email
- PHP: reloop/reloop-email

Show me only the integration code I need to add to my project.`;
}

export function buildSetupPrompt(
	lang: SetupLanguageCode,
	apiKeyDisplay: string,
	domain: string,
): string {
	const sdk = sdkNames[lang];
	const fromAddr = `hello@${domain}`;

	return `Install the ${sdk} SDK and send a transactional email using my API key ${apiKeyDisplay}.

Import the client, initialise it with my key, then send a welcome email from ${fromAddr} to the user's address with subject "Welcome aboard" and a plain-text body.

Use async/await and handle errors. Show me only the integration code.`;
}

export function buildSetupCodeSnippet(
	lang: SetupLanguageCode,
	apiKeyDisplay: string,
	domain: string,
): string {
	const fromAddr = `hello@${domain}`;
	switch (lang) {
		case "nodejs":
			return `import { Reloop } from "reloop-email";

const reloop = new Reloop({
  apiKey: "${apiKeyDisplay}",
});

const { response, error } = await reloop.mail.send({
  from: "${fromAddr}",
  to: "user@example.com",
  subject: "Welcome aboard",
  text: "Welcome to our platform!",
});

if (error) throw error;
console.log(response.messageId, response.id);`;
		case "python":
			return `from reloop_email import Reloop

reloop = Reloop(api_key="${apiKeyDisplay}")

try:
    response = reloop.emails.send(
        sender="${fromAddr}",
        to="user@example.com",
        subject="Welcome aboard",
        text="Welcome to our platform!"
    )
    print(f"Email sent successfully: {response.id}")
except Exception as e:
    print(f"Failed to send email: {e}")`;
		case "php":
			return `$reloop = Reloop::client('${apiKeyDisplay}');

try {
    $response = $reloop->emails->send([
        'from' => '${fromAddr}',
        'to' => 'user@example.com',
        'subject' => 'Welcome aboard',
        'text' => 'Welcome to our platform!'
    ]);
    echo 'Email sent! ID: ' . $response->id;
} catch (\\Exception $e) {
    echo 'Failed to send: ' . $e->getMessage();
}`;
		case "ruby":
			return `require 'reloop-email'

reloop = Reloop::Client.new(api_key: '${apiKeyDisplay}')

begin
  response = reloop.emails.send(
    from: '${fromAddr}',
    to: 'user@example.com',
    subject: 'Welcome aboard',
    text: 'Welcome to our platform!'
  )
  puts "Email sent: #{response.id}"
rescue => e
  puts "Failed to send: #{e.message}"
end`;
		case "go":
			return `package main

import (
	"context"
	"fmt"
	"log"

	reloopemail "github.com/reloop-labs/reloop-email"
)

func main() {
	reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
		APIKey: "${apiKeyDisplay}",
	})

	resp, err := reloop.Emails().Send(context.Background(), &reloopemail.SendEmailRequest{
		From:    "${fromAddr}",
		To:      "user@example.com",
		Subject: "Welcome aboard",
		Text:    "Welcome to our platform!",
	})
	if err != nil {
		log.Fatalf("Failed to send: %v", err)
	}
	fmt.Printf("Email sent successfully! ID: %s\\n", resp.ID)
}`;
		default:
			return "";
	}
}

export const setupShikiLang: Record<SetupLanguageCode, string> = {
	nodejs: "javascript",
	python: "python",
	php: "php",
	ruby: "ruby",
	go: "go",
};

export const setupFileLabels: Record<SetupLanguageCode, string> = {
	nodejs: "app.js",
	python: "main.py",
	php: "index.php",
	ruby: "send.rb",
	go: "main.go",
};
