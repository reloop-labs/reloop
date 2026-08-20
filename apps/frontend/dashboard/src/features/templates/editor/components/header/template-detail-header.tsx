import { cn } from "@reloop/ui/cn";
import { AnimatedSidebarToggleIcon } from "#/features/dashboard/sidebar/animated-sidebar-toggle-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";
import { useSidebarCollapse } from "#/features/dashboard/sidebar/use-sidebar-collapse";
import type { ConnectionStatus as ConnectionStatusType } from "../../collobration/hooks/useCollaboration";
import { CenterNav } from "./center-nav";
import { HeaderActions } from "./header-actions";
import { TemplateName } from "./template-name";

function SidebarToggleButton() {
	const { isCollapsed, toggle } = useSidebarCollapse();
	const {
		isAnimating,
		onPointerEnter,
		onPointerLeave,
		onAnimationStart,
		onAnimationEnd,
	} = usePlayAnimationOnHover(500);

	return (
		<button
			type="button"
			onClick={toggle}
			title="Toggle Sidebar (⌘B)"
			data-animating={isAnimating || undefined}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onAnimationStart={onAnimationStart}
			onAnimationEnd={onAnimationEnd}
			className={cn(
				"group flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors",
				"hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5",
			)}
		>
			<AnimatedSidebarToggleIcon
				className={cn("h-4 w-4", isCollapsed && "rotate-180")}
			/>
		</button>
	);
}

interface TemplateDetailHeaderProps {
	connectionStatus: ConnectionStatusType;
	isSynced: boolean;
}

export function TemplateDetailHeader({
	connectionStatus,
	isSynced,
}: TemplateDetailHeaderProps) {
	return (
		<div className="relative flex shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-white-0 px-4 py-2.5 dark:border-stroke-soft-100/40 dark:bg-black">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<SidebarToggleButton />
				<CenterNav />
			</div>
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
				<div className="pointer-events-auto">
					<TemplateName />
				</div>
			</div>
			<div className="flex flex-1 items-center justify-end">
				<HeaderActions
					connectionStatus={connectionStatus}
					isSynced={isSynced}
				/>
			</div>
		</div>
	);
}
