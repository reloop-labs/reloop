import { Icon } from "@reloop/ui/icon";

const SUGGESTIONS = [
	{
		title: "SaaS Onboarding Welcome",
		prompt:
			"Create a modern SaaS welcome onboarding email with getting started steps and CTA button.",
	},
	{
		title: "Order Receipt & Items",
		prompt:
			"Build an e-commerce order confirmation email with order number, receipt table, and tracking link.",
	},
	{
		title: "Product Launch Digest",
		prompt:
			"Design a vibrant product launch announcement email with hero image, feature highlights, and early access badge.",
	},
	{
		title: "Security & Password Reset",
		prompt:
			"Clean transactional password reset email with verification code box and security warning note.",
	},
];

export function InspirationChips({
	onSelectPrompt,
}: {
	onSelectPrompt: (prompt: string) => void;
}) {
	return (
		<div className="mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2">
			{SUGGESTIONS.map((item) => (
				<button
					key={item.title}
					type="button"
					onClick={() => onSelectPrompt(item.prompt)}
					className="flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50/50 px-3.5 py-1.5 text-text-sub-600 text-xs transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-100 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
				>
					<Icon name="sparkling" className="h-3 w-3 opacity-60" />
					<span>{item.title}</span>
				</button>
			))}
		</div>
	);
}
