"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siGo, siNodedotjs, siPython } from "simple-icons";

// Types
type Language = "node" | "python" | "go" | "curl";
type EmailEvent = "welcome" | "reset" | "receipt";

interface CodeTemplates {
	node: string;
	python: string;
	go: string;
	curl: string;
}

const templates: Record<EmailEvent, CodeTemplates> = {
	welcome: {
		node: `import { Reloop } from '@reloop/sdk';

const reloop = new Reloop('rl_live_7x893k02j');

const { data, error } = await reloop.emails.send({
  from: 'Welcome <onboarding@yourdomain.com>',
  to: 'newuser@gmail.com',
  subject: 'Welcome to Reloop!',
  html: '<h1>Welcome aboard, Jane!</h1>',
  tags: { category: 'welcome_series' }
});`,
		python: `from reloop import Reloop

reloop = Reloop("rl_live_7x893k02j")

response = reloop.emails.send(
    sender="Welcome <onboarding@yourdomain.com>",
    to="newuser@gmail.com",
    subject="Welcome to Reloop!",
    html="<h1>Welcome aboard, Jane!</h1>",
    tags={"category": "welcome_series"}
)`,
		go: `package main

import (
	"fmt"
	"github.com/reloop/reloop-go"
)

func main() {
	client := reloop.NewClient("rl_live_7x893k02j")

	params := &reloop.SendEmailRequest{
		From:    "Welcome <onboarding@yourdomain.com>",
		To:      []string{"newuser@gmail.com"},
		Subject: "Welcome to Reloop!",
		Html:    "<h1>Welcome aboard, Jane!</h1>",
	}

	sent, _ := client.Emails.Send(params)
	fmt.Println(sent.Id)
}`,
		curl: `curl -X POST https://api.reloop.dev/v1/emails \
  -H "Authorization: Bearer rl_live_7x893k02j" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Welcome <onboarding@yourdomain.com>",
    "to": ["newuser@gmail.com"],
    "subject": "Welcome to Reloop!",
    "html": "<h1>Welcome aboard, Jane!</h1>"
  }'`,
	},
	reset: {
		node: `import { Reloop } from '@reloop/sdk';

const reloop = new Reloop('rl_live_7x893k02j');

const { data, error } = await reloop.emails.send({
  from: 'Security <auth@yourdomain.com>',
  to: 'user@example.com',
  subject: 'Reset your password',
  html: '<p>Click <a href="...">here</a> to reset password</p>',
  headers: { 'X-Entity-ID': 'user_8391' }
});`,
		python: `from reloop import Reloop

reloop = Reloop("rl_live_7x893k02j")

response = reloop.emails.send(
    sender="Security <auth@yourdomain.com>",
    to="user@example.com",
    subject="Reset your password",
    html="<p>Click <a href='...'>here</a> to reset password</p>",
    headers={"X-Entity-ID": "user_8391"}
)`,
		go: `package main

import (
	"fmt"
	"github.com/reloop/reloop-go"
)

func main() {
	client := reloop.NewClient("rl_live_7x893k02j")

	params := &reloop.SendEmailRequest{
		From:    "Security <auth@yourdomain.com>",
		To:      []string{"user@example.com"},
		Subject: "Reset your password",
		Html:    "<p>Click <a href='...'>here</a> to reset password</p>",
	}

	sent, _ := client.Emails.Send(params)
	fmt.Println(sent.Id)
}`,
		curl: `curl -X POST https://api.reloop.dev/v1/emails \
  -H "Authorization: Bearer rl_live_7x893k02j" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Security <auth@yourdomain.com>",
    "to": ["user@example.com"],
    "subject": "Reset your password",
    "html": "<p>Click <a href=\"...\">here</a> to reset password</p>"
  }'`,
	},
	receipt: {
		node: `import { Reloop } from '@reloop/sdk';

const reloop = new Reloop('rl_live_7x893k02j');

const { data, error } = await reloop.emails.send({
  from: 'Billing <receipts@yourdomain.com>',
  to: 'customer@gmail.com',
  subject: 'Your receipt for Order #39281',
  html: '<strong>Thanks for your purchase!</strong>'
});`,
		python: `from reloop import Reloop

reloop = Reloop("rl_live_7x893k02j")

response = reloop.emails.send(
    sender="Billing <receipts@yourdomain.com>",
    to="customer@gmail.com",
    subject="Your receipt for Order #39281",
    html="<strong>Thanks for your purchase!</strong>"
)`,
		go: `package main

import (
	"fmt"
	"github.com/reloop/reloop-go"
)

func main() {
	client := reloop.NewClient("rl_live_7x893k02j")

	params := &reloop.SendEmailRequest{
		From:    "Billing <receipts@yourdomain.com>",
		To:      []string{"customer@gmail.com"},
		Subject: "Your receipt for Order #39281",
		Html:    "<strong>Thanks for your purchase!</strong>",
	}

	sent, _ := client.Emails.Send(params)
	fmt.Println(sent.Id)
}`,
		curl: `curl -X POST https://api.reloop.dev/v1/emails \
  -H "Authorization: Bearer rl_live_7x893k02j" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Billing <receipts@yourdomain.com>",
    "to": ["customer@gmail.com"],
    "subject": "Your receipt for Order #39281",
    "html": "<strong>Thanks for your purchase!</strong>"
  }'`,
	},
};

const highlightCode = (code: string) => {
	const lines = code.split("\n");
	return lines.map((line, lineIndex) => {
		const patterns = [
			{ regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: "text-amber-200/90" }, // Strings
			{ regex: /(\/\/.*$|#.*$)/gm, className: "text-zinc-500 italic" }, // Comments
			{
				regex:
					/\b(import|from|const|let|var|function|async|await|return|if|else|package|func|type|import|struct|func|interface|import|def|class)\b/g,
				className: "text-violet-400 font-semibold",
			}, // Keywords
			{ regex: /\b\d+\b/g, className: "text-cyan-400" }, // Numbers
			{ regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, className: "text-emerald-300" }, // Functions
		];

		const parts: Array<{ text: string; className?: string }> = [];
		let lastIndex = 0;
		const matches: Array<{ start: number; end: number; className: string }> = [];

		for (const pattern of patterns) {
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
		}

		matches.sort((a, b) => a.start - b.start);
		const mergedMatches: typeof matches = [];
		for (const match of matches) {
			if (
				!mergedMatches.some(
					(m) => !(match.end <= m.start || match.start >= m.end),
				)
			) {
				mergedMatches.push(match);
			}
		}

		for (const match of mergedMatches) {
			if (match.start > lastIndex) {
				parts.push({ text: line.slice(lastIndex, match.start) });
			}
			parts.push({
				text: line.slice(match.start, match.end),
				className: match.className,
			});
			lastIndex = Math.max(lastIndex, match.end);
		}

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

const TransactionEmailsPage = () => {
	const [activeLang, setActiveLang] = useState<Language>("node");
	const [activeEvent, setActiveEvent] = useState<EmailEvent>("welcome");
	const [simulationState, setSimulationState] = useState<"idle" | "sending" | "success">("idle");
	const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
	const [copied, setCopied] = useState(false);

	const activeCode = templates[activeEvent][activeLang];

	const handleCopy = () => {
		navigator.clipboard.writeText(activeCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const triggerSimulation = () => {
		if (simulationState === "sending") return;

		setSimulationState("sending");
		setSimulationLogs([]);

		const logs = [
			"Initializing transaction request...",
			"Resolving endpoint api.reloop.dev...",
			"API authentication successful: Key verified.",
			"Applying auto-DKIM & SPF signature (d=yourdomain.com)...",
			"Suppression list checked. Recipient status: Active.",
			"Sending handshake to target MX server (gmail-smtp-in.l.google.com)...",
			"Transaction completed! 200 OK. Response Time: 11ms.",
		];

		let logIndex = 0;
		const interval = setInterval(() => {
			if (logIndex < logs.length) {
				setSimulationLogs((prev) => [...prev, logs[logIndex] as string]);
				logIndex++;
			} else {
				clearInterval(interval);
				setSimulationState("success");
			}
		}, 600);
	};

	return (
		<div className="relative min-h-screen bg-white text-[#0a0d12] selection:bg-neutral-200 overflow-x-hidden font-sans">
			{/* Dark Hero Section (Aligned with Home Page Hero) */}
			<section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#05070b] text-white py-24 sm:py-32">
				{/* Background Grid Pattern */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] pointer-events-none" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

				<div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
					<p className="font-semibold text-white/40 text-[11px] uppercase tracking-[0.16em]">
						Product / Transaction Emails
					</p>

					<h1 className="mt-6 font-semibold text-[2.8rem] leading-[1.05] tracking-tighter drop-shadow-[0_10px_34px_rgba(0,0,0,0.32)] sm:text-[4.2rem] bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
						Programmatic Email Delivery <br />
						For Developers
					</h1>

					<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-white/50 leading-relaxed sm:text-[17px]">
						High-performance transactional email delivery engine. Built for
						sub-15ms latency, SPF/DKIM verification safety-nets, and complete
						visibility of your delivery logs.
					</p>

					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<Link
							href="/dashboard/signup"
							className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-white/92"
						>
							Start for free
						</Link>
						<a
							href="#playground"
							className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/18 bg-black/16 px-8 font-semibold text-[15px] text-white backdrop-blur-sm transition-colors hover:bg-black/24"
						>
							Try Sandbox
						</a>
					</div>
				</div>
			</section>

			{/* Interactive Sandbox Section (Light Theme matching Features) */}
			<section id="playground" className="bg-white py-24 sm:py-32 scroll-mt-10">
				<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
							DevEx Playground
						</p>
						<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
							Interactive Sandbox
						</h2>
						<p className="mx-auto mt-6 max-w-[620px] text-[#0a0d12]/60 text-[15px] leading-relaxed sm:text-[17px]">
							Choose your client environment, edit the payload, and trigger a test transmission to trace delivery performance in real-time.
						</p>
					</div>

					<div className="rounded-2xl border border-[#0a0d12]/8 bg-zinc-50/30 p-6 md:p-8 backdrop-blur-xl shadow-sm">
						<div className="flex flex-col gap-8 lg:flex-row">
							{/* Sandbox Editor (Left Side) */}
							<div className="flex-1 flex flex-col min-w-0">
								<div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0a0d12]/5 pb-4">
									{/* Language Selector */}
									<div className="flex gap-1 p-1 rounded-xl bg-[#0a0d12]/4 border border-[#0a0d12]/6">
										{(["node", "python", "go", "curl"] as Language[]).map((lang) => {
											const isSelected = activeLang === lang;
											return (
												<button
													key={lang}
													type="button"
													onClick={() => setActiveLang(lang)}
													className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
														isSelected
															? "bg-white text-[#0a0d12] shadow-sm"
															: "text-[#0a0d12]/40 hover:text-[#0a0d12]/70"
													}`}
												>
													{lang === "node" && (
														<svg viewBox="0 0 24 24" className="size-3.5 fill-current">
															<path d={siNodedotjs.path} />
														</svg>
													)}
													{lang === "python" && (
														<svg viewBox="0 0 24 24" className="size-3.5 fill-current">
															<path d={siPython.path} />
														</svg>
													)}
													{lang === "go" && (
														<svg viewBox="0 0 24 24" className="size-3.5 fill-current">
															<path d={siGo.path} />
														</svg>
													)}
													{lang === "curl" && (
														<Icon name="laptop" className="size-3.5" />
													)}
													<span className="capitalize">
														{lang === "node" ? "Node.js" : lang}
													</span>
												</button>
											);
										})}
									</div>

									{/* Event Selector */}
									<div className="flex gap-1 p-1 rounded-xl bg-[#0a0d12]/4 border border-[#0a0d12]/6">
										{(["welcome", "reset", "receipt"] as EmailEvent[]).map((evt) => {
											const isSelected = activeEvent === evt;
											return (
												<button
													key={evt}
													type="button"
													onClick={() => setActiveEvent(evt)}
													className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
														isSelected
															? "bg-[#0a0d12] text-white"
															: "text-[#0a0d12]/40 hover:text-[#0a0d12]/70"
													}`}
												>
													<span className="capitalize">
														{evt === "welcome"
															? "Welcome"
															: evt === "reset"
																? "Password Reset"
																: "Receipt"}
													</span>
												</button>
											);
										})}
									</div>
								</div>

								{/* Code Snippet Box */}
								<div className="mt-4 flex-1 flex flex-col rounded-xl border border-zinc-200 bg-[#0a0a0a] overflow-hidden font-mono text-[13px] leading-relaxed shadow-lg">
									<div className="flex items-center justify-between border-white/5 border-b bg-white/[0.02] px-4 py-2 text-xs text-white/40">
										<span>request.js</span>
										<button
											type="button"
											onClick={handleCopy}
											className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-white/5 hover:text-white transition-colors"
										>
											<Icon name="copy" className="size-3.5" />
											{copied ? "Copied" : "Copy"}
										</button>
									</div>
									<div className="flex-1 overflow-x-auto p-4 max-h-[300px]">
										<pre className="text-white/80">
											<code>{highlightCode(activeCode)}</code>
										</pre>
									</div>
								</div>

								{/* Send Simulator Trigger */}
								<div className="mt-4 flex items-center gap-4">
									<button
										type="button"
										onClick={triggerSimulation}
										disabled={simulationState === "sending"}
										className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[14px] text-white transition-colors hover:bg-[#0a0d12]/90 disabled:bg-[#0a0d12]/50 disabled:pointer-events-none active:scale-[0.98]"
									>
										<Icon name="send-2" className="size-4 mr-2" />
										{simulationState === "sending"
											? "Sending request..."
											: simulationState === "success"
												? "Trigger Another Send"
												: "Trigger API Call"}
									</button>

									{simulationState === "success" && (
										<span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold animate-fade-in">
											<Icon name="check-circle" className="size-4" />
											Delivered in 11ms
										</span>
									)}
								</div>
							</div>

							{/* Sandbox Logs & Preview (Right Side) */}
							<div className="w-full lg:w-[460px] flex flex-col gap-4">
								{/* Mock Email Preview */}
								<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
									<div className="flex items-center gap-2 border-b border-zinc-100 pb-3 mb-3 text-xs text-[#0a0d12]/40 font-mono">
										<span className="size-2.5 rounded-full bg-[#0a0d12]/10" />
										<span>Inbox Preview</span>
									</div>

									<div className="rounded-lg border border-zinc-100 p-4 min-h-[220px] flex flex-col justify-between">
										{activeEvent === "welcome" && (
											<div>
												<div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-2">
													<div className="h-6 w-6 rounded bg-[#0a0d12] flex items-center justify-center text-white text-[10px] font-bold">
														R
													</div>
													<span className="font-semibold text-xs text-neutral-800">Reloop Onboarding</span>
												</div>
												<h3 className="font-bold text-base text-neutral-950">Welcome aboard, Jane!</h3>
												<p className="mt-2 text-xs text-neutral-600 leading-relaxed">
													Thanks for creating a Reloop account. We are excited to help you manage and scale your programmatic communications. Let's send your first API call!
												</p>
												<div className="mt-4 inline-block bg-[#0a0d12] text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-md">
													Get Started
												</div>
											</div>
										)}

										{activeEvent === "reset" && (
											<div>
												<div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-2">
													<div className="h-6 w-6 rounded bg-[#0a0d12] flex items-center justify-center text-white text-[10px] font-bold">
														S
													</div>
													<span className="font-semibold text-xs text-neutral-800">Security Team</span>
												</div>
												<h3 className="font-bold text-base text-neutral-950">Reset your password</h3>
												<p className="mt-2 text-xs text-neutral-600 leading-relaxed">
													We received a request to reset the password for your account. If you did not make this request, you can ignore this email safely.
												</p>
												<div className="mt-4 inline-block bg-neutral-900 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-md">
													Reset Password
												</div>
											</div>
										)}

										{activeEvent === "receipt" && (
											<div>
												<div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-2">
													<div className="flex items-center gap-2">
														<div className="h-6 w-6 rounded bg-[#0a0d12] flex items-center justify-center text-white text-[10px] font-bold">
															B
														</div>
														<span className="font-semibold text-xs text-neutral-800">Billing Service</span>
													</div>
													<span className="text-neutral-400 text-[10px]">Order #39281</span>
												</div>
												<h3 className="font-bold text-base text-neutral-950">Payment Receipt</h3>
												<div className="mt-3 space-y-1.5 border-t border-b border-neutral-100 py-2.5">
													<div className="flex justify-between text-[11px]">
														<span className="text-neutral-500">Reloop Pro (1 Month)</span>
														<span className="font-semibold text-neutral-900">$19.00</span>
													</div>
													<div className="flex justify-between text-[11px]">
														<span className="text-neutral-500">Tax</span>
														<span className="font-semibold text-neutral-900">$0.00</span>
													</div>
												</div>
												<div className="flex justify-between text-xs font-bold text-neutral-950 mt-2.5">
													<span>Total paid</span>
													<span>$19.00</span>
												</div>
											</div>
										)}

										<div className="border-t border-neutral-100 pt-3 mt-4 text-[9px] text-neutral-400 flex items-center justify-between">
											<span>Reloop Inc, Delaware</span>
											<span>Unsubscribe</span>
										</div>
									</div>
								</div>

								{/* Delivery execution trace logs */}
								<div className="flex-1 rounded-xl border border-zinc-200 bg-[#0a0a0a] p-4 font-mono text-[11px] leading-relaxed flex flex-col justify-between min-h-[160px] shadow-sm">
									<div>
										<div className="flex items-center justify-between border-white/5 border-b pb-2 mb-2 text-white/40">
											<span>Delivery Logs Simulator</span>
											<span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
										</div>
										<div className="space-y-1 text-white/70 max-h-[140px] overflow-y-auto">
											{simulationLogs.length === 0 && (
												<span className="text-white/20">Click "Trigger API Call" to watch execution trace.</span>
											)}
											{simulationLogs.map((log, index) => (
												<motion.div
													initial={{ opacity: 0, x: -5 }}
													animate={{ opacity: 1, x: 0 }}
													key={index}
													className={
														log.includes("200 OK")
															? "text-emerald-400 font-semibold"
															: log.includes("authentication successful")
																? "text-indigo-300"
																: ""
													}
												>
													&gt; {log}
												</motion.div>
											))}
										</div>
									</div>

									{simulationState === "success" && (
										<div className="border-t border-white/5 pt-2 mt-2 flex justify-between text-white/40 text-[10px]">
											<span>Status: Delivered</span>
											<span>Latency: 11ms</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Specs Bento Grid (Aligned with Features highlight style) */}
			<section className="bg-white py-24 sm:py-32 border-t border-[#0a0d12]/5">
				<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-20">
						<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
							Core Infrastructure
						</p>
						<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
							SMTP Relay &amp; HTTP APIs
						</h2>
						<p className="mt-4 max-w-xl mx-auto text-base text-[#0a0d12]/50">
							Connect using standard protocols. Run on a zero-latency, failover edge mesh network.
						</p>
					</div>

					<div className="grid gap-px overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-[#0a0d12]/8 sm:grid-cols-2 lg:grid-cols-3">
						{/* Card 1: Multi-Protocol */}
						<div className="col-span-1 lg:col-span-2 bg-white p-8 lg:p-10 flex flex-col justify-between hover:bg-zinc-50/50 transition-colors">
							<div>
								<div className="inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4 mb-6">
									<Icon name="arrow-swap" className="size-5 text-[#0a0d12]/60" />
								</div>
								<h3 className="font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px] mb-3">
									SMTP Relay &amp; HTTP REST API
								</h3>
								<p className="text-[#0a0d12]/56 text-[14px] leading-[1.7] max-w-md">
									Connect via lightweight client SDKs or point your existing mailers straight to our relays. Zero configuration migration required.
								</p>
							</div>

							<div className="mt-12 grid gap-4 grid-cols-2">
								<div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
									<div className="font-mono text-xs text-[#0a0d12]/40 mb-1">SMTP HOST</div>
									<div className="font-mono text-[13px] font-semibold text-[#0a0d12]">smtp.reloop.dev</div>
									<div className="font-mono text-[11px] text-[#0a0d12]/30 mt-1">Ports: 587 (TLS), 465 (SSL)</div>
								</div>
								<div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
									<div className="font-mono text-xs text-[#0a0d12]/40 mb-1">HTTP ENDPOINT</div>
									<div className="font-mono text-[13px] font-semibold text-[#0a0d12]">api.reloop.dev/v1</div>
									<div className="font-mono text-[11px] text-[#0a0d12]/30 mt-1">HTTPS POST /send</div>
								</div>
							</div>
						</div>

						{/* Card 2: Latency & SLA */}
						<div className="bg-white p-8 lg:p-10 flex flex-col justify-between hover:bg-zinc-50/50 transition-colors">
							<div>
								<div className="inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4 mb-6">
									<Icon name="graph-up" className="size-5 text-[#0a0d12]/60" />
								</div>
								<h3 className="font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px] mb-3">
									99.99% Global Uptime
								</h3>
								<p className="text-[#0a0d12]/56 text-[14px] leading-[1.7]">
									Reloop routes requests through distributed edge nodes. Built for failover safety during cloud zone anomalies.
								</p>
							</div>
							<div className="mt-12 flex items-end justify-between">
								<div>
									<div className="text-3xl font-bold text-[#0a0d12] tracking-tight">11.8ms</div>
									<div className="text-[11px] text-[#0a0d12]/40 mt-1">Average US-East Delivery</div>
								</div>
								{/* Mini Sparkline */}
								<svg className="h-8 w-20 text-emerald-500" viewBox="0 0 100 30" fill="none">
									<path
										d="M0 25 L15 24 L30 18 L45 20 L60 12 L75 14 L90 3 L100 5"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>

						{/* Card 3: SPF/DKIM */}
						<div className="bg-white p-8 lg:p-10 flex flex-col justify-between hover:bg-zinc-50/50 transition-colors">
							<div>
								<div className="inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4 mb-6">
									<Icon name="lock" className="size-5 text-[#0a0d12]/60" />
								</div>
								<h3 className="font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px] mb-3">
									Auto-SPF/DKIM Signing
								</h3>
								<p className="text-[#0a0d12]/56 text-[14px] leading-[1.7]">
									We analyze your domains dynamically and automatically apply SPF alignments, custom DKIM signing keys, and DMARC validations.
								</p>
							</div>
							<div className="mt-12 flex flex-wrap gap-2">
								<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-600 font-semibold border border-emerald-100">DKIM Checked</span>
								<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-600 font-semibold border border-emerald-100">SPF Alignment Pass</span>
							</div>
						</div>

						{/* Card 4: Suppression Sync Webhook */}
						<div className="col-span-1 lg:col-span-2 bg-white p-8 lg:p-10 flex flex-col justify-between hover:bg-zinc-50/50 transition-colors">
							<div>
								<div className="inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4 mb-6">
									<Icon name="webhook" className="size-5 text-[#0a0d12]/60" />
								</div>
								<h3 className="font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px] mb-3">
									Suppression List Webhooks
								</h3>
								<p className="text-[#0a0d12]/56 text-[14px] leading-[1.7] max-w-md">
									Instantly alerts your app webhooks if an address bounces or triggers a spam report, protecting your active mailing list quality.
								</p>
							</div>

							<div className="mt-12 font-mono text-[11px] rounded-xl bg-[#0a0a0a] p-4 space-y-1 shadow-inner">
								<div className="flex justify-between text-white/30 border-b border-white/5 pb-2 mb-2">
									<span>WEBHOOK DISPATCH</span>
									<span className="text-emerald-400">ACTIVE</span>
								</div>
								<div className="flex justify-between text-violet-400">
									<span>POST https://yoursite.com/webhooks/reloop</span>
									<span className="text-emerald-400">200 OK</span>
								</div>
								<div className="text-white/40">
									&#123; "event": "email.bounced", "recipient": "user@aol.com", "code": 550 &#125;
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Start Guide Section (Alternating light gray bg-[#f8f8f8]) */}
			<section className="bg-[#f8f8f8] text-[#0a0d12] py-24 sm:py-32 border-t border-[#0a0d12]/5">
				<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-20">
						<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
							Get Started
						</p>
						<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
							Setup in 5 Minutes
						</h2>
						<p className="mt-4 max-w-xl mx-auto text-base text-[#0a0d12]/50">
							No sales calls or enterprise agreements. Build and send immediately.
						</p>
					</div>

					<div className="grid gap-px overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-[#0a0d12]/8 md:grid-cols-3">
						<div className="bg-white p-8 lg:p-10 flex flex-col justify-between">
							<div>
								<div className="size-8 rounded-lg bg-[#0a0d12] text-white flex items-center justify-center text-xs font-bold font-mono">1</div>
								<h3 className="mt-4 font-semibold text-lg text-[#0a0d12] leading-snug">Generate Credentials</h3>
								<p className="mt-4 text-[#0a0d12]/56 text-[14px] leading-[1.7]">
									Create an account, verify domain TXT records, and generate private API keys in the dashboard interface.
								</p>
							</div>
						</div>

						<div className="bg-white p-8 lg:p-10 flex flex-col justify-between">
							<div>
								<div className="size-8 rounded-lg bg-[#0a0d12] text-white flex items-center justify-center text-xs font-bold font-mono">2</div>
								<h3 className="mt-4 font-semibold text-lg text-[#0a0d12] leading-snug">Add Reloop SDK</h3>
								<p className="mt-4 text-[#0a0d12]/56 text-[14px] leading-[1.7]">
									Install our client library package into your local codebase dependencies:
									<code className="block mt-4 font-mono text-[11.5px] p-2 bg-[#0a0a0a] rounded text-violet-300 border border-white/5">
										npm install @reloop/sdk
									</code>
								</p>
							</div>
						</div>

						<div className="bg-white p-8 lg:p-10 flex flex-col justify-between">
							<div>
								<div className="size-8 rounded-lg bg-[#0a0d12] text-white flex items-center justify-center text-xs font-bold font-mono">3</div>
								<h3 className="mt-4 font-semibold text-lg text-[#0a0d12] leading-snug">Trigger Sends</h3>
								<p className="mt-4 text-[#0a0d12]/56 text-[14px] leading-[1.7]">
									Point calls to the endpoints using payload templates, and view live audit trails in the platform dashboard.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Banner Section (Light White bg-white) */}
			<section className="bg-white text-[#0a0d12] py-24 sm:py-32 border-t border-[#0a0d12]/5">
				<div className="mx-auto max-w-[920px] px-4 text-center">
					<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
						Start today
					</p>
					<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						3,000 emails for free
						<br />
						<span className="text-[#0a0d12]/40">per month.</span>
					</h2>
					<p className="mx-auto mt-8 max-w-[550px] font-medium text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[17px]">
						No credit card required. Connect your endpoints, optimize deliverability, and trigger emails at low-latency scale.
					</p>

					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<Link
							href="/login"
							className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90"
						>
							Get started
						</Link>
						<Link
							href="/docs"
							className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/10"
						>
							See pricing
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default TransactionEmailsPage;
