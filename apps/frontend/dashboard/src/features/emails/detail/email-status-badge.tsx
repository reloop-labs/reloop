import { cn } from "@reloop/ui/cn";

/** Same 3D keycap shell/face treatment as `ContactStatusBadge` (solid variant). */
export type KeycapStyle = { shell: string; face: string };

export const GREEN_KEYCAP: KeycapStyle = {
	shell: "bg-[#065f46] dark:bg-[#064e3b]",
	face: "bg-[#059669] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#047857] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
export const RED_KEYCAP: KeycapStyle = {
	shell: "bg-[#991b1b] dark:bg-[#7f1d1d]",
	face: "bg-[#dc2626] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b91c1c] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
export const AMBER_KEYCAP: KeycapStyle = {
	shell: "bg-[#78350f] dark:bg-[#451a03]",
	face: "bg-[#d97706] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b45309] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
export const BLUE_KEYCAP: KeycapStyle = {
	shell: "bg-[#1e3a8a] dark:bg-[#172554]",
	face: "bg-[#2563eb] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#1d4ed8] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
export const PURPLE_KEYCAP: KeycapStyle = {
	shell: "bg-[#4c1d95] dark:bg-[#2e1065]",
	face: "bg-[#7c3aed] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#6d28d9] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};
export const NEUTRAL_KEYCAP: KeycapStyle = {
	shell: "bg-[#404040] dark:bg-[#262626]",
	face: "bg-[#737373] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#525252] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
};

const STATUS_STYLES: Record<string, { style: KeycapStyle; label: string }> = {
	delivered: { style: GREEN_KEYCAP, label: "Delivered" },
	sent: { style: GREEN_KEYCAP, label: "Sent" },
	opened: { style: BLUE_KEYCAP, label: "Opened" },
	clicked: { style: PURPLE_KEYCAP, label: "Clicked" },
	pending: { style: AMBER_KEYCAP, label: "Pending" },
	failed: { style: RED_KEYCAP, label: "Failed" },
	bounced: { style: RED_KEYCAP, label: "Bounced" },
	spam: { style: RED_KEYCAP, label: "Spam" },
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
		style: NEUTRAL_KEYCAP,
		label: key.charAt(0).toUpperCase() + key.slice(1),
	};

	return (
		<KeycapBadge
			style={config.style}
			label={config.label}
			className={className}
		/>
	);
}

/** Solid 3D keycap pill; shared by email, log and other detail headers. */
export function KeycapBadge({
	style,
	label,
	className,
}: {
	style: KeycapStyle;
	label: string;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-[5px] p-px pb-[2px]",
				style.shell,
				className,
			)}
		>
			<span
				className={cn(
					"flex h-5 items-center rounded-[4px] px-2 text-white",
					style.face,
				)}
			>
				<span className="font-medium text-[12px] leading-none tracking-tight">
					{label}
				</span>
			</span>
		</span>
	);
}
