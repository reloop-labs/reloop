import CodeSnippet from "../code-snippet";
import { FeatureRow, SectionBlock } from "./shared";
import { PipelinesVisual } from "./visuals";

export default function DeveloperSection() {
	return (
		<SectionBlock
			eyebrow="Developer Core"
			title="Complete Email Infrastructure for Engineers"
			subtitle="Send transactional emails, listen to delivery webhooks, and manage system SPF/DKIM validation with full programmatic control."
			className="border-[#0a0d12]/5 border-t border-b bg-[#f8f8f8] text-[#0a0d12] dark:border-white/5 dark:bg-[#030303] dark:text-white"
		>
			{/* Subsection 1: SDK */}
			<FeatureRow
				title="Type-Safe Developer SDKs"
				description="Import our client library and start sending transactional emails in seconds. Reloop supports all major developer ecosystems with full type-safety."
				theme="emerald"
				cards={[
					{
						title: "Type-Safe SDKs",
						description:
							"Fully typed libraries for Node.js, Go, Python, PHP, and Rust.",
					},
					{
						title: "Zero Configuration",
						description:
							"Get started instantly by importing our client and supplying your API key.",
					},
					{
						title: "React & Next.js Optimized",
						description:
							"First-class support for Server Components, custom templates, and light/dark modes.",
					},
				]}
			/>

			{/* Subsection 2: Webhooks */}
			<FeatureRow
				title="Event-Driven Webhook Pipelines"
				description="Scale your email operations without managing server queues. Relay notifications, track bounces, and enforce compliance automatically."
				theme="rose"
				reverse
				cards={[
					{
						title: "Managed Authentication",
						description:
							"We handle the technical complexity of SPF, DKIM, and DMARC so your emails always reach the inbox.",
					},
					{
						title: "AI-powered Content Guard",
						description:
							"Automatically catch spam triggers, broken images, and phishing signals before sending.",
					},
					{
						title: "Programmable Flow",
						description:
							"Define complex retry logic, A/B tests, and delivery rules with a simple, YAML-based configuration.",
					},
				]}
			/>

			{/* Subsection 3: Analytics */}
			<FeatureRow
				title="MTA & Delivery Analytics"
				description="Keep track of your email pipeline performance. Get real-time delivery confirmations, bounce tracking logs, latency stats, and detailed status updates."
				theme="cyan"
				cards={[
					{
						title: "Real-Time Tracking",
						description:
							"Track send operations and receipt status logs the exact millisecond they occur.",
					},
					{
						title: "Failure Resolution",
						description:
							"Instantly debug bounce statuses, spam flags, and transient ISP delivery blocks.",
					},
					{
						title: "MTA Latency Metrics",
						description:
							"Analyze latency curves and pipeline throughput across global node regions.",
					},
				]}
			/>
		</SectionBlock>
	);
}
