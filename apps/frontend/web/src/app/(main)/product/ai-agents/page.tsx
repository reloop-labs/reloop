import * as Button from "@reloop/ui/button";
import Link from "next/link";

const AiAgentsPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Email Infrastructure for AI Agents
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Equip your autonomous agents and LLMs with a reliable email mailbox.
					Enable your AI workforce to safely read, write, parse, and act on email workflows in real time.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Deploy Agent Inbox
					</Link>
					<Link
						href="/docs"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Read SDK Docs
					</Link>
				</div>
			</section>

			{/* Core Features */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Native Agent Integration
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Built from the ground up for LLM function calling and automated pipelines.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{/* Card 1 */}
					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
							<svg
								className="h-6 w-6 text-orange-600 dark:text-orange-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Structured function calling</h3>
						<p className="text-text-sub-600 leading-6">
							Feed LLMs clean, pre-parsed JSON instead of messy raw MIME emails. 
							Agents can dispatch emails using direct JSON-schema schemas.
						</p>
					</div>

					{/* Card 2 */}
					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
							<svg
								className="h-6 w-6 text-blue-600 dark:text-blue-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Thread Context Sync</h3>
						<p className="text-text-sub-600 leading-6">
							Maintain continuous agent memory. Automatically associate replies 
							with parent threads so your LLMs always have the full conversation context.
						</p>
					</div>

					{/* Card 3 */}
					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
							<svg
								className="h-6 w-6 text-red-600 dark:text-red-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">AI-Native Guardrails</h3>
						<p className="text-text-sub-600 leading-6">
							Enforce strict compliance. Prevent prompt injection attacks through 
							email bodies, block toxic payloads, and monitor hallucinated content before dispatch.
						</p>
					</div>
				</div>
			</section>

			{/* Agent Metrics */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">
						Built for Automated Scale
					</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						Supercharge your AI workflows with mailboxes engineered for sub-second speeds.
					</p>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-orange-600 dark:text-orange-400">
								&lt;15ms
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								API Latency
							</div>
							<div className="text-sm text-text-sub-600">
								Instant parsing for agent queries
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-blue-600 dark:text-blue-400">
								100%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Type-Safe JSON
							</div>
							<div className="text-sm text-text-sub-600">
								Validates output against schemas
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-purple-600 dark:text-purple-400">
								0%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Injection Leaks
							</div>
							<div className="text-sm text-text-sub-600">
								Robust pre-send email sanitation
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-green-600 dark:text-green-400">
								99.99%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Uptime SLA
							</div>
							<div className="text-sm text-text-sub-600">
								Reliable infrastructure for production
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to give your agents an inbox?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Connect your LLMs, LangChain, or Autogen framework to Reloop today.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started Free
					</Link>
					<Link
						href="/contact"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Talk to Agent Architects
					</Link>
				</div>
			</section>
		</div>
	);
};

export default AiAgentsPage;
