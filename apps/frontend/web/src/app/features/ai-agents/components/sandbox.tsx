"use client";

import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { siNodedotjs, siPython } from "simple-icons";

type Language = "node" | "python";
type AgentTemplate = "support" | "sales" | "ops";

interface CodeTemplates {
	node: string;
	python: string;
}

const templates: Record<AgentTemplate, CodeTemplates> = {
	support: {
		node: `import Reloop from 'reloop-email';

const reloop = new Reloop('rl_live_agent_key');

// Configure AI-Agent Mailbox with structured JSON schema
const mailbox = await reloop.mailboxes.create({
  address: 'support-agent@yourdomain.com',
  description: 'Automated Customer Support Handler',
  schema: {
    type: 'object',
    properties: {
      orderId: { type: 'string', description: 'Extracted order ID starting with #' },
      requestType: { type: 'string', enum: ['refund', 'tracking_status', 'general'] },
      customerSentiment: { type: 'string', enum: ['happy', 'neutral', 'angry'] }
    },
    required: ['orderId', 'requestType', 'customerSentiment']
  }
});

// Register Agent webhook target to handle parsed emails
await reloop.webhooks.register({
  mailboxId: mailbox.id,
  url: 'https://api.yourdomain.com/agents/support'
});`,
		python: `from reloop_email import Reloop

reloop = Reloop("rl_live_agent_key")

# Configure AI-Agent Mailbox with structured JSON schema
mailbox = reloop.mailboxes.create(
    address="support-agent@yourdomain.com",
    description="Automated Customer Support Handler",
    schema={
        "type": "object",
        "properties": {
            "orderId": {"type": "string", "description": "Extracted order ID starting with #"},
            "requestType": {"type": "string", "enum": ["refund", "tracking_status", "general"]},
            "customerSentiment": {"type": "string", "enum": ["happy", "neutral", "angry"]}
        },
        "required": ["orderId", "requestType", "customerSentiment"]
    }
)

# Register Agent webhook target to handle parsed emails
reloop.webhooks.register(
    mailbox_id=mailbox.id,
    url="https://api.yourdomain.com/agents/support"
)`,
	},
	sales: {
		node: `import Reloop from 'reloop-email';

const reloop = new Reloop('rl_live_agent_key');

// Configure AI-Agent Mailbox for sales lead qualification
const mailbox = await reloop.mailboxes.create({
  address: 'sales-agent@yourdomain.com',
  description: 'High-Volume Lead Qualification Assistant',
  schema: {
    type: 'object',
    properties: {
      companyName: { type: 'string' },
      estimatedVolume: { type: 'number', description: 'Emails per month' },
      bookingRequested: { type: 'boolean' }
    },
    required: ['companyName', 'estimatedVolume', 'bookingRequested']
  }
});

// Register webhook for lead score processing
await reloop.webhooks.register({
  mailboxId: mailbox.id,
  url: 'https://api.yourdomain.com/agents/sales-qualifier'
});`,
		python: `from reloop_email import Reloop

reloop = Reloop("rl_live_agent_key")

# Configure AI-Agent Mailbox for sales lead qualification
mailbox = reloop.mailboxes.create(
    address="sales-agent@yourdomain.com",
    description="High-Volume Lead Qualification Assistant",
    schema={
        "type": "object",
        "properties": {
            "companyName": {"type": "string"},
            "estimatedVolume": {"type": "number", "description": "Emails per month"},
            "bookingRequested": {"type": "boolean"}
        },
        "required": ["companyName", "estimatedVolume", "bookingRequested"]
    }
)

# Register webhook for lead score processing
reloop.webhooks.register(
    mailbox_id=mailbox.id,
    url="https://api.yourdomain.com/agents/sales-qualifier"
)`,
	},
	ops: {
		node: `import Reloop from 'reloop-email';

const reloop = new Reloop('rl_live_agent_key');

// Configure AI-Agent Mailbox for infrastructure alerts classification
const mailbox = await reloop.mailboxes.create({
  address: 'ops-agent@yourdomain.com',
  description: 'Automated Operations Incident Router',
  schema: {
    type: 'object',
    properties: {
      alertSeverity: { type: 'string', enum: ['critical', 'warning', 'info'] },
      incidentTarget: { type: 'string', description: 'Server or DB identifier' },
      metricSpike: { type: 'string' }
    },
    required: ['alertSeverity', 'incidentTarget']
  }
});

// Route high-severity triggers to pagerduty webhook
await reloop.webhooks.register({
  mailboxId: mailbox.id,
  url: 'https://api.yourdomain.com/agents/incident-routing'
});`,
		python: `from reloop_email import Reloop

reloop = Reloop("rl_live_agent_key")

# Configure AI-Agent Mailbox for infrastructure alerts classification
mailbox = reloop.mailboxes.create(
    address="ops-agent@yourdomain.com",
    description="Automated Operations Incident Router",
    schema={
        "type": "object",
        "properties": {
            "alertSeverity": {"type": "string", "enum": ["critical", "warning", "info"]},
            "incidentTarget": {"type": "string", "description": "Server or DB identifier"},
            "metricSpike": {"type": "string"}
        },
        "required": ["alertSeverity", "incidentTarget"]
    }
)

# Route high-severity triggers to pagerduty webhook
reloop.webhooks.register(
    mailbox_id=mailbox.id,
    url="https://api.yourdomain.com/agents/incident-routing"
)`,
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
					/\b(import|from|const|let|var|function|async|await|return|if|else|package|func|type|struct|interface|def|class)\b/g,
				className: "text-purple-400 font-semibold",
			}, // Keywords
			{ regex: /\b\d+\b/g, className: "text-cyan-400" }, // Numbers
			{
				regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
				className: "text-emerald-300",
			}, // Functions
		];

		const parts: Array<{ text: string; className?: string }> = [];
		let lastIndex = 0;
		const matches: Array<{ start: number; end: number; className: string }> =
			[];

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

export default function Sandbox() {
	const [activeLang, setActiveLang] = useState<Language>("node");
	const [activeTemplate, setActiveTemplate] =
		useState<AgentTemplate>("support");
	const [simulationState, setSimulationState] = useState<
		"idle" | "thinking" | "success"
	>("idle");
	const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
	const [copied, setCopied] = useState(false);

	const activeCode = templates[activeTemplate][activeLang];

	const handleCopy = () => {
		navigator.clipboard.writeText(activeCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const triggerSimulation = () => {
		if (simulationState === "thinking") return;

		setSimulationState("thinking");
		setSimulationLogs([]);

		let logs: string[] = [];

		if (activeTemplate === "support") {
			logs = [
				"Initializing secure MX gateway inbound tunnel...",
				"MIME parser completed: Extracted plain text & headers.",
				"Checking AI Guardrails: No prompt injections detected.",
				"Matching extracted JSON fields with mailbox schema...",
				"Schema matches! Extracted orderId: '#28391', sentiment: 'angry'.",
				"Database lookup: Order #28391 is in transit. ETA: Today 5 PM.",
				"Agent reasoning: Replying to client with delivery update.",
				"Outbound draft scanned by Content Guard: Approved.",
				"Dispatching outbound email via Reloop relay... (200 OK, 14ms)",
			];
		} else if (activeTemplate === "sales") {
			logs = [
				"Initializing secure MX gateway inbound tunnel...",
				"MIME parser completed: Extracted plain text & headers.",
				"Checking AI Guardrails: No prompt injections detected.",
				"Matching extracted JSON fields with mailbox schema...",
				"Schema matches! Extracted companyName: 'Acme Co', volume: 2000000.",
				"Agent reasoning: Lead qualifies for Enterprise level (>1M/mo).",
				"Calling internal sales CRM webhook... Done.",
				"Scheduling calendar assistant & drafting booking confirmation.",
				"Dispatching outbound email via Reloop relay... (200 OK, 12ms)",
			];
		} else {
			logs = [
				"Initializing secure MX gateway inbound tunnel...",
				"MIME parser completed: Extracted plain text & headers.",
				"Checking AI Guardrails: Input sanitized.",
				"Matching extracted JSON fields with mailbox schema...",
				"Schema matches! Extracted severity: 'critical', targetResource: 'pg-main-0'.",
				"Agent reasoning: Severity is 'critical'. Triggering PagerDuty routing webhook.",
				"PagerDuty webhook response: Incident log created.",
				"Drafting incident receipt back to monitoring system...",
				"Dispatching outbound email via Reloop relay... (200 OK, 15ms)",
			];
		}

		let logIndex = 0;
		const interval = setInterval(() => {
			if (logIndex < logs.length) {
				setSimulationLogs((prev) => [...prev, logs[logIndex] as string]);
				logIndex++;
			} else {
				clearInterval(interval);
				setSimulationState("success");
			}
		}, 500);
	};

	// Reset simulation when template changes
	useEffect(() => {
		setSimulationState("idle");
		setSimulationLogs([]);
	}, [activeTemplate]);

	return (
		<section id="playground" className="scroll-mt-10">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="mx-auto mb-16 max-w-3xl text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Interactive Sandbox
					</h2>
					<p className="mx-auto mt-6 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
						Select a preset agent, inspect the setup code, and simulate how
						Reloop parses incoming email into structured data to drive agent
						logic.
					</p>
				</div>

				<div className="rounded-4xl border border-stroke-soft-200 bg-bg-weak-50 p-6 shadow-sm md:p-8 dark:border-white/10">
					<div className="flex flex-col gap-8 lg:flex-row">
						{/* Sandbox Editor & Inputs (Left Side) */}
						<div className="flex min-w-0 flex-1 flex-col">
							<div className="flex flex-col gap-4 border-stroke-soft-200 border-b pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
								{/* Agent Type Selector */}
								<div className="flex gap-1 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-1 dark:border-white/10">
									{(["support", "sales", "ops"] as AgentTemplate[]).map(
										(tpl) => {
											const isSelected = activeTemplate === tpl;
											return (
												<button
													key={tpl}
													type="button"
													onClick={() => setActiveTemplate(tpl)}
													className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
														isSelected
															? "bg-bg-white-0 text-text-strong-950 shadow-sm dark:bg-white dark:text-black"
															: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
													}`}
												>
													<span className="capitalize">
														{tpl === "support"
															? "Support Agent"
															: tpl === "sales"
																? "Sales Qualifier"
																: "Operations Router"}
													</span>
												</button>
											);
										},
									)}
								</div>

								{/* Language Selector */}
								<div className="flex gap-1 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-1 dark:border-white/10">
									{(["node", "python"] as Language[]).map((lang) => {
										const isSelected = activeLang === lang;
										return (
											<button
												key={lang}
												type="button"
												onClick={() => setActiveLang(lang)}
												className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
													isSelected
														? "bg-[#0a0d12] text-white dark:bg-white dark:text-black"
														: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
												}`}
											>
												{lang === "node" && (
													<svg
														viewBox="0 0 24 24"
														className="size-3.5 fill-current"
													>
														<path d={siNodedotjs.path} />
													</svg>
												)}
												{lang === "python" && (
													<svg
														viewBox="0 0 24 24"
														className="size-3.5 fill-current"
													>
														<path d={siPython.path} />
													</svg>
												)}
												<span>{lang === "node" ? "Node.js" : "Python"}</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Code Snippet Box */}
							<div className="mt-4 flex flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-[#0a0a0a] font-mono text-[13px] leading-relaxed shadow-lg">
								<div className="flex items-center justify-between border-white/5 border-b bg-white/[0.02] px-4 py-2 text-white/40 text-xs">
									<span>agent_setup.{activeLang === "node" ? "js" : "py"}</span>
									<button
										type="button"
										onClick={handleCopy}
										className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/5 hover:text-white"
									>
										<Icon name="copy" className="size-3.5" />
										{copied ? "Copied" : "Copy"}
									</button>
								</div>
								<div className="max-h-[300px] flex-1 overflow-x-auto p-4">
									<pre className="text-white/80">
										<code>{highlightCode(activeCode)}</code>
									</pre>
								</div>
							</div>

							{/* Trigger Loop */}
							<div className="mt-4 flex items-center gap-4">
								<button
									type="button"
									onClick={triggerSimulation}
									disabled={simulationState === "thinking"}
									className="inline-flex h-12 items-center justify-center rounded-full bg-[#0a0d12] px-8 font-semibold text-[14px] text-white transition-colors hover:bg-[#0a0d12]/90 active:scale-[0.98] disabled:pointer-events-none disabled:bg-[#0a0d12]/50 dark:bg-white dark:text-black dark:disabled:bg-white/50 dark:hover:bg-white/90"
								>
									<Icon name="send-2" className="mr-2 size-4" />
									{simulationState === "thinking"
										? "Agent Processing..."
										: simulationState === "success"
											? "Run Simulation Again"
											: "Trigger Inbound Email"}
								</button>

								{simulationState === "success" && (
									<span className="flex animate-fade-in items-center gap-1.5 font-semibold text-emerald-600 text-xs">
										<Icon name="check-circle" className="size-4" />
										Agent responded successfully in 14ms
									</span>
								)}
							</div>
						</div>

						{/* Simulated Inbox (Right Side) */}
						<div className="flex w-full flex-col gap-4 lg:w-[460px]">
							{/* Inbound / Outbound Simulator */}
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm dark:border-white/10">
								<div className="mb-3 flex items-center gap-2 border-stroke-soft-200 border-b pb-3 font-mono text-text-soft-400 text-xs dark:border-white/10">
									<span className="size-2.5 animate-pulse rounded-full bg-primary-base" />
									<span>Live Inbox Simulator</span>
								</div>

								<div className="flex min-h-[220px] flex-col justify-between rounded-lg border border-stroke-soft-200 p-4 dark:border-white/10">
									{/* Inbound email state */}
									<div className="space-y-4">
										<div className="rounded-lg bg-bg-weak-50 p-3 text-xs dark:bg-white/[0.02]">
											<div className="font-semibold text-text-soft-400 dark:text-white/40">
												INBOUND EMAIL
											</div>
											<div className="mt-1 font-semibold text-text-strong-950 dark:text-white">
												From:{" "}
												{activeTemplate === "support"
													? "customer@gmail.com"
													: activeTemplate === "sales"
														? "mark@acme.co"
														: "alerts@monitoring.net"}
											</div>
											<div className="font-semibold text-text-strong-950 dark:text-white">
												Subject:{" "}
												{activeTemplate === "support"
													? "Where is my order #28391?"
													: activeTemplate === "sales"
														? "Reloop Enterprise plans?"
														: "CRITICAL: DB latency spike"}
											</div>
											<div className="mt-2 border-stroke-soft-200 border-t pt-2 text-text-sub-600 dark:border-white/10 dark:text-white/50">
												{activeTemplate === "support" &&
													"Hey, my order was supposed to arrive yesterday but it hasn't. Can I get a refund or tracking status?"}
												{activeTemplate === "sales" &&
													"Hi, we are looking to migrate our pipelines to Reloop. We send about 2M emails/month. Can we get booking information?"}
												{activeTemplate === "ops" &&
													"Database cluster pg-main-0 is experiencing 4.2s read latency. Alert triggered at 21:05 UTC."}
											</div>
										</div>

										{/* Agent response preview (only visible when success) */}
										<AnimatePresence>
											{simulationState === "success" && (
												<motion.div
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													className="rounded-lg border border-stroke-soft-200 bg-bg-soft-50 p-3 text-xs dark:border-white/10"
												>
													<div className="font-semibold text-primary-base">
														AGENT OUTBOUND REPLY
													</div>
													<div className="mt-1 font-semibold text-text-strong-950 dark:text-white">
														From:{" "}
														{activeTemplate === "support"
															? "Support Agent <support-agent@yourdomain.com>"
															: activeTemplate === "sales"
																? "Sales Assistant <sales-agent@yourdomain.com>"
																: "Ops Router <ops-agent@yourdomain.com>"}
													</div>
													<div className="mt-2 border-stroke-soft-200 border-t pt-2 text-text-sub-600 dark:border-white/10 dark:text-white/70">
														{activeTemplate === "support" && (
															<p>
																Hi there, we verified order #28391. It is
																currently in transit and is scheduled for
																delivery today by 5 PM.
															</p>
														)}
														{activeTemplate === "sales" && (
															<p>
																Hi Mark, thanks for reaching out! Since you are
																sending 2M emails/month, I have paged the
																Enterprise team. Please confirm our invite for
																tomorrow.
															</p>
														)}
														{activeTemplate === "ops" && (
															<p>
																Incident logged. The operations team has been
																paged for pg-main-0 read latency. Tracking ID:
																inc_93817.
															</p>
														)}
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</div>
							</div>

							{/* Trace Logs Box */}
							<div className="flex min-h-[160px] flex-1 flex-col justify-between rounded-xl border border-stroke-soft-200 bg-[#0a0a0a] p-4 font-mono text-[11px] leading-relaxed shadow-sm dark:border-white/10">
								<div>
									<div className="mb-2 flex items-center justify-between border-white/5 border-b pb-2 text-white/40">
										<span>Agent Execution Trace</span>
										<span className="size-2 animate-pulse rounded-full bg-primary-base" />
									</div>
									<div className="max-h-[140px] space-y-1 overflow-y-auto text-white/70">
										{simulationLogs.length === 0 && (
											<span className="text-white/20">
												Click "Trigger Inbound Email" to watch execution trace.
											</span>
										)}
										{simulationLogs.map((log, index) => (
											<motion.div
												initial={{ opacity: 0, x: -5 }}
												animate={{ opacity: 1, x: 0 }}
												key={index}
												className={
													log.includes("200 OK")
														? "font-semibold text-emerald-400"
														: log.includes("Schema matches")
															? "text-primary-base"
															: ""
												}
											>
												&gt; {log}
											</motion.div>
										))}
									</div>
								</div>

								{simulationState === "success" && (
									<div className="mt-2 flex justify-between border-white/5 border-t pt-2 text-[10px] text-white/40">
										<span>Status: Executed Loop</span>
										<span>MIME Parser: 1.8ms</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
