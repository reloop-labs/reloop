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
import type { BrandIcon } from "./components/language-icon";
import type { LanguageSlug } from "./languages";

/** Official multi-color Elysia mark (simple-icons has no entry yet). */
export const elysiaIcon: BrandIcon = {
	kind: "custom",
	title: "Elysia",
	slug: "elysia",
	hex: "333333",
	viewBox: "0 0 512 512",
	paths: [
		{
			d: "M424.404 470.816C478.089 423.889 512 354.905 512 278C512 136.615 397.385 22 256 22C114.615 22 0 136.615 0 278C0 352.658 31.9583 419.851 82.9409 466.646L83.1767 465L419.144 355L424.404 470.816Z",
			fill: "#333333",
			fillRule: "evenodd",
			clipRule: "evenodd",
		},
		{
			d: "M189.915 52.7412L144.5 46L151.303 43.9069C155.402 42.6455 159.248 40.6719 162.662 38.0765L163.73 37.2654C167.845 34.1375 171.12 30.0364 173.259 25.3304C174.414 22.7883 175.224 20.1027 175.665 17.3454L176.173 14.1698C176.72 10.7473 176.692 7.25741 176.09 3.84416C175.834 2.39429 177.279 1.23239 178.64 1.79296L180.498 2.55815C182.829 3.51798 185.084 4.65434 187.242 5.95732L194.965 10.6205C205.229 16.8174 214.226 24.9023 221.48 34.4477L226.616 41.2051C228.529 43.7228 230.783 45.9625 233.313 47.8599C236.088 49.9411 239.164 51.5874 242.435 52.7418L246 54L227.274 54.749C214.785 55.2486 202.278 54.5764 189.915 52.7412Z",
			fill: "#CCCCCC",
		},
		{
			d: "M178.321 93.006L191.79 68.3844C191.922 68.143 191.93 67.8528 191.812 67.6042L187.22 57.9361C184.337 51.8673 178.219 48 171.5 48L170.23 47.9562C161.437 47.653 152.704 46.3829 144.188 44.169L142.504 43.731C135.521 41.9153 128.746 39.3732 122.293 36.1463L119.446 34.723C115.159 32.5797 111.099 30.012 107.325 27.0584L103.55 24.1043C102.428 23.2265 100.803 23.4506 99.9606 24.5992C97.3651 28.1384 95.7379 32.2935 95.2395 36.6541L94.5535 42.6571C94.1854 45.8774 94.1446 49.1267 94.4316 52.3552L96.1031 71.1595C97.3467 85.1501 102.175 98.584 110.123 110.165L111.825 112.645C114.267 116.203 117.113 119.466 120.306 122.369C120.756 122.778 121.329 123.03 121.936 123.084C145.029 125.156 167.194 113.348 178.321 93.006Z",
			fill: "#CCCCCC",
		},
		{
			d: "M127.378 123.538L143.376 116.613C150.438 113.557 152.588 104.577 147.676 98.6533C143.683 93.8378 136.58 93.0803 131.661 96.9453L127.867 99.9256C126.958 100.64 126.127 101.448 125.387 102.336L116.263 113.284C114.982 114.822 115.084 117.084 116.5 118.5L119.318 121.721C119.77 122.237 120.296 122.685 120.878 123.049C122.833 124.271 125.263 124.453 127.378 123.538Z",
			fill: "#EDEDED",
		},
		{
			d: "M147.988 44.8437L147.5 45L148.962 45.4651C155.294 47.4798 161.861 48.66 168.498 48.9761C168.83 48.9919 169.163 48.9534 169.483 48.8619L172.5 48L174 47.5L164.419 45.4172C163.158 45.1431 161.982 44.5687 160.991 43.7426C160.218 43.0981 160.223 41.9084 161.002 41.2708L162.423 40.1084C164.12 38.7197 165.493 36.976 166.444 35C160.934 39.3642 154.682 42.6988 147.988 44.8437Z",
			fill: "#B2B2B2",
		},
		{
			d: "M202.776 219.428L72.2905 452.693C71.643 453.851 70.0687 454.069 69.1308 453.131L66.5 450.5L55.5 438L48.4888 428.927C41.8407 420.323 35.9052 411.192 30.7414 401.624L29.7434 399.775C24.2581 389.611 19.6635 378.991 16.0112 368.034L12.5 357.5C7.22519 338.379 6.01447 318.365 8.94583 298.747L9.06961 297.919C10.354 289.323 12.4034 280.86 15.1935 272.629L21 255.5L25.3334 246.385C32.0537 232.249 41.3193 219.472 52.6669 208.691L58.1719 203.462C69.5529 192.65 83.3937 184.769 98.5 180.5C94.967 181.498 91.3608 182.216 87.7149 182.647L80.5 183.5L75 184L69 185L63 185.561L59 186L56.1186 186.18C55.1927 186.238 54.7576 185.057 55.4998 184.5L55.5002 184.5L59.5273 182.57C72.5066 176.351 83.1766 166.172 90 153.5L94.4475 146.562C99.7511 138.288 106.807 131.28 115.116 126.032L116.833 124.948C119.935 122.989 123.246 121.384 126.705 120.163L142.446 114.607C145.348 113.583 147.69 111.39 148.903 108.561L149.143 108C149.705 106.687 149.932 105.255 149.803 103.833C149.608 101.689 148.616 99.6966 147.023 98.2485L144.256 95.7328C144.086 95.5779 143.93 95.4073 143.792 95.2232L126 71.5L111.803 51.9315C108.994 48.0592 107.359 43.4599 107.094 38.6832C107.051 37.9263 107.836 37.4015 108.52 37.7295L123.881 45.1028C137.174 51.4834 152.33 52.825 166.537 48.8786C169.84 47.9612 173.214 47.3242 176.624 46.9745L183.675 46.2513C201.406 44.4328 219.32 45.9054 236.516 50.5953L238 51L254.798 57.0472C275.869 64.6329 292.567 81.0571 300.5 102L304.022 115.734C305.004 119.567 306.392 123.285 308.162 126.824C312.321 135.142 318.495 142.289 326.121 147.613L335.084 153.87C339.023 156.62 343.157 159.078 347.453 161.227L367.289 171.145C368.178 171.589 368.444 172.732 367.843 173.523C362.372 180.721 355.148 186.395 346.859 190.005L335.371 195.008C330.797 197 326.081 198.65 321.262 199.945L312.822 202.212C300.992 205.39 288.796 207 276.546 207H256.333C252.148 207 248.001 206.213 244.108 204.679C228.581 198.562 210.923 204.863 202.776 219.428Z",
			fill: "white",
		},
		{
			d: "M271.185 135.316L279.987 135.418C281.182 135.432 281.452 133.748 280.312 133.388C278.441 132.797 276.623 132.048 274.879 131.15L268.008 127.61C263.35 125.211 258.969 122.308 254.944 118.953L253.592 117.827C250.54 115.283 247.77 112.418 245.33 109.282L243.768 107.273C243.234 106.586 242.134 107.005 242.192 107.873C243.212 123.186 255.839 135.138 271.185 135.316Z",
			fill: "#666666",
		},
		{
			d: "M82.2231 456.395L231.313 323.4C245.367 310.863 257.58 296.403 267.59 280.45L268.5 279C273.404 269.192 275.497 258.217 274.547 247.293L273.24 232.258C272.436 223.009 268.618 214.28 262.373 207.41C262.131 207.144 261.81 206.961 261.457 206.889L237.5 202C220.117 196.752 201.688 195.995 183.933 199.8L183 200L169.06 203.259C128.405 212.763 92.5742 236.685 68.2116 270.592L67.597 271.447C60.8846 280.789 55.1822 290.817 50.5856 301.362L49.765 303.245C38.1544 329.881 34.2409 359.238 38.4684 387.985L39.8511 397.387C41.2751 407.07 44.1931 416.474 48.5011 425.262C52.4798 433.379 57.6014 440.883 63.7095 447.547L71.3177 455.847C74.1911 458.981 79.0498 459.225 82.2231 456.395Z",
			fill: "#CCCCCC",
		},
		{
			d: "M212.749 278.858L212.267 279.133C199.686 286.322 192.918 299.892 193.58 314.367C193.768 318.484 197.893 322.255 201.858 321.132L209.163 319.062C218.607 316.386 227.353 311.681 234.789 305.274L256 287L262.292 282.343C298.871 255.269 344.833 244.113 389.754 251.405C391.14 251.63 391.184 253.607 389.81 253.894L384.5 255L382.093 255.842C377.15 257.572 372.856 260.776 369.79 265.022C369.214 265.819 369.982 266.89 370.922 266.601L372.663 266.065C382.467 263.049 392.751 261.904 402.978 262.691L407 263C428.843 263.95 449.114 274.626 462.254 292.1L467.179 298.65C481.776 318.063 487.953 342.53 484.319 366.545L482.421 379.087C479.837 396.163 473.618 412.486 464.184 426.952L463.5 428L453 442L441.5 455L430.965 465.114C421.346 474.348 410.827 482.597 399.567 489.738L396 492L389.175 495.25C387.417 496.087 385.95 493.678 387.5 492.5L397 483.5L398.953 481.449C404.232 475.906 408.027 469.12 409.986 461.721L410.889 458.309C411.295 456.776 411.5 455.174 411.5 453.588C411.5 444.909 405.354 437.298 396.836 435.631C391.554 434.597 386.085 435.962 381.907 439.356L372.5 447L355.894 460.587C344.995 469.504 333.185 477.245 320.66 483.682L303.5 492.5L274.5 503.5L268.412 505.16C257.822 508.049 247.012 510.06 236.092 511.174L228 512H202L167.5 508.25L148.832 504.21C138.985 502.079 129.456 498.682 120.482 494.103C113.181 490.378 106.293 485.894 99.931 480.725L85.5 469C68.005 455.64 57.0449 435.448 55.3749 413.498L54.5 402L55.5295 385.822C57.134 360.608 66.7911 336.576 83.0792 317.263C89.6652 309.454 97.2376 302.534 105.606 296.675L108.677 294.526C121.458 285.579 135.72 278.961 150.805 274.976L160.947 272.297C174.135 268.813 187.952 268.445 201.307 271.22L211.887 273.418C214.542 273.97 215.103 277.513 212.749 278.858Z",
			fill: "#5E5E5E",
		},
	],
};

export const FRAMEWORK_SLUGS = [
	"nextjs",
	"express",
	"nestjs",
	"fastify",
	"elysia",
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
	icon: BrandIcon;
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
		slug: "elysia",
		name: "Elysia",
		shortDescription:
			"Send transactional email from Elysia routes on Bun with the official Node.js SDK.",
		languageSlug: "nodejs",
		languageName: "Node.js",
		installCommand: "bun add reloop-email",
		packageName: "reloop-email",
		docsPath: "/docs/quickstart/nodejs",
		icon: elysiaIcon,
		runtimeHint: "Bun · TypeScript · Eden",
		highlights: ["Bun", "TypeScript", "Eden"],
		sendCode: `import { Elysia } from 'elysia';
import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

const app = new Elysia()
  .post('/send', async () => {
    const { data, error } = await reloop.emails.send({
      from: 'Acme <onboarding@yourdomain.com>',
      to: ['delivered@yourdomain.com'],
      subject: 'Hello from Elysia',
      html: '<strong>It works!</strong>',
    });

    if (error) throw error;
    return { id: data.id };
  })
  .listen(3000);

console.log(\`Listening on \${app.server?.hostname}:\${app.server?.port}\`);`,
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
