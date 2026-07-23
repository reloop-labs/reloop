import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useLayoutEffect, useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

const viewModes = [
	"visual",
	"ai",
	"code",
	"history",
	"variables",
	"score",
	"test",
] as const;

const TOOLBAR_ITEMS = [
	{ mode: "visual" as const, label: "Design mode", icon: "brush" },
	{ mode: "ai" as const, label: "AI Generator (Gemma 2 9B)", icon: "sparkling" },
	{ mode: "code" as const, label: "Split view / Code editor", icon: "code" },
	{ mode: "variables" as const, label: "Variables", icon: "brackets" },
	{ mode: "history" as const, label: "Version history", icon: "history" },
	{ mode: "test" as const, label: "Send test email", icon: "send" },
	{ mode: "score" as const, label: "Template score", icon: "award" },
] as const;

export function EditorToolbar() {
	const [viewMode, setViewMode] = useQueryState(
		"mode",
		parseAsStringLiteral(viewModes).withDefault("visual"),
	);

	const [hoveredEl, setHoveredEl] = useState<HTMLButtonElement | undefined>(
		undefined,
	);
	const [rect, setRect] = useState<DOMRect | undefined>(undefined);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const activeIndex = TOOLBAR_ITEMS.findIndex((item) => item.mode === viewMode);
	const activeEl = buttonRefs.current[activeIndex] || undefined;
	const currentEl = hoveredEl ?? activeEl;

	useLayoutEffect(() => {
		if (currentEl) {
			setRect(currentEl.getBoundingClientRect());
		} else {
			setRect(undefined);
		}
	}, [currentEl]);

	return (
		<div className="relative flex flex-col py-1.5">
			{TOOLBAR_ITEMS.map(({ mode, label, icon }, index) => (
				<Tooltip.Root key={mode} delayDuration={2000}>
					<Tooltip.Trigger asChild>
						<button
							ref={(el) => {
								buttonRefs.current[index] = el;
							}}
							type="button"
							onClick={() => setViewMode(mode)}
							onPointerEnter={() =>
								setHoveredEl(buttonRefs.current[index] || undefined)
							}
							onPointerLeave={() => setHoveredEl(undefined)}
							className={cn(
								"relative z-10 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
								viewMode === mode
									? "text-text-strong-950"
									: "text-text-sub-600 hover:text-text-strong-950",
							)}
						>
							<Icon name={icon} className="h-5 w-5" />
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content side="right" sideOffset={8}>
						{label}
					</Tooltip.Content>
				</Tooltip.Root>
			))}

			<AnimatedHoverBackground
				rect={rect}
				tabElement={currentEl}
				className="rounded-xl!"
			/>
		</div>
	);
}
