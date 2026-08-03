import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatedBillingIcon } from "./animated-billing-icon";
import { AnimatedChannelsIcon } from "./animated-channels-icon";
import { AnimatedContactsIcon } from "./animated-contacts-icon";
import { AnimatedGearIcon } from "./animated-gear-icon";
import { AnimatedGlobeIcon } from "./animated-globe-icon";
import { AnimatedGroupsIcon } from "./animated-groups-icon";
import { AnimatedHomeIcon } from "./animated-home-icon";
import { AnimatedInboxIcon } from "./animated-inbox-icon";
import { AnimatedIntegrationIcon } from "./animated-integration-icon";
import { AnimatedKeyIcon } from "./animated-key-icon";
import { AnimatedKeyboardIcon } from "./animated-keyboard-icon";
import { AnimatedLayoutIcon } from "./animated-layout-icon";
import { AnimatedLogsIcon } from "./animated-logs-icon";
import { AnimatedMailActionIcon } from "./animated-mail-action-icon";
import { AnimatedMailIcon } from "./animated-mail-icon";
import { AnimatedMetricsIcon } from "./animated-metrics-icon";
import { AnimatedProfileIcon } from "./animated-profile-icon";
import { AnimatedSecurityIcon } from "./animated-security-icon";
import { AnimatedSmtpIcon } from "./animated-smtp-icon";
import { AnimatedTagIcon } from "./animated-tag-icon";
import { AnimatedTeamsIcon } from "./animated-teams-icon";
import { AnimatedThemeIcon } from "./animated-theme-icon";
import { AnimatedUsageIcon } from "./animated-usage-icon";
import { AnimatedWebhookIcon } from "./animated-webhook-icon";
import { AnimatedWorkflowIcon } from "./animated-workflow-icon";
import { AnimatedWorkspaceIcon } from "./animated-workspace-icon";

type SidebarNavIconProps = {
	name: string;
	className?: string;
	isSpecial?: boolean;
	isActive?: boolean;
};

export function SidebarNavIcon({
	name,
	className,
	isSpecial,
	isActive,
}: SidebarNavIconProps) {
	const tone = cn(
		"transition-colors duration-200",
		isSpecial
			? ""
			: isActive
				? "text-text-strong-950"
				: "text-text-sub-600 opacity-70 group-hover:text-text-strong-950 group-hover:opacity-100",
		className,
	);

	switch (name) {
		case "home":
			return <AnimatedHomeIcon className={tone} />;
		case "inbox":
			return <AnimatedInboxIcon className={tone} />;
		case "contacts":
			return <AnimatedContactsIcon className={tone} />;
		case "tag":
			return <AnimatedTagIcon className={tone} />;
		case "modules":
			return <AnimatedGroupsIcon className={tone} />;
		case "notification-indicator":
			return <AnimatedChannelsIcon className={tone} />;
		case "mail-single":
			return <AnimatedMailIcon className={tone} />;
		case "mail-send":
			return <AnimatedMailActionIcon direction="send" className={tone} />;
		case "mail-receive":
			return <AnimatedMailActionIcon direction="receive" className={tone} />;
		case "layout":
			return <AnimatedLayoutIcon className={tone} />;
		case "workflow":
			return <AnimatedWorkflowIcon className={tone} />;
		case "fat-row":
			return <AnimatedMetricsIcon className={tone} />;
		case "logs":
			return <AnimatedLogsIcon className={tone} />;
		case "key-new":
			return <AnimatedKeyIcon className={tone} />;
		case "globe":
			return <AnimatedGlobeIcon className={tone} />;
		case "webhook":
			return <AnimatedWebhookIcon className={tone} />;
		case "integration":
			return <AnimatedIntegrationIcon className={tone} />;
		case "smtp":
			return <AnimatedSmtpIcon className={tone} />;
		case "gear":
			return <AnimatedGearIcon className={tone} />;
		case "doughnut":
			return <AnimatedUsageIcon className={tone} />;
		case "billing-custom":
			return <AnimatedBillingIcon className={tone} />;
		case "users":
			return <AnimatedTeamsIcon className={tone} />;
		case "workspace-custom":
			return <AnimatedWorkspaceIcon className={tone} />;
		case "user":
			return <AnimatedProfileIcon className={tone} />;
		case "shield-check":
			return <AnimatedSecurityIcon className={tone} />;
		case "keyboard":
			return <AnimatedKeyboardIcon className={tone} />;
		case "swatch-book":
			return <AnimatedThemeIcon className={tone} />;
		default:
			return (
				<Icon
					name={name}
					className={cn("h-4 w-4 shrink-0 transition-all duration-200", tone)}
				/>
			);
	}
}
