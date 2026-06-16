"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	ArrowUp,
	Bot,
	Database,
	Globe,
	HelpCircle,
	Lock,
	Maximize2,
	Minimize2,
	Paperclip,
	Plus,
	Sparkles,
	User,
	X,
} from "lucide-react";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import { useEffect, useRef, useState } from "react";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
}

const SUGGESTIONS = [
	{
		id: "r2",
		title: "Bind R2 to a Worker",
		desc: "Connect object storage",
		icon: Database,
		prompt: "How do I bind an R2 bucket to my Cloudflare Worker?",
		response: `To bind an R2 bucket to your Cloudflare Worker, follow these quick steps:

1. **Configure wrangler.toml**:
   Add the \`r2_buckets\` binding block to your configuration:
   \`\`\`toml
   [[r2_buckets]]
   binding = 'MY_BUCKET'
   bucket_name = 'my-bucket-name'
   \`\`\`

2. **Access in your Worker code**:
   Use the binding directly on the environment (\`env\`) object:
   \`\`\`typescript
   export default {
     async fetch(request, env) {
       // Put an object into R2
       await env.MY_BUCKET.put("hello.txt", "Hello World");
       
       // Retrieve the object from R2
       const object = await env.MY_BUCKET.get("hello.txt");
       return new Response(await object.text());
     }
   }
   \`\`\`

You can now deploy your Worker with \`npx wrangler deploy\`.`,
	},
	{
		id: "ech",
		title: "Encrypted Client Hello",
		desc: "Enable ECH for my zone",
		icon: Lock,
		prompt: "How can I enable Encrypted Client Hello (ECH) for my zone?",
		response: `Encrypted Client Hello (ECH) encrypts the Server Name Indication (SNI) extension during TLS handshakes to enhance privacy.

**To enable ECH:**
1. Navigate to **SSL/TLS** > **Edge Certificates** on your Reloop dashboard.
2. Scroll down to the **Encrypted Client Hello (ECH)** section.
3. Toggle the switch to **On**.

*Note: ECH requires TLS 1.3 to be active. Reloop automatically creates the required HTTPS/SVCB DNS records for your zone to support ECH.*`,
	},
	{
		id: "account-id",
		title: "Find my account ID",
		desc: "Locate account and zone IDs",
		icon: User,
		prompt: "Where can I find my account ID and zone ID?",
		response: `You can find your Account ID and Zone ID on the Reloop dashboard dashboard:

1. Click **Account home** in the top left or select your zone/domain.
2. Scroll down on the **Overview** page.
3. On the right-hand sidebar under **API**, you will see your **Account ID** and **Zone ID** ready to copy.

Alternatively, you can query these via the Reloop Cloud API or wrangler CLI (\`npx wrangler whoami\`).`,
	},
	{
		id: "transfer",
		title: "Transfer a domain",
		desc: "Walk me through the process",
		icon: Globe,
		prompt: "How do I transfer a domain registration to Reloop?",
		response: `Transferring a domain to Reloop is simple and costs only the registration fee, which adds 1 year to your domain's expiry.

**Step-by-step Transfer:**
1. **Unlock your domain** at your current registrar and retrieve the Transfer/Auth/EPP authorization code.
2. Go to **Domains** on your Reloop dashboard.
3. Click the **Transfer** tab or "+ Transfer in" button.
4. Input your domain name and paste the EPP authorization code.
5. Pay the transfer invoice. We'll automatically initiate the transfer process. (Can take 1-5 days to complete).`,
	},
	{
		id: "durable-objects",
		title: "Durable Objects",
		desc: "Explain how they work",
		icon: Sparkles,
		prompt: "What are Durable Objects and how do they work?",
		response: `Durable Objects provide strongly-consistent storage and coordination for Workers. Unlike standard Serverless functions, a Durable Object instance runs in a single thread globally and retains state in memory.

**Key benefits:**
- Coordinate state across clients (ideal for real-time apps like chats, multiplayer games, and web sockets).
- Access high-performance transactional persistent storage.
- Support standard HTTP request routing.

**Example Class Definition:**
\`\`\`typescript
export class Counter {
  state: DurableObjectState;
  
  constructor(state: DurableObjectState) {
    this.state = state;
  }
  
  async fetch(request: Request) {
    let value: number = await this.state.storage.get("value") || 0;
    value += 1;
    await this.state.storage.put("value", value);
    return new Response(\`Counter is now: \${value}\`);
  }
}
\`\`\``,
	},
];

export const AiPanel = () => {
	const {
		isAiPanelOpen,
		setIsAiPanelOpen,
		isAiPanelExpanded,
		setIsAiPanelExpanded,
	} = useUIStore();

	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);

	const chatEndRef = useRef<HTMLDivElement>(null);

	const greeting = (() => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	})();

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isTyping]);

	const handleSend = (textToSend: string) => {
		if (!textToSend.trim()) return;

		const userMsg: Message = {
			id: Math.random().toString(36).substring(7),
			role: "user",
			content: textToSend,
		};

		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsTyping(true);

		// Check if it matches a suggestion
		const matchedSuggestion = SUGGESTIONS.find(
			(s) =>
				s.prompt.toLowerCase() === textToSend.toLowerCase() ||
				s.title.toLowerCase() === textToSend.toLowerCase(),
		);

		setTimeout(() => {
			const replyContent = matchedSuggestion
				? matchedSuggestion.response
				: `I am the Reloop AI Assistant. I received your message: "${textToSend}". Let me know if you want to know about binding R2 buckets, enabling ECH, finding your account ID, transferring domains, or using Durable Objects!`;

			const botMsg: Message = {
				id: Math.random().toString(36).substring(7),
				role: "assistant",
				content: replyContent,
			};

			setMessages((prev) => [...prev, botMsg]);
			setIsTyping(false);
		}, 1200);
	};

	const handleSuggestionClick = (s: (typeof SUGGESTIONS)[0]) => {
		handleSend(s.prompt);
	};

	const clearChat = () => {
		setMessages([]);
	};

	if (!isAiPanelOpen) return null;

	return (
		<aside
			className={cn(
				"relative flex h-full flex-col border-stroke-soft-100 border-l bg-white/50 transition-all duration-300 dark:border-white/5 dark:bg-[#0c0c0c]/80 backdrop-blur-md",
				isAiPanelExpanded ? "w-[640px]" : "w-[400px]",
			)}
		>
			{/* Panel Header */}
			<div className="flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b px-4 dark:border-white/5">
				{/* Left side dropdown selector */}
				<button
					type="button"
					className="flex items-center gap-1.5 font-semibold text-[13px] text-text-strong-950 hover:text-text-strong-950/80 dark:text-white"
				>
					New conversation
					<Icon name="chevron-right" className="h-3 w-3 rotate-90 opacity-60" />
				</button>

				{/* Right side controls */}
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={clearChat}
						title="New Chat"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/5"
					>
						<Plus className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={() => setIsAiPanelExpanded(!isAiPanelExpanded)}
						title={isAiPanelExpanded ? "Collapse Width" : "Expand Width"}
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/5"
					>
						{isAiPanelExpanded ? (
							<Minimize2 className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</button>
					<button
						type="button"
						onClick={() => setIsAiPanelOpen(false)}
						title="Close Panel"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/5"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Support Banner Row */}
			<div className="flex items-center justify-between border-stroke-soft-100/50 border-b bg-bg-weak-50/20 px-4 py-2 dark:border-white/5 dark:bg-white/[0.01]">
				<span className="text-text-sub-600 text-xs dark:text-white/50">
					Need more help?
				</span>
				<a
					href="mailto:support@reloop.sh"
					className="rounded-md border border-stroke-soft-100 bg-white px-2.5 py-1 text-center font-medium text-[11px] text-text-strong-950 shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/10"
				>
					Support
				</a>
			</div>

			{/* Main Scrollable Chat Area */}
			<div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
				{messages.length === 0 ? (
					// Welcome/Greeting view
					<div className="flex flex-col items-center pt-8 pb-4">
						{/* Glow custom illustration */}
						<div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500/10 to-purple-500/10 dark:from-orange-500/20 dark:to-purple-500/20">
							<div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-tr from-orange-500/5 to-purple-500/5 blur-lg" />
							<Bot className="h-8 w-8 text-orange-500 dark:text-orange-400" />
						</div>

						<h2 className="font-semibold text-2xl text-text-strong-950 dark:text-white">
							{greeting}.
						</h2>
						<p className="mt-1 text-text-sub-600 text-[13px] dark:text-white/50">
							What are we doing today?
						</p>

						{/* Suggestion Cards */}
						<div className="mt-8 w-full space-y-2.5">
							{SUGGESTIONS.map((item) => {
								const ItemIcon = item.icon;
								return (
									<button
										key={item.id}
										type="button"
										onClick={() => handleSuggestionClick(item)}
										className="group flex w-full items-center gap-3.5 rounded-xl border border-stroke-soft-100 bg-white/40 p-3.5 text-left transition-all duration-200 hover:border-orange-500/30 hover:bg-white hover:shadow-sm dark:border-white/5 dark:bg-white/[0.01] dark:hover:border-orange-500/20 dark:hover:bg-white/[0.03]"
									>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600 transition-colors group-hover:bg-orange-500/10 group-hover:text-orange-500 dark:bg-white/5 dark:text-white/40 dark:group-hover:text-orange-400">
											<ItemIcon className="h-4 w-4" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="font-semibold text-text-strong-950 text-xs dark:text-white">
												{item.title}
											</p>
											<p className="mt-0.5 truncate text-[11px] text-text-sub-600 dark:text-white/40">
												{item.desc}
											</p>
										</div>
									</button>
								);
							})}
						</div>

						{/* Privacy Banner */}
						{showPrivacyNotice && (
							<div className="relative mt-8 flex w-full items-start gap-2.5 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/30 p-3.5 dark:border-white/5 dark:bg-white/[0.01]">
								<div className="min-w-0 flex-1">
									<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/40">
										Chats are recorded to improve the service and are processed
										in accordance with our{" "}
										<a
											href="/privacy"
											className="underline hover:text-text-strong-950 dark:hover:text-white"
										>
											Privacy Policy
										</a>
										.
									</p>
								</div>
								<button
									type="button"
									onClick={() => setShowPrivacyNotice(false)}
									className="text-text-sub-400 hover:text-text-strong-950 dark:text-white/30 dark:hover:text-white"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							</div>
						)}
					</div>
				) : (
					// Message Thread view
					<div className="space-y-6">
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={cn(
									"flex w-full gap-3",
									msg.role === "user" ? "flex-row-reverse" : "flex-row",
								)}
							>
								{/* Avatar */}
								<div
									className={cn(
										"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold shadow-sm",
										msg.role === "user"
											? "border-orange-500/20 bg-orange-500 text-white dark:border-orange-500/10"
											: "border-stroke-soft-100 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70",
									)}
								>
									{msg.role === "user" ? "U" : <Bot className="h-3.5 w-3.5" />}
								</div>

								{/* Bubble */}
								<div
									className={cn(
										"max-w-[82%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
										msg.role === "user"
											? "bg-orange-500 text-white"
											: "border border-stroke-soft-100 bg-white text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/90",
									)}
								>
									<p className="whitespace-pre-wrap font-sans">{msg.content}</p>
								</div>
							</div>
						))}

						{/* Typing/Loading indicator */}
						{isTyping && (
							<div className="flex w-full gap-3">
								<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
									<Bot className="h-3.5 w-3.5 animate-pulse" />
								</div>
								<div className="flex items-center gap-1 rounded-xl border border-stroke-soft-100 bg-white px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]">
									<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 delay-0" />
									<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 delay-150" />
									<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 delay-300" />
								</div>
							</div>
						)}
						<div ref={chatEndRef} />
					</div>
				)}
			</div>

			{/* Chat Input Container */}
			<div className="shrink-0 border-stroke-soft-100 border-t bg-white px-4 py-4 dark:border-white/5 dark:bg-[#0c0c0c]/80">
				<div className="flex flex-col rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-2.5 focus-within:border-orange-500/40 focus-within:ring-2 focus-within:ring-orange-500/10 dark:border-white/10 dark:bg-white/[0.02]">
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend(input);
							}
						}}
						placeholder="What can we help you with?"
						rows={2}
						className="w-full resize-none bg-transparent px-2.5 py-1 text-xs text-text-strong-950 placeholder-text-soft-400 outline-none scrollbar-none dark:text-white/90 dark:placeholder-white/20"
					/>
					<div className="mt-2.5 flex items-center justify-between border-stroke-soft-100/50 border-t pt-2 dark:border-white/5">
						<button
							type="button"
							className="rounded-lg p-1.5 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/40 dark:hover:bg-white/5"
							title="Attach context"
						>
							<Paperclip className="h-3.5 w-3.5" />
						</button>
						<button
							type="button"
							onClick={() => handleSend(input)}
							disabled={!input.trim()}
							className={cn(
								"flex h-7 items-center gap-1 rounded-lg px-3 text-xs font-semibold transition-all",
								input.trim()
									? "bg-orange-500 text-white shadow-sm hover:bg-orange-600"
									: "bg-bg-weak-100 text-text-sub-400 dark:bg-white/5 dark:text-white/20",
							)}
						>
							Ask
							<ArrowUp className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			</div>
		</aside>
	);
};
