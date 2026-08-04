import type { SimpleIcon } from "simple-icons";
import {
	siDotnet,
	siElixir,
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
	siSpringboot,
} from "simple-icons";

export const LANGUAGE_SLUGS = [
	"nodejs",
	"python",
	"go",
	"rust",
	"php",
	"ruby",
	"elixir",
	"java",
	"dotnet",
] as const;

export type LanguageSlug = (typeof LANGUAGE_SLUGS)[number];

export interface LanguageDefinition {
	slug: LanguageSlug;
	name: string;
	shortDescription: string;
	installCommand: string;
	docsPath: string;
	icon: SimpleIcon;
	sendCode: string;
	highlights: string[];
}

export const languages: LanguageDefinition[] = [
	{
		slug: "nodejs",
		name: "Node.js",
		shortDescription:
			"Send email from Node.js and TypeScript with the official SDK—async/await, full types, and framework guides for Next.js, Express, and more.",
		installCommand: "npm install reloop-email",
		docsPath: "/docs/quickstart/nodejs",
		icon: siNodedotjs,
		highlights: ["TypeScript", "Next.js", "Serverless"],
		sendCode: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

const { data, error } = await reloop.emails.send({
  from: 'Acme <onboarding@yourdomain.com>',
  to: ['delivered@yourdomain.com'],
  subject: 'Hello from Node.js',
  html: '<strong>It works!</strong>',
});

if (error) {
  console.error(error);
  return;
}

console.log('Email sent:', data.id);`,
	},
	{
		slug: "python",
		name: "Python",
		shortDescription:
			"Integrate Reloop with Flask, FastAPI, or any Python app using a clean client with type hints and straightforward error handling.",
		installCommand: "pip install reloop-email",
		docsPath: "/docs/quickstart/python",
		icon: siPython,
		highlights: ["Flask", "FastAPI", "Django SMTP"],
		sendCode: `import os
from reloop_email import Reloop

reloop = Reloop(api_key=os.environ["RELOOP_API_KEY"])

params = {
    "from": "Acme <onboarding@yourdomain.com>",
    "to": ["delivered@yourdomain.com"],
    "subject": "Hello from Python",
    "html": "<strong>It works!</strong>",
}

result = reloop.mail.send(params)

if result.email_error:
    raise result.email_error

print(f"Email sent: {result.response['id']}")`,
	},
	{
		slug: "go",
		name: "Go",
		shortDescription:
			"Use the Go SDK for high-throughput services with context-aware requests and minimal dependencies.",
		installCommand: "go get github.com/reloop-labs/reloop-email",
		docsPath: "/docs/quickstart/go",
		icon: siGo,
		highlights: ["Context", "Goroutines", "Microservices"],
		sendCode: `package main

import (
	"context"
	"fmt"
	"os"

	reloopemail "github.com/reloop-labs/reloop-email"
)

func main() {
	reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
		APIKey: os.Getenv("RELOOP_API_KEY"),
	})

	email, err := reloop.Emails().Send(context.Background(), &reloopemail.SendEmailParams{
		From:    "Acme <onboarding@yourdomain.com>",
		To:      []string{"delivered@yourdomain.com"},
		Subject: "Hello from Go",
		Html:    "<strong>It works!</strong>",
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("Email sent:", email.ID)
}`,
	},
	{
		slug: "rust",
		name: "Rust",
		shortDescription:
			"Send email from Rust with an async-first crate built for performance-critical applications.",
		installCommand: "cargo add reloop-email",
		docsPath: "/docs/quickstart/rust",
		// Brand hex is #000000 — override so the gear stays visible on dark UI
		icon: { ...siRust, hex: "e24d2b" },
		highlights: ["Tokio", "Axum", "Type-safe"],
		sendCode: `use reloop_email::ReloopEmail;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopEmail::new(std::env::var("RELOOP_API_KEY")?, None);

    let email = reloop
        .emails()
        .send(reloop_email::SendEmailParams {
            from: "Acme <onboarding@yourdomain.com>".into(),
            to: vec!["delivered@yourdomain.com".into()],
            subject: "Hello from Rust".into(),
            html: Some("<strong>It works!</strong>".into()),
            ..Default::default()
        })
        .await?;

    println!("Email sent: {}", email.id);
    Ok(())
}`,
	},
	{
		slug: "php",
		name: "PHP",
		shortDescription:
			"Composer-ready PHP SDK with Laravel and Symfony guides for transactional and marketing email.",
		installCommand: "composer require reloop/reloop-email",
		docsPath: "/docs/quickstart/php",
		icon: siPhp,
		highlights: ["Laravel", "Symfony", "WordPress"],
		sendCode: `$reloop = Reloop::client(getenv('RELOOP_API_KEY'));

$reloop->emails->send([
  'from' => 'Acme <onboarding@yourdomain.com>',
  'to' => ['delivered@yourdomain.com'],
  'subject' => 'Hello from PHP',
  'html' => '<strong>It works!</strong>',
]);`,
	},
	{
		slug: "ruby",
		name: "Ruby",
		shortDescription:
			"Ship email from Rails, Sinatra, or any Ruby app with a gem that follows familiar conventions.",
		installCommand: "gem install reloop-email",
		docsPath: "/docs/quickstart/ruby",
		icon: siRuby,
		highlights: ["Rails", "Sinatra", "Bundler"],
		sendCode: `require 'reloop'

Reloop.api_key = ENV['RELOOP_API_KEY']

params = {
  from: 'Acme <onboarding@yourdomain.com>',
  to: ['delivered@yourdomain.com'],
  subject: 'Hello from Ruby',
  html: '<strong>It works!</strong>'
}

email = Reloop::Emails.send(params)
puts "Email sent: #{email[:id]}"`,
	},
	{
		slug: "elixir",
		name: "Elixir",
		shortDescription:
			"Send email from Elixir and Phoenix with an OTP-friendly client for reliable, concurrent delivery.",
		installCommand: '{:reloop, "~> 0.1.0"}',
		docsPath: "/docs/quickstart/elixir",
		icon: siElixir,
		highlights: ["Phoenix", "OTP", "LiveView"],
		sendCode: `client = Reloop.client(api_key: System.get_env("RELOOP_API_KEY"))

Reloop.Emails.send(client, %{
  from: "Acme <onboarding@yourdomain.com>",
  to: ["delivered@yourdomain.com"],
  subject: "Hello from Elixir",
  html: "<strong>It works!</strong>"
})
|> case do
  {:ok, email} -> IO.puts("Email sent: " <> email.id)
  {:error, reason} -> IO.inspect(reason)
end`,
	},
	{
		slug: "java",
		name: "Java",
		shortDescription:
			"Use the Java SDK in Spring Boot or plain JVM apps with Maven or Gradle dependencies.",
		installCommand: "sh.reloop:reloop-email",
		docsPath: "/docs/quickstart/java",
		icon: siSpringboot,
		highlights: ["Spring Boot", "Maven", "Gradle"],
		sendCode: `import sh.reloop.email.ReloopEmail;
import sh.reloop.email.model.SendEmailRequest;

public class Main {
  public static void main(String[] args) throws Exception {
    ReloopEmail reloop = ReloopEmail.client(System.getenv("RELOOP_API_KEY"));

    SendEmailRequest request = SendEmailRequest.builder()
        .from("Acme <onboarding@yourdomain.com>")
        .to("delivered@yourdomain.com")
        .subject("Hello from Java")
        .html("<strong>It works!</strong>")
        .build();

    var email = reloop.emails().send(request);
    System.out.println("Email sent: " + email.getId());
  }
}`,
	},
	{
		slug: "dotnet",
		name: ".NET",
		shortDescription:
			"Send email from C# and .NET 6+ with a NuGet package designed for modern async applications.",
		installCommand: "dotnet add package Reloop.Email",
		docsPath: "/docs/quickstart/dotnet",
		icon: siDotnet,
		highlights: ["C#", "ASP.NET", "NuGet"],
		sendCode: `using Reloop.Email;

var reloop = ReloopEmail.Client(Environment.GetEnvironmentVariable("RELOOP_API_KEY"));

var email = await reloop.Emails.SendAsync(new SendEmailRequest
{
    From = "Acme <onboarding@yourdomain.com>",
    To = new[] { "delivered@yourdomain.com" },
    Subject = "Hello from .NET",
    Html = "<strong>It works!</strong>"
});

Console.WriteLine($"Email sent: {email.Id}");`,
	},
];

export function getLanguage(slug: string): LanguageDefinition | undefined {
	return languages.find((l) => l.slug === slug);
}

export function isLanguageSlug(slug: string): slug is LanguageSlug {
	return LANGUAGE_SLUGS.includes(slug as LanguageSlug);
}
