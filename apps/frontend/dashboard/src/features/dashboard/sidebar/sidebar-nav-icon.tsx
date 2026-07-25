import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatedContactsIcon } from "./animated-contacts-icon";
import { AnimatedGroupsIcon } from "./animated-groups-icon";
import { AnimatedHomeIcon } from "./animated-home-icon";
import { AnimatedInboxIcon } from "./animated-inbox-icon";
import { AnimatedTagIcon } from "./animated-tag-icon";

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
		default:
			return (
				<Icon
					name={name}
					className={cn("h-4 w-4 shrink-0 transition-all duration-200", tone)}
				/>
			);
	}
}
