import { cn } from "@reloop/ui/cn";
import { Icon, type IconName } from "@reloop/ui/icon";
import type { CampaignStatus } from "../campaign-types";
import { getStatusLabel } from "../utils";

export type CampaignStatusBadgeVariant = "solid" | "light";

export interface StatusStyleConfig {
	shell: string;
	face: string;
	text: string;
	icon: IconName;
	iconClass?: string;
}

/**
 * 3D Physical keycap style:
 * - Extrusion shell with bottom lip (1.5px/2px shelf)
 * - Inset highlight on the keycap face
 * - Solid (vivid) variant for headers
 * - Light (pastel) variant for data tables
 */
const SOLID_DEFAULT_CONFIG: StatusStyleConfig = {
	shell: "bg-[#3f3f46] dark:bg-[#27272a]",
	face: "bg-[#52525b] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#3f3f46] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
	text: "text-white",
	icon: "file-text",
};

const SOLID_STATUS_CONFIGS: Record<CampaignStatus, StatusStyleConfig> = {
	sent: {
		shell: "bg-[#065f46] dark:bg-[#064e3b]",
		face: "bg-[#059669] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#047857] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
		text: "text-white",
		icon: "check",
		iconClass: "stroke-[2.5]",
	},
	sending: {
		shell: "bg-[#1e40af] dark:bg-[#1e3a8a]",
		face: "bg-[#2563eb] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#1d4ed8] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
		text: "text-white",
		icon: "refresh-cw",
	},
	scheduled: {
		shell: "bg-[#92400e] dark:bg-[#78350f]",
		face: "bg-[#d97706] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b45309] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
		text: "text-white",
		icon: "clock",
	},
	draft: {
		shell: "bg-[#d4d4d8] dark:bg-[#27272a]",
		face: "bg-[#e4e4e7] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.8)] dark:bg-[#3f3f46] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.15)]",
		text: "text-text-strong-950 dark:text-white",
		icon: "file-text",
	},
	cancelled: {
		shell: "bg-[#991b1b] dark:bg-[#7f1d1d]",
		face: "bg-[#dc2626] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b91c1c] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
		text: "text-white",
		icon: "cross",
		iconClass: "stroke-[2.5]",
	},
};

const LIGHT_DEFAULT_CONFIG: StatusStyleConfig = {
	shell: "bg-[#e4e4e7] dark:bg-[#27272a]",
	face: "bg-[#f4f4f5] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:bg-[#18181b] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
	text: "text-text-sub-600 dark:text-neutral-400",
	icon: "file-text",
};

const LIGHT_STATUS_CONFIGS: Record<CampaignStatus, StatusStyleConfig> = {
	sent: {
		shell: "bg-[#86efac] dark:bg-[#065f46]",
		face: "bg-[#dcfce7] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:bg-[#064e3b]/85 dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.12)]",
		text: "text-[#15803d] dark:text-[#4ade80]",
		icon: "check",
		iconClass: "stroke-[2.5]",
	},
	sending: {
		shell: "bg-[#93c5fd] dark:bg-[#1e40af]",
		face: "bg-[#dbeafe] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:bg-[#1e3a8a]/85 dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.12)]",
		text: "text-[#1d4ed8] dark:text-[#60a5fa]",
		icon: "refresh-cw",
	},
	scheduled: {
		shell: "bg-[#fcd34d] dark:bg-[#78350f]",
		face: "bg-[#fef3c7] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:bg-[#451a03]/85 dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.12)]",
		text: "text-[#b45309] dark:text-[#fbbf24]",
		icon: "clock",
	},
	draft: LIGHT_DEFAULT_CONFIG,
	cancelled: {
		shell: "bg-[#fca5a5] dark:bg-[#7f1d1d]",
		face: "bg-[#fee2e2] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:bg-[#450a0a]/85 dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.12)]",
		text: "text-[#b91c1c] dark:text-[#f87171]",
		icon: "cross",
		iconClass: "stroke-[2.5]",
	},
};

function getStatusConfig(
	status: CampaignStatus | string | undefined,
	variant: CampaignStatusBadgeVariant = "solid",
): StatusStyleConfig {
	const key = (status ?? "draft").toLowerCase() as CampaignStatus;
	if (variant === "light") {
		return LIGHT_STATUS_CONFIGS[key] ?? LIGHT_DEFAULT_CONFIG;
	}
	return SOLID_STATUS_CONFIGS[key] ?? SOLID_DEFAULT_CONFIG;
}

export function CampaignStatusBadge({
	status,
	className,
	variant = "solid",
	showIcon = false,
}: {
	status: CampaignStatus | string | undefined;
	className?: string;
	variant?: CampaignStatusBadgeVariant;
	showIcon?: boolean;
}) {
	const config = getStatusConfig(status, variant);
	const label = getStatusLabel((status ?? "draft") as CampaignStatus);

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-[5px] p-px pb-[2px]",
				config.shell,
				className,
			)}
		>
			<span
				className={cn(
					"flex h-5 items-center rounded-[4px] px-2",
					showIcon && "gap-1.5",
					config.face,
					config.text,
				)}
			>
				{showIcon && (
					<Icon
						name={config.icon}
						className={cn("size-3 shrink-0", config.iconClass)}
					/>
				)}
				<span className="font-medium text-[12px] leading-none tracking-tight">
					{label}
				</span>
			</span>
		</span>
	);
}
