import type { SimpleIcon } from "simple-icons";
import {
	siDjango,
	siDotnet,
	siExpress,
	siFastapi,
	siFastify,
	siFlask,
	siGin,
	siLaravel,
	siNestjs,
	siNextdotjs,
	siPhoenixframework,
	siRubyonrails,
	siSpringboot,
} from "simple-icons";
import type { LanguageSlug } from "./languages";

export const FRAMEWORK_SLUGS = [
	"nextjs",
	"express",
	"nestjs",
	"fastify",
	"django",
	"fastapi",
	"flask",
	"laravel",
	"rails",
	"spring-boot",
	"aspnet",
	"phoenix",
	"gin",
] as const;

export type FrameworkSlug = (typeof FRAMEWORK_SLUGS)[number];

export interface FrameworkDefinition {
	slug: FrameworkSlug;
	name: string;
	/** Short SEO blurb */
	shortDescription: string;
	/** Parent language SDK */
	languageSlug: LanguageSlug;
	languageName: string;
	installCommand: string;
	packageName: string;
	docsPath: string;
	icon: SimpleIcon;
	/** e.g. Route Handlers, API Routes */
	runtimeHint: string;
	sendCode: string;
	highlights: string[];
}

export const frameworks: FrameworkDefinition[] = [
	{
		slug: "nextjs",
		name: "Next.js",
		shortDescription:
			"Send transactional email from Next.js App Router and Server Actions with the official Node.js SDK.",
		languageSlug: "nodejs",
		languageName: "Node.js",
		installCommand: "npm install reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/nodejs",
		icon: siNextdotjs,
		runtimeHint: "App Router · Server Actions",
		highlights: ["App Router", "Server Actions", "Route Handlers"],
		sendCode: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

export async function POST() {
  const { data, error } = await reloop.emails.send({
    from: 'Acme <onboarding@yourdomain.com>',
    to: ['delivered@yourdomain.com'],
    subject: 'Hello from Next.js',
    html: '<strong>It works!</strong>',
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ id: data.id });
}`,
	},
	{
		slug: "express",
		name: "Express",
		shortDescription:
			"Add reliable transactional email to Express APIs and middleware with a few lines of Node.js.",
		languageSlug: "nodejs",
		languageName: "Node.js",
		installCommand: "npm install reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/nodejs",
		icon: { ...siExpress, hex: "000000" },
		runtimeHint: "REST APIs · Middleware",
		highlights: ["REST", "Middleware", "Node.js"],
		sendCode: `import express from 'express';
import Reloop from 'reloop-email';

const app = express();
const reloop = new Reloop(process.env.RELOOP_API_KEY);

app.post('/send', async (req, res) => {
  const { data, error } = await reloop.emails.send({
    from: 'Acme <onboarding@yourdomain.com>',
    to: [req.body.to],
    subject: 'Hello from Express',
    html: '<strong>It works!</strong>',
  });

  if (error) return res.status(500).json({ error });
  res.json({ id: data.id });
});

app.listen(3000);`,
	},
	{
		slug: "nestjs",
		name: "NestJS",
		shortDescription:
			"Inject Reloop into NestJS services and controllers for type-safe transactional email.",
		languageSlug: "nodejs",
		languageName: "Node.js",
		installCommand: "npm install reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/nodejs",
		icon: siNestjs,
		runtimeHint: "Modules · Providers",
		highlights: ["DI", "Controllers", "TypeScript"],
		sendCode: `import { Injectable } from '@nestjs/common';
import Reloop from 'reloop-email';

@Injectable()
export class MailService {
  private reloop = new Reloop(process.env.RELOOP_API_KEY!);

  async sendWelcome(to: string) {
    const { data, error } = await this.reloop.emails.send({
      from: 'Acme <onboarding@yourdomain.com>',
      to: [to],
      subject: 'Welcome',
      html: '<strong>Thanks for signing up.</strong>',
    });

    if (error) throw error;
    return data;
  }
}`,
	},
	{
		slug: "fastify",
		name: "Fastify",
		shortDescription:
			"High-performance Fastify routes that send email through Reloop with the Node.js SDK.",
		languageSlug: "nodejs",
		languageName: "Node.js",
		installCommand: "npm install reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/nodejs",
		icon: siFastify,
		runtimeHint: "Plugins · Routes",
		highlights: ["Performance", "TypeScript", "Plugins"],
		sendCode: `import Fastify from 'fastify';
import Reloop from 'reloop-email';

const app = Fastify();
const reloop = new Reloop(process.env.RELOOP_API_KEY);

app.post('/send', async () => {
  const { data, error } = await reloop.emails.send({
    from: 'Acme <onboarding@yourdomain.com>',
    to: ['delivered@yourdomain.com'],
    subject: 'Hello from Fastify',
    html: '<strong>It works!</strong>',
  });

  if (error) throw error;
  return { id: data.id };
});

await app.listen({ port: 3000 });`,
	},
	{
		slug: "django",
		name: "Django",
		shortDescription:
			"Send password resets, receipts, and notifications from Django views and Celery tasks.",
		languageSlug: "python",
		languageName: "Python",
		installCommand: "pip install reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/python",
		icon: siDjango,
		runtimeHint: "Views · Celery · Admin",
		highlights: ["Views", "Celery", "ORM"],
		sendCode: `import os
from django.http import JsonResponse
from reloop_email import Reloop

reloop = Reloop(api_key=os.environ["RELOOP_API_KEY"])

def send_welcome(request):
    result = reloop.mail.send({
        "from": "Acme <onboarding@yourdomain.com>",
        "to": [request.POST["email"]],
        "subject": "Welcome",
        "html": "<strong>Thanks for signing up.</strong>",
    })

    if result.email_error:
        return JsonResponse({"error": str(result.email_error)}, status=500)

    return JsonResponse({"id": result.response["id"]})`,
	},
	{
		slug: "fastapi",
		name: "FastAPI",
		shortDescription:
			"Async FastAPI endpoints that send email with Reloop—type hints, Pydantic, and OpenAPI included.",
		languageSlug: "python",
		languageName: "Python",
		installCommand: "pip install reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/python",
		icon: siFastapi,
		runtimeHint: "Async · Pydantic",
		highlights: ["Async", "Pydantic", "OpenAPI"],
		sendCode: `import os
from fastapi import FastAPI, HTTPException
from reloop_email import Reloop

app = FastAPI()
reloop = Reloop(api_key=os.environ["RELOOP_API_KEY"])

@app.post("/send")
async def send_email(to: str):
    result = reloop.mail.send({
        "from": "Acme <onboarding@yourdomain.com>",
        "to": [to],
        "subject": "Hello from FastAPI",
        "html": "<strong>It works!</strong>",
    })

    if result.email_error:
        raise HTTPException(status_code=500, detail=str(result.email_error))

    return {"id": result.response["id"]}`,
	},
	{
		slug: "flask",
		name: "Flask",
		shortDescription:
			"Drop Reloop into Flask blueprints for simple, production-ready transactional email.",
		languageSlug: "python",
		languageName: "Python",
		installCommand: "pip install reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/python",
		icon: siFlask,
		runtimeHint: "Blueprints · Routes",
		highlights: ["Blueprints", "Jinja", "WSGI"],
		sendCode: `import os
from flask import Flask, jsonify, request
from reloop_email import Reloop

app = Flask(__name__)
reloop = Reloop(api_key=os.environ["RELOOP_API_KEY"])

@app.post("/send")
def send():
    result = reloop.mail.send({
        "from": "Acme <onboarding@yourdomain.com>",
        "to": [request.json["to"]],
        "subject": "Hello from Flask",
        "html": "<strong>It works!</strong>",
    })

    if result.email_error:
        return jsonify(error=str(result.email_error)), 500

    return jsonify(id=result.response["id"])`,
	},
	{
		slug: "laravel",
		name: "Laravel",
		shortDescription:
			"Send mail from Laravel controllers, jobs, and notifications using the PHP SDK.",
		languageSlug: "php",
		languageName: "PHP",
		installCommand: "composer require reloop/reloop-email",
		packageName: "reloop/reloop-email",
		docsPath: "/docs/quickstart/php",
		icon: siLaravel,
		runtimeHint: "Controllers · Jobs · Queues",
		highlights: ["Jobs", "Queues", "Eloquent"],
		sendCode: `<?php

use Reloop\\Reloop;
use Illuminate\\Http\\Request;

class MailController
{
    public function send(Request $request)
    {
        $reloop = Reloop::client(env('RELOOP_API_KEY'));

        $email = $reloop->emails->send([
            'from' => 'Acme <onboarding@yourdomain.com>',
            'to' => [$request->input('to')],
            'subject' => 'Hello from Laravel',
            'html' => '<strong>It works!</strong>',
        ]);

        return response()->json(['id' => $email->id]);
    }
}`,
	},
	{
		slug: "rails",
		name: "Ruby on Rails",
		shortDescription:
			"Ship password resets and receipts from Rails controllers and Active Job with the Ruby gem.",
		languageSlug: "ruby",
		languageName: "Ruby",
		installCommand: "gem install reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/ruby",
		icon: siRubyonrails,
		runtimeHint: "Controllers · Active Job",
		highlights: ["Active Job", "Mailers", "Sidekiq"],
		sendCode: `require 'reloop'

class EmailsController < ApplicationController
  def create
    Reloop.api_key = ENV['RELOOP_API_KEY']

    email = Reloop::Emails.send(
      from: 'Acme <onboarding@yourdomain.com>',
      to: [params[:to]],
      subject: 'Hello from Rails',
      html: '<strong>It works!</strong>'
    )

    render json: { id: email[:id] }
  end
end`,
	},
	{
		slug: "spring-boot",
		name: "Spring Boot",
		shortDescription:
			"Integrate Reloop into Spring Boot services with the Java SDK—Maven or Gradle ready.",
		languageSlug: "java",
		languageName: "Java",
		installCommand: "sh.reloop:reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/java",
		icon: siSpringboot,
		runtimeHint: "Services · REST Controllers",
		highlights: ["Spring MVC", "Maven", "Gradle"],
		sendCode: `import org.springframework.web.bind.annotation.*;
import sh.reloop.email.ReloopEmail;
import sh.reloop.email.model.SendEmailRequest;

@RestController
public class MailController {
  private final ReloopEmail reloop =
      ReloopEmail.client(System.getenv("RELOOP_API_KEY"));

  @PostMapping("/send")
  public Map<String, String> send(@RequestBody Map<String, String> body)
      throws Exception {
    var email = reloop.emails().send(
      SendEmailRequest.builder()
          .from("Acme <onboarding@yourdomain.com>")
          .to(body.get("to"))
          .subject("Hello from Spring Boot")
          .html("<strong>It works!</strong>")
          .build()
    );
    return Map.of("id", email.getId());
  }
}`,
	},
	{
		slug: "aspnet",
		name: "ASP.NET Core",
		shortDescription:
			"Send email from ASP.NET Core minimal APIs and controllers with the .NET SDK.",
		languageSlug: "dotnet",
		languageName: ".NET",
		installCommand: "dotnet add package Reloop.Email",
		packageName: "Reloop.Email",
		docsPath: "/docs/quickstart/dotnet",
		icon: siDotnet,
		runtimeHint: "Minimal APIs · Controllers",
		highlights: ["Minimal APIs", "DI", "C#"],
		sendCode: `using Reloop.Email;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var reloop = ReloopEmail.Client(
    Environment.GetEnvironmentVariable("RELOOP_API_KEY"));

app.MapPost("/send", async (SendRequest req) =>
{
    var email = await reloop.Emails.SendAsync(new SendEmailRequest
    {
        From = "Acme <onboarding@yourdomain.com>",
        To = new[] { req.To },
        Subject = "Hello from ASP.NET",
        Html = "<strong>It works!</strong>"
    });

    return Results.Ok(new { id = email.Id });
});

app.Run();

record SendRequest(string To);`,
	},
	{
		slug: "phoenix",
		name: "Phoenix",
		shortDescription:
			"Send email from Phoenix controllers and LiveView with the Elixir client.",
		languageSlug: "elixir",
		languageName: "Elixir",
		installCommand: '{:reloop, "~> 0.1.0"}',
		packageName: "reloop",
		docsPath: "/docs/quickstart/elixir",
		icon: siPhoenixframework,
		runtimeHint: "Controllers · LiveView · OTP",
		highlights: ["LiveView", "OTP", "Ecto"],
		sendCode: `defmodule MyAppWeb.EmailController do
  use MyAppWeb, :controller

  def create(conn, %{"to" => to}) do
    client = Reloop.client(api_key: System.get_env("RELOOP_API_KEY"))

    case Reloop.Emails.send(client, %{
           from: "Acme <onboarding@yourdomain.com>",
           to: [to],
           subject: "Hello from Phoenix",
           html: "<strong>It works!</strong>"
         }) do
      {:ok, email} -> json(conn, %{id: email.id})
      {:error, reason} -> conn |> put_status(500) |> json(%{error: inspect(reason)})
    end
  end
end`,
	},
	{
		slug: "gin",
		name: "Gin",
		shortDescription:
			"High-throughput Gin handlers that send email via the Go SDK with context-aware requests.",
		languageSlug: "go",
		languageName: "Go",
		installCommand: "go get github.com/reloop-labs/reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/go",
		icon: siGin,
		runtimeHint: "Handlers · Middleware",
		highlights: ["Gin", "Context", "Goroutines"],
		sendCode: `package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	reloopemail "github.com/reloop-labs/reloop-email"
)

func main() {
	reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
		APIKey: os.Getenv("RELOOP_API_KEY"),
	})

	r := gin.Default()
	r.POST("/send", func(c *gin.Context) {
		email, err := reloop.Emails().Send(c.Request.Context(), &reloopemail.SendEmailParams{
			From:    "Acme <onboarding@yourdomain.com>",
			To:      []string{c.PostForm("to")},
			Subject: "Hello from Gin",
			Html:    "<strong>It works!</strong>",
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": email.ID})
	})

	r.Run(":8080")
}`,
	},
];

export function getFramework(slug: string): FrameworkDefinition | undefined {
	return frameworks.find((f) => f.slug === slug);
}

export function isFrameworkSlug(slug: string): slug is FrameworkSlug {
	return FRAMEWORK_SLUGS.includes(slug as FrameworkSlug);
}

export function frameworksForLanguage(
	languageSlug: LanguageSlug,
): FrameworkDefinition[] {
	return frameworks.filter((f) => f.languageSlug === languageSlug);
}
