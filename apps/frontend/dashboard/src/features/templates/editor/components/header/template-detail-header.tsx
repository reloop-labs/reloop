import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMediaQuery } from "usehooks-ts";
import { AnimatedSidebarToggleIcon } from "#/features/dashboard/sidebar/animated-sidebar-toggle-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";
import { useSidebarCollapse } from "#/features/dashboard/sidebar/use-sidebar-collapse";
import type { ConnectionStatus as ConnectionStatusType } from "../../collobration/hooks/useCollaboration";
import {
	PHONE_QUERY,
	useInspectorSheet,
} from "../../hooks/use-inspector-sheet";
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
		<Tooltip.Root delayDuration={300} disableHoverableContent>
			<Tooltip.Trigger asChild>
				<button
					aria-label="Toggle sidebar"
					type="button"
					onClick={toggle}
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
			</Tooltip.Trigger>
			<Tooltip.Content
				side="bottom"
				align="start"
				variant="light"
				size="small"
				showArrow={false}
				shortcut={["mod", "B"]}
			>
				Toggle sidebar
			</Tooltip.Content>
		</Tooltip.Root>
	);
}

interface TemplateDetailHeaderProps {
	connectionStatus: ConnectionStatusType;
	isSynced: boolean;
}

const VIEW_MODES = ["visual", "code", "history", "variables"] as const;

/** Phone-only: opens the inspector bottom sheet. Hidden in code view. */
function StyleSheetButton() {
	const isOpen = useInspectorSheet((s) => s.open);
	const toggle = useInspectorSheet((s) => s.toggle);
	return (
		<button
			type="button"
			onClick={toggle}
			aria-label="Style panel"
			aria-expanded={isOpen}
			aria-controls="template-inspector-sheet"
			className={cn(
				"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] dark:border-stroke-soft-100/40",
				isOpen
					? "bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white"
					: "text-text-sub-600",
			)}
		>
			<Icon name="brush" className="size-3.5" />
		</button>
	);
}

export function TemplateDetailHeader({
	connectionStatus,
	isSynced,
}: TemplateDetailHeaderProps) {
	const isPhone = useMediaQuery(PHONE_QUERY);
	const [viewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(VIEW_MODES).withDefault("visual"),
	);
	const isCodeView = viewMode === "code";

	// Phones can't fit the centered name over the actions; stack them instead.
	if (isPhone) {
		return (
			<div className="flex shrink-0 flex-col gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-3 py-2 dark:border-stroke-soft-100/40 dark:bg-black">
				<div className="flex min-w-0 items-center gap-2">
					<SidebarToggleButton />
					<CenterNav />
					<div className="min-w-0 flex-1 overflow-hidden">
						<TemplateName />
					</div>
					{!isCodeView && <StyleSheetButton />}
				</div>
				<div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					<div className="flex w-max min-w-full justify-end">
						<HeaderActions
							connectionStatus={connectionStatus}
							isSynced={isSynced}
						/>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex shrink-0 items-center justify-between border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-2.5 dark:border-stroke-soft-100/40 dark:bg-black">
			<div className="flex min-w-0 flex-1 items-center gap-2">
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
