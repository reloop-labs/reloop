import { cn } from "@reloop/ui/cn";
import { Icon, type IconName } from "@reloop/ui/icon";
import {
	type AudienceStatus,
	getStatusLabel,
} from "#/features/contacts/audience";

export type StatusBadgeVariant = "solid" | "light";

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
 * - Solid (dark) variant for contact header
 * - Light (pastel) variant for data tables
 */
const SOLID_DEFAULT_CONFIG: StatusStyleConfig = {
	shell: "bg-[#991b1b] dark:bg-[#7f1d1d]",
	face: "bg-[#dc2626] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b91c1c] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
	text: "text-white",
	icon: "cross",
	iconClass: "stroke-[2.5]",
};

const SOLID_STATUS_CONFIGS: Record<string, StatusStyleConfig> = {
	subscribed: {
		shell: "bg-[#065f46] dark:bg-[#064e3b]",
		face: "bg-[#059669] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#047857] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
		text: "text-white",
		icon: "check",
	},
	unsubscribed: SOLID_DEFAULT_CONFIG,
	blocked: {
		shell: "bg-[#78350f] dark:bg-[#451a03]",
		face: "bg-[#d97706] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b45309] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
		text: "text-white",
		icon: "slash",
	},
};

const LIGHT_DEFAULT_CONFIG: StatusStyleConfig = {
	shell: "bg-[#fca5a5] dark:bg-[#7f1d1d]",
	face: "bg-[#fee2e2] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:bg-[#450a0a]/85 dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.12)]",
	text: "text-[#b91c1c] dark:text-[#f87171]",
	icon: "cross",
	iconClass: "stroke-[2.5]",
};

const LIGHT_STATUS_CONFIGS: Record<string, StatusStyleConfig> = {
	subscribed: {
		shell: "bg-[#86efac] dark:bg-[#065f46]",
		face: "bg-[#dcfce7] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:bg-[#064e3b]/85 dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.12)]",
		text: "text-[#15803d] dark:text-[#4ade80]",
		icon: "check",
	},
	unsubscribed: LIGHT_DEFAULT_CONFIG,
	blocked: {
		shell: "bg-[#fcd34d] dark:bg-[#78350f]",
		face: "bg-[#fef3c7] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:bg-[#451a03]/85 dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.12)]",
		text: "text-[#b45309] dark:text-[#fbbf24]",
		icon: "slash",
	},
};

function getStatusConfig(
	status: AudienceStatus | string,
	variant: StatusBadgeVariant = "solid",
): StatusStyleConfig {
	const key = (status ?? "subscribed").toLowerCase();
	if (variant === "light") {
		return LIGHT_STATUS_CONFIGS[key] ?? LIGHT_DEFAULT_CONFIG;
	}
	return SOLID_STATUS_CONFIGS[key] ?? SOLID_DEFAULT_CONFIG;
}

export function ContactStatusGlyph({
	status,
	className,
	variant = "solid",
}: {
	status: AudienceStatus | string;
	className?: string;
	variant?: StatusBadgeVariant;
}) {
	const config = getStatusConfig(status, variant);

	return (
		<span
			aria-hidden
			className={cn(
				"inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] p-px pb-[2px]",
				config.shell,
				className,
			)}
		>
			<span
				className={cn(
					"flex size-full items-center justify-center rounded-[4px]",
					config.face,
					config.text,
				)}
			>
				<Icon
					name={config.icon}
					className={cn("size-3", config.iconClass)}
				/>
			</span>
		</span>
	);
}

export function ContactStatusBadge({
	status,
	className,
	variant = "solid",
	showIcon = false,
}: {
	status: AudienceStatus | string;
	className?: string;
	variant?: StatusBadgeVariant;
	showIcon?: boolean;
}) {
	const config = getStatusConfig(status, variant);
	const label = getStatusLabel(status);

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
