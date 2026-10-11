import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { toast } from "sonner";

const mcpPrompts = [
	"Send a welcome email to user@example.com with a personalized greeting.",
	"List all emails I sent today and show their delivery status.",
	"Add a new contact with their name and email.",
	"Create a campaign for our product launch announcement.",
	"Verify my domain and check the DNS configuration status.",
	"Show me all inbound emails I received this week.",
	"Set up a webhook to notify me when an email bounces.",
	"Create a contact group for users who signed up this month.",
	"Send a batch of onboarding emails to these five new users.",
	"Create a password reset email template that matches our brand.",
	"Why did my bounce rate go up yesterday?",
	"Build an automation that sends a welcome series when someone signs up.",
];

function PromptCard({ prompt }: { prompt: string }) {
	const copy = () => {
		navigator.clipboard.writeText(prompt);
		toast.success("Prompt copied");
	};

	return (
		<div
			className={cn(
				"flex h-full items-start gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 transition-colors",
				"dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
				"hover:border-stroke-soft-200 dark:hover:border-stroke-soft-100/60",
			)}
		>
			<p className="min-w-0 flex-1 text-paragraph-sm text-text-strong-950">
				“{prompt}”
			</p>
			<button
				type="button"
				onClick={copy}
				aria-label="Copy prompt"
				className="-mt-1 -mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/[0.06]"
			>
				<Icon name="copy" className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}

/** Prompt cards on their own, e.g. as a setup step. */
export function PromptGrid() {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{mcpPrompts.map((prompt) => (
				<PromptCard key={prompt} prompt={prompt} />
			))}
		</div>
	);
}
