import { cn } from "@reloop/ui/cn";
import { useState } from "react";
import {
	siClaude,
	siCursor,
	siGithubcopilot,
	siGooglegemini,
} from "simple-icons";

/** Global prompt for AI editors — no live secrets. */
export function buildReloopAiPrompt(): string {
	return `Integrate Reloop into this project.

I will set RELOOP_API_KEY in my .env (never commit the real key). Use this placeholder until I paste the real value:
RELOOP_API_KEY=rl_your_api_key_here

Do the following:
1. Detect this project's language and framework.
2. Install the correct Reloop SDK if one exists (Node/Python: reloop-email; Go: github.com/reloop-labs/reloop-go/v2; PHP: reloop/reloop-email), or call the REST API with Authorization: Bearer <key>.
3. Wire the key from env and send a test transactional email:
   - from: sender@example.com
   - to: recipient@example.com
   - subject: Hello from Reloop
   - text: Hello World!
4. Follow this repo's conventions and handle errors cleanly.

Useful docs:
- API keys: https://reloop.sh/docs/learn/api-keys
- Send email: https://reloop.sh/docs/api/mail/post-api-mail-v1send
- SMTP: https://reloop.sh/docs/examples/smtp/introduction
- Webhooks: https://reloop.sh/docs/learn/webhooks

Show only the files/code I need to add or change.`;
}

const TOOL_ICONS = [
	{ id: "claude", label: "Claude", path: siClaude.path, hex: siClaude.hex },
	{ id: "cursor", label: "Cursor", path: siCursor.path, hex: siCursor.hex },
	{
		id: "gemini",
		label: "Gemini",
		path: siGooglegemini.path,
		hex: siGooglegemini.hex,
	},
	{
		id: "copilot",
		label: "GitHub Copilot",
		path: siGithubcopilot.path,
		hex: siGithubcopilot.hex,
	},
] as const;

/**
 * Cloudflare-style global "Copy prompt" control for the top navbar.
 * Icons + label in a single pill; copies an AI integration prompt.
 */
export function CopyPromptButton({ className }: { className?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(buildReloopAiPrompt());
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			title="Copy AI prompt for Claude, ChatGPT, Cursor, and more"
			className={cn(
				"inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-stroke-soft-100 bg-bg-white-0 px-2.5 font-medium text-text-sub-600 text-xs transition-[background-color,border-color,color,transform] duration-150 ease-out",
				"hover:border-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950",
				"active:scale-[0.98]",
				"dark:border-stroke-soft-100/50 dark:bg-transparent dark:hover:bg-bg-weak-50/40 dark:hover:text-white",
				className,
			)}
		>
			<span className="flex items-center -space-x-1">
				{TOOL_ICONS.map((tool) => (
					<span
						key={tool.id}
						title={tool.label}
						className="flex h-5 w-5 items-center justify-center rounded-full bg-bg-weak-50 ring-1 ring-bg-white-0 dark:bg-bg-weak-50/80 dark:ring-[#0a0a0a]"
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							width={11}
							height={11}
							aria-hidden
							className="shrink-0 dark:fill-white"
							fill={`#${tool.hex}`}
						>
							<path d={tool.path} />
						</svg>
					</span>
				))}
				{/* ChatGPT mark — no simple-icons brand for ChatGPT */}
				<span
					title="ChatGPT"
					className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10A37F] font-bold text-[7px] text-white ring-1 ring-bg-white-0 dark:ring-[#0a0a0a]"
				>
					GPT
				</span>
			</span>
			<span className="pr-0.5">{copied ? "Copied!" : "Copy prompt"}</span>
		</button>
	);
}
