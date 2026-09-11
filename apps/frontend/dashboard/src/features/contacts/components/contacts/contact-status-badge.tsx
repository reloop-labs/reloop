import { cn } from "@reloop/ui/cn";
import { Icon, type IconName } from "@reloop/ui/icon";
import {
	type AudienceStatus,
	getStatusLabel,
} from "#/features/contacts/audience";

export interface StatusStyleConfig {
	shell: string;
	face: string;
	icon: IconName;
	iconClass?: string;
}

/**
 * 3D Physical keycap style referencing web tools hero section:
 * - Extrusion shell with bottom lip (1.5px/2px shelf)
 * - Inset highlight on the keycap face
 * - Checkmark icon + status label together inside the 3D box
 */
const DEFAULT_CONFIG: StatusStyleConfig = {
	shell: "bg-[#991b1b] dark:bg-[#7f1d1d]",
	face: "bg-[#dc2626] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b91c1c] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
	icon: "cross",
	iconClass: "stroke-[2.5]",
};

const STATUS_CONFIGS: Record<string, StatusStyleConfig> = {
	subscribed: {
		shell: "bg-[#065f46] dark:bg-[#064e3b]",
		face: "bg-[#059669] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#047857] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
		icon: "check",
	},
	unsubscribed: DEFAULT_CONFIG,
	blocked: {
		shell: "bg-[#78350f] dark:bg-[#451a03]",
		face: "bg-[#d97706] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#b45309] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
		icon: "slash",
	},
};

export function ContactStatusGlyph({
	status,
	className,
}: {
	status: AudienceStatus | string;
	className?: string;
}) {
	const key = (status ?? "subscribed").toLowerCase();
	const config: StatusStyleConfig = STATUS_CONFIGS[key] ?? DEFAULT_CONFIG;

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
					"flex size-full items-center justify-center rounded-[4px] text-white",
					config.face,
				)}
			>
				<Icon
					name={config.icon}
					className={cn("size-3 text-white", config.iconClass)}
				/>
			</span>
		</span>
	);
}

export function ContactStatusBadge({
	status,
	className,
	iconOnly = false,
}: {
	status: AudienceStatus | string;
	className?: string;
	iconOnly?: boolean;
}) {
	const key = (status ?? "subscribed").toLowerCase();
	const config: StatusStyleConfig = STATUS_CONFIGS[key] ?? DEFAULT_CONFIG;
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
					"flex h-5 items-center rounded-[4px] text-white",
					iconOnly ? "size-5 justify-center" : "gap-1.5 px-2",
					config.face,
				)}
			>
				<Icon
					name={config.icon}
					className={cn("size-3 shrink-0 text-white", config.iconClass)}
				/>
				{!iconOnly && (
					<span className="font-medium text-[12px] text-white leading-none tracking-tight">
						{label}
					</span>
				)}
			</span>
		</span>
	);
}
