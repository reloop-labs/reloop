import { cn } from "@reloop/ui/cn";

const TONE: Record<string, string> = {
	green:
		"bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
	red: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-400",
	orange:
		"bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:text-orange-400",
	blue: "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-400",
	purple:
		"bg-purple-500/10 text-purple-700 ring-purple-500/20 dark:text-purple-400",
	gray: "bg-bg-weak-50 text-text-sub-600 ring-stroke-soft-200 dark:bg-white/[0.06]",
};

export function statusTone(status: string): keyof typeof TONE {
	const s = status.toLowerCase();
	if (
		["active", "delivered", "sent", "open", "enabled", "published"].includes(s)
	)
		return "green";
	if (
		["suspended", "banned", "failed", "deleted", "disabled", "closed"].includes(
			s,
		)
	)
		return "red";
	if (["bounced", "spam", "past_due", "warning", "verifying"].includes(s))
		return "orange";
	if (["pending", "draft", "paused"].includes(s)) return "gray";
	if (["super-admin", "owner"].includes(s)) return "purple";
	return "blue";
}

export function StatusPill({
	status,
	tone,
	className,
}: {
	status: string;
	tone?: keyof typeof TONE;
	className?: string;
}) {
	const t = tone ?? statusTone(status);
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-[11px] capitalize ring-1 ring-inset",
				TONE[t],
				className,
			)}
		>
			{status}
		</span>
	);
}
