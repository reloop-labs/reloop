"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import {
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
	siServerless,
} from "simple-icons";

type SdkOption = {
	id: string;
	name: string;
	icon: any; // Using simple-icons object type
	color: string;
	install?: string;
	code: string;
	subTabs?: { id: string; name: string; code: string }[];
};

const sdks: SdkOption[] = [
	{
		id: "node",
		name: "Node.js",
		icon: siNodedotjs,
		color: "#F5CE4D",
		install: "npm install reloop-email
		subTabs: [
			{
				id: "node",
				name: "Node.js",
				code: `import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxx');

(async function() {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'delivered@resend.dev',
    subject: 'Hello World',
    html: '<strong>it works!</strong>'
  });

  if (error) {
    return console.log(error);
  }

  console.log(data);
})();`,
			},
			{
				id: "nextjs",
				name: "Next.js",
				code: `// apps/web/app/api/send/route.ts
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/EmailTemplate';

const resend = new Resend('re_xxxxxxxx');

export async function POST() {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'delivered@resend.dev',
    subject: 'Hello World',
    react: EmailTemplate({ firstName: 'John' }),
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json(data);
}`,
			},
		],
		code: "", // Placeholder
	},
	{
		id: "serverless",
		name: "Serverless",
		icon: siServerless,
		color: "#000000",
		code: `// Cloudflare Workers example
import { Resend } from 'resend';

export default {
  async fetch(request, env) {
    const resend = new Resend(env.RESEND_API_KEY);
    return await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'user@example.com',
      subject: 'Serverless Email',
      text: 'Hello from the edge!'
    });
  }
};`,
	},
	{
		id: "go",
		name: "Go",
		icon: siGo,
		color: "#00ADD8",
		code: `package main

import (
  "fmt"
  "github.com/resend/resend-go/v2"
)

func main() {
  client := resend.NewClient("re_xxxxxxxx")

  params := &resend.SendEmailRequest{
    From:    "onboarding@resend.dev",
    To:      []string{"delivered@resend.dev"},
    Subject: "Hello World",
    Html:    "<strong>it works!</strong>",
  }

  sent, err := client.Emails.Send(params)
  if err != nil {
    fmt.Println(err.Error())
    return
  }
  fmt.Println(sent.Id)
}`,
	},
	{
		id: "python",
		name: "Python",
		icon: siPython,
		color: "#3776AB",
		code: `import resend

resend.api_key = "re_xxxxxxxx"

params = {
    "from": "onboarding@resend.dev",
    "to": "delivered@resend.dev",
    "subject": "Hello World",
    "html": "<strong>it works!</strong>",
}

email = resend.Emails.send(params)
print(email)`,
	},
	{
		id: "ruby",
		name: "Ruby",
		icon: siRuby,
		color: "#CC342D",
		code: `require 'resend'

Resend.api_key = 're_xxxxxxxx'

params = {
  "from": "onboarding@resend.dev",
  "to": "delivered@resend.dev",
  "subject": "Hello World",
  "html": "<strong>it works!</strong>"
}

Resend::Emails.send(params)`,
	},
	{
		id: "php",
		name: "PHP",
		icon: siPhp,
		color: "#777BB4",
		code: `<?php

$resend = Resend::client('re_xxxxxxxx');

$resend->emails->send([
  'from' => 'onboarding@resend.dev',
  'to' => 'delivered@resend.dev',
  'subject' => 'Hello World',
  'html' => '<strong>it works!</strong>',
]);`,
	},
	{
		id: "rust",
		name: "Rust",
		icon: siRust,
		color: "#000000",
		code: `use resend_rs::Resend;

#[tokio::main]
async fn main() {
    let resend = Resend::new("re_xxxxxxxx");
    let email = resend.emails().send()
        .from("onboarding@resend.dev")
        .to("delivered@resend.dev")
        .subject("Hello from Rust")
        .html("<strong>It works!</strong>")
        .send()
        .await;
}`,
	},
];

const highlightCode = (code: string) => {
	const lines = code.split("\n");
	return lines.map((line, lineIndex) => {
		const patterns = [
			{ regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: "text-[#ce9178]" },
			{
				regex: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
				className: "text-[#6a9955]",
			},
			{
				regex:
					/\b(import|from|const|let|var|function|async|await|return|if|else|for|while|class|extends|new|this|package|func|type|interface|struct|public|private|static|final|try|catch|throw|use|namespace|require|def|print|async|await)\b/g,
				className: "text-[#569cd6]",
			},
			{ regex: /\b\d+\.?\d*\b/g, className: "text-[#b5cea8]" },
			{
				regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
				className: "text-[#dcdcaa]",
			},
		];

		const parts: Array<{ text: string; className?: string }> = [];
		let lastIndex = 0;
		const matches: Array<{ start: number; end: number; className: string }> =
			[];

		patterns.forEach((pattern) => {
			const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
			let match = regex.exec(line);
			while (match !== null) {
				matches.push({
					start: match.index,
					end: match.index + match[0].length,
					className: pattern.className,
				});
				match = regex.exec(line);
			}
		});

		matches.sort((a, b) => a.start - b.start);
		const mergedMatches: typeof matches = [];
		matches.forEach((match) => {
			if (
				!mergedMatches.some(
					(m) => !(match.end <= m.start || match.start >= m.end),
				)
			) {
				mergedMatches.push(match);
			}
		});

		mergedMatches.forEach((match) => {
			if (match.start > lastIndex) {
				parts.push({ text: line.slice(lastIndex, match.start) });
			}
			parts.push({
				text: line.slice(match.start, match.end),
				className: match.className,
			});
			lastIndex = Math.max(lastIndex, match.end);
		});

		if (lastIndex < line.length) {
			parts.push({ text: line.slice(lastIndex) });
		}
		if (parts.length === 0) {
			parts.push({ text: line });
		}

		return (
			<span key={lineIndex} className="block">
				{parts.map((part, partIndex) => (
					<span key={partIndex} className={part.className}>
						{part.text}
					</span>
				))}
				{line === "" && "\u00A0"}
			</span>
		);
	});
};

export default function CodeSnippet() {
	const [activeSdk, setActiveSdk] = useState<SdkOption>(sdks[0] as SdkOption);
	const [activeSubTab, setActiveSubTab] = useState<string | null>(
		activeSdk.subTabs ? activeSdk.subTabs[0]?.id || null : null,
	);

	const activeCode = activeSdk.subTabs
		? activeSdk.subTabs.find((t) => t.id === activeSubTab)?.code ||
			activeSdk.subTabs[0]?.code ||
			""
		: activeSdk.code;

	return (
		<div className="w-full">
			<div className="mx-auto max-w-5xl">
				{/* Language Grid */}
				<div className="mb-12 grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8">
					{sdks.map((sdk) => (
						<button
							key={sdk.id}
							type="button"
							onClick={() => {
								setActiveSdk(sdk);
								setActiveSubTab(
									sdk.subTabs ? sdk.subTabs[0]?.id || null : null,
								);
							}}
							className="group flex flex-col items-center gap-3"
						>
							<div
								className={`flex size-[68px] items-center justify-center rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ${
									activeSdk.id === sdk.id
										? "border-neutral-200 bg-white"
										: "border-transparent bg-transparent hover:border-neutral-200 hover:bg-white"
								}`}
							>
								<svg
									viewBox="0 0 24 24"
									fill={activeSdk.id === sdk.id ? sdk.color : "currentColor"}
									className={`size-7 transition-all duration-300 group-hover:scale-110 ${
										activeSdk.id !== sdk.id &&
										"text-neutral-400 group-hover:text-neutral-600"
									}`}
								>
									<path d={sdk.icon.path} />
								</svg>
							</div>
							<span
								className={`font-medium text-[12.5px] transition-colors ${
									activeSdk.id === sdk.id ? "text-zinc-900" : "text-zinc-400"
								}`}
							>
								{sdk.name}
							</span>
						</button>
					))}
				</div>

				{/* Terminal Window */}
				<div className="overflow-hidden rounded-xl border border-zinc-200 bg-[#0a0a0a] shadow-2xl">
					{/* Sub Tabs */}
					<div className="flex items-center justify-between border-white/5 border-b bg-white/[0.02] px-4 py-2">
						<div className="flex gap-2">
							{activeSdk.subTabs ? (
								activeSdk.subTabs.map((tab) => (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveSubTab(tab.id)}
										className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-[12.5px] transition-all ${
											activeSubTab === tab.id
												? "bg-white/10 text-white"
												: "text-white/40 hover:text-white/60"
										}`}
									>
										<span className="text-white/20">#</span>
										{tab.name}
									</button>
								))
							) : (
								<div className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-[12.5px] text-white/40">
									<span className="text-white/20">#</span>
									{activeSdk.name}
								</div>
							)}
						</div>
						<button
							type="button"
							onClick={() => navigator.clipboard.writeText(activeCode)}
							className="rounded-lg p-2 text-white/20 transition-all hover:bg-white/5 hover:text-white/40"
						>
							<Icon name="clipboard-copy" className="size-4" />
						</button>
					</div>

					{/* Code Area */}
					<div className="flex overflow-x-auto p-2">
						<div className="flex-1 overflow-hidden">
							<div className="flex">
								{/* Line Numbers */}
								<div className="sticky left-0 flex select-none flex-col items-end gap-0.5 px-4 py-4 font-mono text-[13px] text-white/10">
									{activeCode.split("\n").map((_, i) => (
										<span key={i}>{i + 1}</span>
									))}
								</div>
								{/* Code */}
								<pre className="flex-1 px-4 py-4 font-mono text-[#d4d4d4] text-[13.5px] leading-relaxed">
									<code>{highlightCode(activeCode)}</code>
								</pre>
							</div>
						</div>
					</div>

					{/* Terminal Footer */}
					<div className="flex items-center gap-6 border-white/5 border-t bg-white/[0.01] px-6 py-3.5">
						<a
							href="https://github.com/resend/resend-node"
							target="_blank"
							rel="noreferrer"
							className="flex items-center gap-2 text-[12.5px] text-white/30 transition-colors hover:text-white/60"
						>
							<Icon name="social-github" className="size-3.5 opacity-50" />
							View on GitHub
						</a>
						<button
							type="button"
							className="flex items-center gap-2 text-[12.5px] text-white/30 transition-colors hover:text-white/60"
						>
							<Icon name="download" className="size-3.5 opacity-50" />
							Download ZIP
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
