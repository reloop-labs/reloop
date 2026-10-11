import { cn } from "@reloop/ui/cn";

/** Same 3D keycap shell/face treatment as `ContactStatusBadge` (solid variant). */
type KeycapStyle = { shell: string; face: string };

const GREEN: KeycapStyle = {
	shell: "bg-[#065f46] dark:bg-[#064e3b]",
	face: "bg-[#059669] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#047857] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
const RED: KeycapStyle = {
	shell: "bg-[#991b1b] dark:bg-[#7f1d1d]",
	face: "bg-[#dc2626] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b91c1c] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
const AMBER: KeycapStyle = {
	shell: "bg-[#78350f] dark:bg-[#451a03]",
	face: "bg-[#d97706] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b45309] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
const BLUE: KeycapStyle = {
	shell: "bg-[#1e3a8a] dark:bg-[#172554]",
	face: "bg-[#2563eb] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#1d4ed8] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
const PURPLE: KeycapStyle = {
	shell: "bg-[#4c1d95] dark:bg-[#2e1065]",
	face: "bg-[#7c3aed] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#6d28d9] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
const NEUTRAL: KeycapStyle = {
	shell: "bg-[#404040] dark:bg-[#262626]",
	face: "bg-[#737373] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#525252] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};

const STATUS_STYLES: Record<string, { style: KeycapStyle; label: string }> = {
	delivered: { style: GREEN, label: "Delivered" },
	sent: { style: GREEN, label: "Sent" },
	opened: { style: BLUE, label: "Opened" },
	clicked: { style: PURPLE, label: "Clicked" },
	pending: { style: AMBER, label: "Pending" },
	failed: { style: RED, label: "Failed" },
	bounced: { style: RED, label: "Bounced" },
	spam: { style: RED, label: "Spam" },
};

export function EmailStatusBadge({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const key = status.toLowerCase();
	const config = STATUS_STYLES[key] ?? {
		style: NEUTRAL,
		label: key.charAt(0).toUpperCase() + key.slice(1),
	};

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-[5px] p-px pb-[2px]",
				config.style.shell,
				className,
			)}
		>
			<span
				className={cn(
					"flex h-5 items-center rounded-[4px] px-2 text-white",
					config.style.face,
				)}
			>
				<span className="font-medium text-[12px] leading-none tracking-tight">
					{config.label}
				</span>
			</span>
		</span>
	);
}
