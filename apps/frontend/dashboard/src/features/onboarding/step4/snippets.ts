import type { LanguageCode, PackageManager } from "./types";

export const languageLabels: Record<LanguageCode, string> = {
	nodejs: "Node.js",
	python: "Python",
	go: "Go",
	php: "PHP",
};

export const langFileLabels: Record<LanguageCode, string> = {
	nodejs: "send-email.ts",
	python: "send_email.py",
	go: "send_email.go",
	php: "send-email.php",
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
	go: "go get github.com/reloop-labs/reloop-go/v2",
	php: "composer require reloop/reloop-email",
};

const DEFAULT_TO_EMAIL = "you@example.com";

/** `lang` values are Bright aliases (via toBrightLang). */
export function getSendEmailCode(
	toEmail?: string | null,
): Record<LanguageCode, { code: string; lang: string }> {
	const to = toEmail?.trim() || DEFAULT_TO_EMAIL;

	return {
		nodejs: {
			code: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: process.env.RELOOP_API_KEY! });

const { response, emailError } = await reloop.mail.send({
  from: "Reloop <onboarding@reloop.email>",
  to: "${to}",
  subject: "Hello World!",
  text: "Congrats on sending your first email!",
});

if (emailError) throw emailError;
console.log(response.messageId, response.id);`,
			lang: "ts",
		},
		python: {
			code: `import os
from reloop_email import Reloop

reloop = Reloop(api_key=os.environ["RELOOP_API_KEY"])

result = reloop.mail.send({
    "from": "Reloop <onboarding@reloop.email>",
    "to": "${to}",
    "subject": "Hello World!",
    "text": "Congrats on sending your first email!",
})

if result.email_error:
    raise result.email_error

print(result.response["messageId"], result.response["id"])`,
			lang: "py",
		},
		go: {
			code: `package main

import (
  "fmt"
  "os"

  reloop "github.com/reloop-labs/reloop-go/v2"
)

func main() {
  client, err := reloop.NewClient(reloop.ClientOptions{
    APIKey: os.Getenv("RELOOP_API_KEY"),
  })
  if err != nil {
    panic(err)
  }

  result, err := client.Mail.Send(reloop.SendMailParams{
    From:    "Reloop <onboarding@reloop.email>",
    To:      "${to}",
    Subject: "Hello World!",
    Text:    reloop.String("Congrats on sending your first email!"),
  })
  if err != nil {
    fmt.Println("Error:", err)
    return
  }
  fmt.Println(result.MessageID, result.ID)
}`,
			lang: "go",
		},
		php: {
			code: `$reloop = Reloop::client(getenv('RELOOP_API_KEY'));

$result = $reloop->mail->send([
  'from' => 'Reloop <onboarding@reloop.email>',
  'to' => '${to}',
  'subject' => 'Hello World!',
  'text' => 'Congrats on sending your first email!',
]);

echo $result->message_id, $result->id;`,
			lang: "php",
		},
	};
}

export function buildAiPrompt(apiKey: string, toEmail?: string | null): string {
	const to = toEmail?.trim() || DEFAULT_TO_EMAIL;

	return `Integrate Reloop email sending into this project.

My API key: ${apiKey}

Requirements:
1. Detect this project's language/framework and install the correct Reloop SDK
2. Add RELOOP_API_KEY=${apiKey} to my .env file
3. Send a transactional email from Reloop <onboarding@reloop.email> to ${to} with subject "Hello World!" and plain-text body "Congrats on sending your first email!"
4. Follow this project's existing conventions and handle errors properly

Supported SDKs:
- Node.js / Python: reloop-email
- Go: github.com/reloop-labs/reloop-go/v2
- PHP: reloop/reloop-email

Show me only the integration code I need to add to my project.`;
}

export { toBrightLang } from "@reloop/ui/utils/to-bright-lang";
