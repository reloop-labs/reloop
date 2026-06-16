"use client";

import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { siNodedotjs, siPython } from "simple-icons";

type Language = "node" | "python";
type CampaignType = "newsletter" | "launch" | "promo";

interface CodeTemplates {
	node: string;
	python: string;
}

const templates: Record<CampaignType, CodeTemplates> = {
	newsletter: {
		node: `import Reloop from 'reloop-email';

const reloop = new Reloop('rl_live_marketing_key');

// Schedule Weekly Newsletter Campaign to active segment
const campaign = await reloop.campaigns.create({
  name: 'Weekly Newsletter v2',
  subject: "Weekly Update: What's new in Reloop v2",
  audienceSegmentId: 'seg_active_users_938',
  templateId: 'tpl_weekly_newsletter',
  deliverySchedule: { type: 'immediate' }
});

// Watch deliverability telemetry logs
reloop.campaigns.onDeliveryUpdate(campaign.id, (stats) => {
  console.log(\`Delivered: \${stats.deliveredCount} | Bounces: \${stats.bounceCount}\`);
});`,
		python: `from reloop_email import Reloop

reloop = Reloop("rl_live_marketing_key")

# Schedule Weekly Newsletter Campaign to active segment
campaign = reloop.campaigns.create(
    name="Weekly Newsletter v2",
    subject="Weekly Update: What's new in Reloop v2",
    audience_segment_id="seg_active_users_938",
    template_id="tpl_weekly_newsletter",
    delivery_schedule={"type": "immediate"}
)

# Watch deliverability telemetry logs
@reloop.campaigns.on_delivery_update(campaign["id"])
def handle_update(stats):
    print(f"Delivered: {stats['delivered_count']} | Bounces: {stats['bounce_count']}")`,
	},
	launch: {
		node: `import Reloop from 'reloop-email';

const reloop = new Reloop('rl_live_marketing_key');

// Schedule Product Launch Campaign to developer audience
const campaign = await reloop.campaigns.create({
  name: 'AI Agent Mailbox Launch',
  subject: 'Introducing Reloop Agent Mailboxes',
  audienceSegmentId: 'seg_all_developers_120',
  templateId: 'tpl_product_launch',
  deliverySchedule: { type: 'immediate' }
});

// Configure webhook alerts for bounces
await reloop.webhooks.register({
  url: 'https://api.yourdomain.com/campaigns/bounces',
  events: ['campaign.email_bounced']
});`,
		python: `from reloop_email import Reloop

reloop = Reloop("rl_live_marketing_key")

# Schedule Product Launch Campaign to developer audience
campaign = reloop.campaigns.create(
    name="AI Agent Mailbox Launch",
    subject="Introducing Reloop Agent Mailboxes",
    audience_segment_id="seg_all_developers_120",
    template_id="tpl_product_launch",
    delivery_schedule={"type": "immediate"}
)

# Configure webhook alerts for bounces
reloop.webhooks.register(
    url="https://api.yourdomain.com/campaigns/bounces",
    events=["campaign.email_bounced"]
)`,
	},
	promo: {
		node: `import Reloop from 'reloop-email';

const reloop = new Reloop('rl_live_marketing_key');

// Schedule Promotional Campaign with 20% discount offer
const campaign = await reloop.campaigns.create({
  name: 'Pro Annual Discount Promo',
  subject: 'Reloop Pro: Get 20% off annual plans',
  audienceSegmentId: 'seg_free_tier_users_321',
  templateId: 'tpl_promo_broadcast',
  deliverySchedule: { type: 'immediate' }
});`,
		python: `from reloop_email import Reloop

reloop = Reloop("rl_live_marketing_key")

# Schedule Promotional Campaign with 20% discount offer
campaign = reloop.campaigns.create(
    name="Pro Annual Discount Promo",
    subject="Reloop Pro: Get 20% off annual plans",
    audience_segment_id="seg_free_tier_users_321",
    template_id="tpl_promo_broadcast",
    delivery_schedule={"type": "immediate"}
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
				className: "text-teal-400 font-semibold",
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
	const [activeCampaign, setActiveCampaign] =
		useState<CampaignType>("newsletter");
	const [simulationState, setSimulationState] = useState<
		"idle" | "broadcasting" | "success"
	>("idle");
	const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
	const [copied, setCopied] = useState(false);

	const activeCode = templates[activeCampaign][activeLang];

	const handleCopy = () => {
		navigator.clipboard.writeText(activeCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const triggerSimulation = () => {
		if (simulationState === "broadcasting") return;

		setSimulationState("broadcasting");
		setSimulationLogs([]);

		let logs: string[] = [];

		if (activeCampaign === "newsletter") {
			logs = [
				"Resolving audience segment 'seg_active_users_938'...",
				"Loaded 4,520 recipient email profiles.",
				"Compiling template 'tpl_weekly_newsletter' with variables.",
				"Preflight spam filter check: Score 0.2 (Safe).",
				"Validating DKIM & SPF aligns for yourdomain.com... OK.",
				"Injecting campaign payload into MTA edge clusters...",
				"Broadcasting emails... 1,000 sent... 3,000 sent...",
				"Broadcast completed. Delivered: 4,518 (99.95%) | Bounces: 2.",
			];
		} else if (activeCampaign === "launch") {
			logs = [
				"Resolving audience segment 'seg_all_developers_120'...",
				"Loaded 12,890 recipient email profiles.",
				"Compiling template 'tpl_product_launch' with variables.",
				"Preflight spam filter check: Score 0.4 (Safe).",
				"DKIM & SPF signature alignment validated... OK.",
				"Injecting campaign payload into MTA edge clusters...",
				"Broadcasting emails... 4,000 sent... 8,000 sent...",
				"Broadcast completed. Delivered: 12,875 (99.88%) | Bounces: 15.",
			];
		} else {
			logs = [
				"Resolving audience segment 'seg_free_tier_users_321'...",
				"Loaded 3,280 recipient email profiles.",
				"Compiling template 'tpl_promo_broadcast' with variables.",
				"Preflight spam filter check: Score 0.3 (Safe).",
				"DKIM & SPF signature alignment validated... OK.",
				"Injecting campaign payload into MTA edge clusters...",
				"Broadcasting emails... 1,500 sent... 3,000 sent...",
				"Broadcast completed. Delivered: 3,277 (99.90%) | Bounces: 3.",
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

	// Reset simulation when campaign changes
	useEffect(() => {
		setSimulationState("idle");
		setSimulationLogs([]);
	}, [activeCampaign]);

	return (
		<section id="playground" className="scroll-mt-10 bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="mx-auto mb-16 max-w-3xl text-center">
					<h2 className="font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Interactive Creator Sandbox
					</h2>
					<p className="mx-auto mt-6 max-w-[620px] text-[#0a0d12]/60 text-[15px] leading-relaxed sm:text-[17px]">
						Choose a campaign type, edit SDK parameters, and simulate a
						high-volume broadcast with real-time deliverability telemetry.
					</p>
				</div>

				<div className="rounded-2xl border border-[#0a0d12]/8 bg-zinc-50/80 p-6 shadow-sm md:p-8">
					<div className="flex flex-col gap-8 lg:flex-row">
						{/* Sandbox Editor & Inputs (Left Side) */}
						<div className="flex min-w-0 flex-1 flex-col">
							<div className="flex flex-col gap-4 border-[#0a0d12]/5 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
								{/* Campaign Type Selector */}
								<div className="flex gap-1 rounded-xl border border-[#0a0d12]/6 bg-[#0a0d12]/4 p-1">
									{(["newsletter", "launch", "promo"] as CampaignType[]).map(
										(type) => {
											const isSelected = activeCampaign === type;
											return (
												<button
													key={type}
													type="button"
													onClick={() => setActiveCampaign(type)}
													className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
														isSelected
															? "bg-white text-[#0a0d12] shadow-sm"
															: "text-[#0a0d12]/40 hover:text-[#0a0d12]/70"
													}`}
												>
													<span className="capitalize">
														{type === "newsletter"
															? "Weekly Newsletter"
															: type === "launch"
																? "Product Launch"
																: "Promo Broadcast"}
													</span>
												</button>
											);
										},
									)}
								</div>

								{/* Language Selector */}
								<div className="flex gap-1 rounded-xl border border-[#0a0d12]/6 bg-[#0a0d12]/4 p-1">
									{(["node", "python"] as Language[]).map((lang) => {
										const isSelected = activeLang === lang;
										return (
											<button
												key={lang}
												type="button"
												onClick={() => setActiveLang(lang)}
												className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
													isSelected
														? "bg-[#0a0d12] text-white"
														: "text-[#0a0d12]/40 hover:text-[#0a0d12]/70"
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
									<span>
										campaign_broadcast.{activeLang === "node" ? "js" : "py"}
									</span>
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
									disabled={simulationState === "broadcasting"}
									className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[14px] text-white transition-colors hover:bg-[#0a0d12]/90 active:scale-[0.98] disabled:pointer-events-none disabled:bg-[#0a0d12]/50"
								>
									<Icon name="send-2" className="mr-2 size-4" />
									{simulationState === "broadcasting"
										? "Broadcasting Campaign..."
										: simulationState === "success"
											? "Restart Broadcast Loop"
											: "Trigger Live Broadcast"}
								</button>

								{simulationState === "success" && (
									<span className="flex animate-fade-in items-center gap-1.5 font-semibold text-emerald-600 text-xs">
										<Icon name="check-circle" className="size-4" />
										Broadcast completed in 12ms
									</span>
								)}
							</div>
						</div>

						{/* Campaign Visual Preview (Right Side) */}
						<div className="flex w-full flex-col gap-4 lg:w-[460px]">
							<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
								<div className="mb-3 flex items-center gap-2 border-zinc-100 border-b pb-3 font-mono text-[#0a0d12]/40 text-xs">
									<span className="size-2.5 animate-pulse rounded-full bg-teal-500" />
									<span>Visual Email Preview</span>
								</div>

								<div className="flex min-h-[220px] flex-col justify-between rounded-lg border border-zinc-100 p-4">
									<div className="space-y-4 text-xs">
										<div className="border-[#0a0d12]/10 border-b pb-2">
											<span className="font-semibold text-zinc-400">
												Subject:{" "}
											</span>
											<span className="font-semibold text-zinc-900">
												{activeCampaign === "newsletter" &&
													"Weekly Update: What's new in Reloop v2"}
												{activeCampaign === "launch" &&
													"Introducing Reloop Agent Mailboxes"}
												{activeCampaign === "promo" &&
													"Reloop Pro: Get 20% off annual plans"}
											</span>
										</div>

										<div className="rounded border border-zinc-200 bg-zinc-50 p-4 text-center">
											{/* Newsletter Preview */}
											{activeCampaign === "newsletter" && (
												<div>
													<div className="font-bold text-sm text-teal-600">
														RELOOP WEEKLY
													</div>
													<h3 className="mt-2 font-semibold text-[#0a0d12] text-xs">
														Version 2.0 is Live!
													</h3>
													<p className="mt-2 text-[10px] text-zinc-500 leading-relaxed">
														Discover fully-managed SMTP relay configurations,
														enhanced SDK types, and sub-12ms global latency
														profiles.
													</p>
													<div className="mt-3 inline-block rounded bg-[#0a0d12] px-3 py-1 font-semibold text-[9px] text-white">
														Read Changelog
													</div>
												</div>
											)}

											{/* Launch Preview */}
											{activeCampaign === "launch" && (
												<div>
													<div className="font-bold text-purple-600 text-sm">
														PRODUCT LAUNCH
													</div>
													<h3 className="mt-2 font-semibold text-[#0a0d12] text-xs">
														Inbox for AI Agents
													</h3>
													<p className="mt-2 text-[10px] text-zinc-500 leading-relaxed">
														Build, test, and run autonomous agent email
														pipelines. Feed LLMs perfect JSON schemas instead of
														raw MIME formats.
													</p>
													<div className="mt-3 inline-block rounded bg-purple-600 px-3 py-1 font-semibold text-[9px] text-white">
														Deploy Mailbox
													</div>
												</div>
											)}

											{/* Promo Preview */}
											{activeCampaign === "promo" && (
												<div>
													<div className="font-bold text-amber-600 text-sm">
														LIMITED OFFER
													</div>
													<h3 className="mt-2 font-semibold text-[#0a0d12] text-xs">
														Get 20% off Annual Plans
													</h3>
													<p className="mt-2 text-[10px] text-zinc-500 leading-relaxed">
														Unlock unlimited custom domains, automated SPF/DKIM
														signing, and priority MTA delivery queue access.
													</p>
													<div className="mt-3 inline-block rounded bg-amber-600 px-3 py-1 font-semibold text-[9px] text-white">
														Claim 20% Discount
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Delivery Trace Logs */}
							<div className="flex min-h-[160px] flex-1 flex-col justify-between rounded-xl border border-zinc-200 bg-[#0a0a0a] p-4 font-mono text-[11px] leading-relaxed shadow-sm">
								<div>
									<div className="mb-2 flex items-center justify-between border-white/5 border-b pb-2 text-white/40">
										<span>Telemetry Status Logs</span>
										<span className="size-2 animate-pulse rounded-full bg-teal-500" />
									</div>
									<div className="max-h-[140px] space-y-1 overflow-y-auto text-white/70">
										{simulationLogs.length === 0 && (
											<span className="text-white/20">
												Click "Trigger Live Broadcast" to execute and trace the
												delivery.
											</span>
										)}
										{simulationLogs.map((log, index) => (
											<motion.div
												initial={{ opacity: 0, x: -5 }}
												animate={{ opacity: 1, x: 0 }}
												key={index}
												className={
													log.includes("completed")
														? "font-semibold text-emerald-400"
														: log.includes("Injecting")
															? "text-teal-300"
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
										<span>Status: Broadcast Finished</span>
										<span>Deliverability: 99.9%</span>
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
