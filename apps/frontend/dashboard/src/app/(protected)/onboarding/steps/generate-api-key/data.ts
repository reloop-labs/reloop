export type LanguageCode = "nodejs" | "go" | "php" | "python";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const nodeInstallCommands: Record<PackageManager, string> = {
	npm: "npm install reloop-email",
	pnpm: "pnpm add reloop-email",
	yarn: "yarn add reloop-email",
	bun: "bun add reloop-email",
};

export const installCommands: Record<LanguageCode, string> = {
	nodejs: nodeInstallCommands.npm,
	python: "pip install reloop",
	go: "go get github.com/reloop/reloop-go",
	php: "composer require reloop/reloop-email",
};

export const sendEmailCode: Record<
	LanguageCode,
	{ code: string; lang: string }
> = {
	nodejs: {
		code: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

const result = await reloop.mail.send({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Hello from Reloop!',
  text: 'Hello World!',
});

console.log(result);`,
		lang: "typescript",
	},
	python: {
		code: `import os
from reloop import Reloop

client = Reloop(os.environ["RELOOP_API_KEY"])

result = client.mail.send(
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
  "github.com/reloop/reloop-go"
)

func main() {
  client := reloop.NewClient(os.Getenv("RELOOP_API_KEY"))

  result, err := client.Mail.Send(&reloop.MailRequest{
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
