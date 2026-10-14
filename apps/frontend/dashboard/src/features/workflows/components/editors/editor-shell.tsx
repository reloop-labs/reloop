"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useNodeId } from "@xyflow/react";
import { animate, MotionConfig, motion, useReducedMotion } from "motion/react";
import {
	createContext,
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useSidebarHoverBox } from "#/features/dashboard/sidebar/use-sidebar-hover-box";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useNodeEditor } from "../node-editor-context";
import { StepIcon } from "../step-icon";

interface EditorShellProps {
	/** Label on the tab above the input. */
	title: string;
	/** Called on Escape. */
	onBack: () => void;
	icon: string;
	inputRef: RefObject<HTMLInputElement | null>;
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
	onSubmit: () => void;
	submitDisabled?: boolean;
	/**
	 * A step that can be deleted and swapped for another type: the right-hand
	 * button deletes it (Enter still applies) and the tab gets a ← back to the
	 * step menu. The trigger is neither.
	 */
	removable?: boolean;
	/**
	 * The input holds the saved value and the user hasn't typed yet: keep the
	 * caret at the end of it so they can carry on typing or edit it.
	 */
	caretAtEnd?: boolean;
	mono?: boolean;
	/** Chips rendered inside the input, before the text (e.g. a chosen field). */
	prefix?: ReactNode;
	/** Shown in place of the input row (see NodeFrame's `cardContent`). */
	cardContent?: ReactNode;
	/** Second card inside the gray frame (see NodeFrame's `belowCard`). */
	belowCard?: ReactNode;
	/** Dropdown body under the input. */
	children?: ReactNode;
	className?: string;
}

/** Same quick ease-out the sidebar uses, so the canvas feels as snappy. */
export const SNAPPY_EASE = [0.32, 0.72, 0, 1] as const;

/** Fixed width of every step, its editor and the step menu — never changes. */
export const NODE_WIDTH = 400;

/** Height of the tab above the frame (minus the 1px overlap) — where the frame starts. */
export const FRAME_TOP = 35;
/** Distance from the bottom of a node to the vertical middle of its frame. */
export const FRAME_MID_FROM_BOTTOM = 30;

/** Plain icon button for a step's edit/delete actions (no divider lines). */
export const ACTION_BUTTON =
	"flex h-8 w-8 items-center justify-center rounded-lg text-text-soft-400 transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/10";
/** Wrapper that right-aligns the actions; shared so delete sits in the same spot resting and editing. */
export const ACTIONS_WRAP = "mr-2 flex shrink-0 items-center gap-0.5";

/** Right-hand cell of the frame (the → button, or the status dot at rest). */
export const TRAILING_CELL =
	"flex h-full w-[52px] shrink-0 items-center justify-center border-stroke-soft-200 border-l dark:border-stroke-soft-100/50";

/**
 * Tab + double frame shared by a step at rest and while it's being edited,
 * so switching between the two never shifts the layout.
 */
export const NodeFrame = ({
	title,
	icon,
	trailing,
	hoverable,
	showTitle = true,
	titleExiting = false,
	expanded = false,
	onBack,
	cardContent,
	belowCard,
	invalid = false,
	children,
}: {
	title: string;
	icon: string;
	/** Needs setup and Start was pressed: red outline, like an input error. */
	invalid?: boolean;
	trailing?: ReactNode;
	hoverable?: boolean;
	/**
	 * The tab only shows while editing. When hidden it still holds its space,
	 * so opening the editor never shifts the layout.
	 */
	showTitle?: boolean;
	/** Editing just ended: start the tab visible and fade it out. */
	titleExiting?: boolean;
	/**
	 * A dropdown hangs below and continues this frame's gray shell, so the
	 * bottom edge opens up (size stays the same, so nothing shifts).
	 */
	expanded?: boolean;
	/** Shows a ← in the tab (change step type); gets the clicked button. */
	onBack?: (button: HTMLElement) => void;
	/**
	 * Replaces the icon/input row with custom content (e.g. a template's
	 * preview); the card then sizes to it and `trailing` floats top-right.
	 */
	cardContent?: ReactNode;
	/** A second white card inside the same gray frame, under the first. */
	belowCard?: ReactNode;
	children: ReactNode;
}) => {
	const reduceMotion = useReducedMotion();
	const rootRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const tabRef = useRef<HTMLParagraphElement>(null);
	const nodeId = useNodeId();
	const { morph, clearMorph } = useNodeEditor();
	const [morphingIn] = useState(
		() => showTitle && morph !== null && morph.nodeId === nodeId,
	);

	// A step just picked from the "+" menu: start exactly where the menu was
	// (same width, taller) and settle into this frame, so the menu reads as
	// shrinking into the step. Heights animate for real (no scaling, so text
	// never squashes) and a matching negative margin keeps the node's
	// footprint constant, so the layout around it never jumps.
	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useLayoutEffect(() => {
		if (!showTitle || !morph || morph.nodeId !== nodeId) return;
		clearMorph();
		const root = rootRef.current;
		const frame = frameRef.current;
		const card = cardRef.current;
		if (reduceMotion || !root || !frame || !card) return;

		// Everything below writes inline styles and adds a temporary layer, so
		// the cleanup undoes all of it. React runs this effect twice in dev
		// (StrictMode); without the cleanup the first run's layer stayed behind
		// and covered the input.
		const running: { stop: () => void }[] = [];
		const play = (...args: Parameters<typeof animate>) => {
			const controls = animate(...args);
			running.push(controls);
			return controls;
		};

		// Choreography, modelled on Cloudflare's dashboard (sidebar's ease):
		//  0.00–0.28  the menu box shrinks into the step. Its rows don't move;
		//             the rising bottom edge clips them as they fade. The
		//             menu's tab fades out; the picked icon flies into the
		//             input's icon slot.
		//  0.14       the input appears at the top of the still-shrinking box,
		//             and the step's tab shows right away with it.
		//  0.30+      the dropdown unrolls (see EditorShell's unrollDelay).
		const shrink = { duration: 0.28, ease: SNAPPY_EASE };
		const inputAt = 0.14;
		const frameTo = frame.offsetHeight;
		const cardTo = card.offsetHeight;
		const dy = morph.top - root.getBoundingClientRect().top;
		const extra = morph.frameHeight - frameTo;
		const tab = tabRef.current;

		// Whole box: start where the menu was, settle into the step. The
		// negative margin keeps the node's footprint constant meanwhile.
		play(root, { y: [dy, 0] }, shrink);
		play(
			frame,
			{ height: [morph.frameHeight, frameTo], marginBottom: [-extra, 0] },
			shrink,
		);

		// Tabs: the menu's fades out in place, the step's pops in with the input.
		root.style.position = "relative";
		const oldTab = morph.tabGhost?.cloneNode(true) as HTMLElement | undefined;
		if (oldTab) {
			oldTab.setAttribute("aria-hidden", "true");
			Object.assign(oldTab.style, {
				position: "absolute",
				top: "0",
				left: "0",
				pointerEvents: "none",
			});
			root.appendChild(oldTab);
			play(oldTab, { opacity: [1, 0] }, { duration: inputAt });
		}
		if (tab) {
			tab.style.opacity = "0";
			play(tab, { opacity: [0, 1] }, { duration: 0.08, delay: inputAt });
		}

		// The menu's white card (with a snapshot of its rows) shrinking behind
		// the input. The real card keeps its size, so the icon target below is
		// measured at its final spot, and its content sits above the sheet.
		card.style.overflow = "visible";
		const sheet = document.createElement("div");
		sheet.setAttribute("aria-hidden", "true");
		sheet.className =
			"pointer-events-none absolute -inset-x-px -top-px z-0 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-[#141419]";
		sheet.style.height = `${morph.cardHeight}px`;
		const ghost = morph.ghost?.cloneNode(true) as HTMLElement | undefined;
		if (ghost) sheet.appendChild(ghost);
		card.appendChild(sheet);
		play(sheet, { height: [morph.cardHeight, cardTo] }, shrink);
		if (ghost) {
			play(ghost, { opacity: [1, 0] }, { duration: inputAt + 0.04 });
		}

		// The picked row's icon flies into the input's icon.
		const icon = card.querySelector<SVGElement>("[data-frame-icon]");
		if (icon && morph.icon) {
			const to = icon.getBoundingClientRect();
			const fromCx = morph.icon.left + morph.icon.width / 2;
			const fromCy = morph.icon.top + morph.icon.height / 2;
			const toCx = to.left + to.width / 2;
			const toCy = to.top + to.height / 2;
			play(
				icon,
				{
					x: [fromCx - toCx, 0],
					// The root is also moving by dy, so subtract it.
					y: [fromCy - toCy - dy, 0],
					scale: [morph.icon.width / to.width, 1],
				},
				shrink,
			);
		}

		// The input content (above the shrinking sheet) appears.
		const content = Array.from(card.children).filter(
			(el): el is HTMLElement | SVGElement => el !== sheet,
		);
		for (const el of content) {
			el.style.position = "relative";
			el.style.zIndex = "2";
		}
		const rest = content.filter((el) => el !== icon);
		play(rest, { opacity: [0, 1] }, { duration: 0.12, delay: inputAt });

		// Tidy up once the sequence is over (or immediately if interrupted).
		const reset = () => {
			for (const controls of running) controls.stop();
			sheet.remove();
			oldTab?.remove();
			for (const el of [root, frame, card, tab, ...content]) {
				if (!el) continue;
				el.style.removeProperty("transform");
				el.style.removeProperty("height");
				el.style.removeProperty("margin-bottom");
				el.style.removeProperty("overflow");
				el.style.removeProperty("opacity");
				el.style.removeProperty("position");
				el.style.removeProperty("z-index");
			}
		};
		const done = window.setTimeout(reset, 420);
		return () => {
			window.clearTimeout(done);
			reset();
		};
	}, []);

	return (
		<div ref={rootRef} className="flex flex-col" style={{ width: NODE_WIDTH }}>
			<motion.p
				ref={tabRef}
				aria-hidden={!showTitle}
				initial={
					reduceMotion || morphingIn
						? false
						: showTitle
							? { opacity: 0, y: 6 }
							: titleExiting
								? { opacity: 1, y: 0 }
								: false
				}
				animate={showTitle ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
				exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
				transition={{ duration: 0.16, ease: SNAPPY_EASE }}
				className={cn(
					"relative z-10 -mb-px ml-4 flex h-9 w-fit items-center rounded-t-xl border border-stroke-soft-200 border-b-0 bg-bg-weak-50 px-3.5 font-medium text-[14px] text-text-sub-600 dark:border-stroke-soft-100/50 dark:bg-[#101014]",
					!showTitle && "pointer-events-none",
				)}
			>
				{onBack ? (
					<button
						type="button"
						aria-label="Choose a different step"
						title="Choose a different step"
						onMouseDown={(e) => e.preventDefault()}
						onClick={(e) => {
							e.stopPropagation();
							onBack(e.currentTarget);
						}}
						className="mr-1.5 -ml-1.5 flex h-6 w-6 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 dark:hover:bg-white/10"
					>
						<Icon name="arrow-left" className="h-3.5 w-3.5" />
					</button>
				) : null}
				<Icon name={icon} className="mr-2 h-3.5 w-3.5 shrink-0" />
				{title}
			</motion.p>
			<div
				ref={frameRef}
				className={cn(
					"rounded-[15px] border border-stroke-soft-200 bg-bg-weak-50 p-[3px] dark:border-stroke-soft-100/50 dark:bg-[#101014]",
					expanded &&
						"rounded-b-none border-b-transparent dark:border-b-transparent",
				)}
			>
				<div
					ref={cardRef}
					className={cn(
						"relative flex rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-150 dark:border-stroke-soft-100/50 dark:bg-[#141419]",
						// Custom content (e.g. template details) can open popups, like
						// the From suggestions, that must hang outside the card.
						cardContent
							? "z-30 flex-col"
							: "h-[52px] items-center overflow-hidden",
						hoverable && "cursor-pointer hover:border-stroke-sub-300",
						invalid &&
							"border-error-base ring-4 ring-error-base/10 hover:border-error-base dark:border-error-base",
					)}
				>
					{cardContent ? (
						<>
							{cardContent}
							{trailing ? (
								<div className="absolute top-2.5 right-0.5 z-20 rounded-lg bg-bg-white-0/90 backdrop-blur-md dark:bg-[#18181f]/90 [&>*]:mr-0">
									{trailing}
								</div>
							) : null}
						</>
					) : (
						<>
							<Icon
								data-frame-icon
								name={icon}
								className="ml-4 h-[18px] w-[18px] shrink-0 text-text-strong-950"
							/>
							{children}
							{trailing}
						</>
					)}
				</div>
				{belowCard ? (
					<div className="mt-[3px] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-[#141419]">
						{belowCard}
					</div>
				) : null}
			</div>
		</div>
	);
};

/**
 * Tabbed input that a step turns into while it is being edited: a tab naming
 * what you're doing, a framed search field with a submit arrow, and a
 * dropdown of choices underneath.
 */
export const EditorShell = ({
	title,
	onBack,
	icon,
	inputRef,
	value,
	onChange,
	placeholder,
	onKeyDown,
	onSubmit,
	submitDisabled,
	removable,
	caretAtEnd,
	mono,
	prefix,
	cardContent,
	belowCard,
	children,
	className,
}: EditorShellProps) => {
	const nodeId = useNodeId();
	const { morph, deleteNode, openPicker, closeEditor } = useNodeEditor();
	// Growing out of the "+" menu: unroll the dropdown once the box has settled.
	const [morphingIn] = useState(() => morph?.nodeId === nodeId);
	const unrollDelay = morphingIn ? 0.3 : 0;

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		input.focus({ preventScroll: true });
		// Re-run when the prefilled value arrives (e.g. after data loads).
		if (caretAtEnd) input.setSelectionRange(value.length, value.length);
	}, [inputRef, caretAtEnd, value]);

	return (
		<div
			className={cn("nodrag nopan nowheel relative cursor-default", className)}
		>
			<NodeFrame
				title={title}
				icon={icon}
				cardContent={cardContent}
				belowCard={belowCard}
				expanded={Boolean(children)}
				onBack={
					removable && nodeId
						? (button) => {
								// Close this editor and reopen the step menu right here.
								closeEditor();
								openPicker({ type: "replace", nodeId }, button);
							}
						: undefined
				}
				trailing={
					removable && nodeId ? (
						// Same plain button, same spot as on the resting step.
						<span className={ACTIONS_WRAP}>
							<button
								type="button"
								aria-label={`Delete ${title} step`}
								title="Delete step"
								onClick={(e) => {
									e.stopPropagation();
									deleteNode(nodeId);
								}}
								className={cn(ACTION_BUTTON, "hover:text-error-base")}
							>
								<Icon name="trash" className="h-4 w-4" />
							</button>
						</span>
					) : (
						<button
							type="button"
							aria-label="Apply"
							disabled={submitDisabled}
							onClick={(e) => {
								e.stopPropagation();
								onSubmit();
							}}
							className={cn(
								TRAILING_CELL,
								"text-text-sub-600 transition-colors hover:text-text-strong-950 disabled:opacity-40",
							)}
						>
							<Icon name="arrow-right" className="h-[18px] w-[18px]" />
						</button>
					)
				}
			>
				{prefix ? (
					<div className="ml-2 flex shrink-0 items-center gap-1">{prefix}</div>
				) : null}
				<input
					ref={inputRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						e.stopPropagation();
						if (e.key === "Escape") {
							e.preventDefault();
							onBack();
							return;
						}
						onKeyDown?.(e);
					}}
					placeholder={placeholder}
					aria-label={placeholder}
					className={cn(
						"h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-text-strong-950 outline-none placeholder:text-text-soft-400",
						mono && "font-mono text-[14px]",
					)}
				/>
			</NodeFrame>

			{children ? (
				<MotionConfig reducedMotion="user">
					{/*
					 * The input's gray shell continues down around the list, so the
					 * search and its results read as one box. It unrolls on open.
					 */}
					<motion.div
						initial={{ height: 0 }}
						animate={{ height: "auto" }}
						exit={{
							height: 0,
							transition: { duration: 0.16, ease: SNAPPY_EASE },
						}}
						transition={{
							duration: 0.2,
							delay: unrollDelay,
							ease: SNAPPY_EASE,
						}}
						className="absolute top-full right-0 left-0 z-20 overflow-hidden rounded-b-[15px] border border-stroke-soft-200 border-t-0 bg-bg-weak-50 dark:border-stroke-soft-100/50 dark:bg-[#101014]"
					>
						<motion.div
							initial={{ opacity: 0, y: -4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, transition: { duration: 0.1 } }}
							transition={{
								duration: 0.16,
								delay: unrollDelay + 0.03,
								ease: SNAPPY_EASE,
							}}
							className="px-[3px] pt-[3px] pb-[3px]"
						>
							<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-[#141419]">
								<MenuHighlightScope>{children}</MenuHighlightScope>
							</div>
						</motion.div>
					</motion.div>
				</MotionConfig>
			) : null}
		</div>
	);
};

/**
 * The sidebar's sliding hover pill, reused as-is: rows report the element
 * under the pointer (or the keyboard-highlighted option when the pointer is
 * elsewhere), `useSidebarHoverBox` measures it, and `AnimatedHoverBackground`
 * slides one pill to it.
 */
const HighlightContext = createContext<{
	setHoveredEl: (el: HTMLElement | undefined) => void;
	setActiveEl: (el: HTMLElement | undefined) => void;
}>({ setHoveredEl: () => {}, setActiveEl: () => {} });

const MenuHighlightScope = ({ children }: { children: ReactNode }) => {
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
	const [hoveredEl, setHoveredEl] = useState<HTMLElement | undefined>();
	const [activeEl, setActiveEl] = useState<HTMLElement | undefined>();
	const currentEl = hoveredEl ?? activeEl;
	const hoverBox = useSidebarHoverBox(currentEl, containerEl);

	return (
		<HighlightContext.Provider value={{ setHoveredEl, setActiveEl }}>
			<div
				ref={setContainerEl}
				className="relative"
				onPointerLeave={() => setHoveredEl(undefined)}
			>
				{children}
				<AnimatedHoverBackground
					box={hoverBox}
					isDanger={currentEl?.dataset.tone === "danger"}
				/>
			</div>
		</HighlightContext.Provider>
	);
};

/** Scrollable option list inside the dropdown. */
export const MenuList = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<div
		role="listbox"
		aria-label={label}
		className="scrollbar-thin max-h-60 overflow-y-auto overscroll-contain p-1"
	>
		{children}
	</div>
);

export const MenuItem = ({
	icon,
	label,
	meta,
	mono,
	active,
	selected,
	onHover,
	onSelect,
	onEdit,
	editLabel = "Edit",
}: {
	icon?: string;
	label: ReactNode;
	meta?: ReactNode;
	mono?: boolean;
	/** Keyboard/hover highlight. */
	active?: boolean;
	/** The currently saved value. */
	selected?: boolean;
	onHover?: () => void;
	onSelect: () => void;
	/** Shows a pencil inside the row that edits this option. */
	onEdit?: () => void;
	editLabel?: string;
}) => {
	const { setHoveredEl, setActiveEl } = useContext(HighlightContext);
	const rowRef = useRef<HTMLDivElement>(null);
	// Keyboard (or hover) moved the highlight here: the pill follows it.
	useEffect(() => {
		if (!active) return;
		setActiveEl(rowRef.current ?? undefined);
		setHoveredEl(undefined);
	}, [active, setActiveEl, setHoveredEl]);
	return (
		// A div rather than a button so the row can hold its own edit button;
		// keyboard selection goes through the search input.
		<div
			ref={rowRef}
			role="option"
			tabIndex={-1}
			aria-selected={active}
			onPointerEnter={(e) => {
				setHoveredEl(e.currentTarget);
				onHover?.();
			}}
			onMouseDown={(e) => e.preventDefault()}
			onClick={(e) => {
				e.stopPropagation();
				onSelect();
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter") onSelect();
			}}
			className={cn(
				"group relative z-10 flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg pr-1.5 pl-2.5 text-left",
			)}
		>
			{icon ? (
				<StepIcon
					name={icon}
					className="text-text-sub-600 transition-colors group-hover:text-text-strong-950"
				/>
			) : null}
			<span
				className={cn(
					"min-w-0 flex-1 truncate text-[14px] text-text-strong-950",
					mono && "font-mono text-[13px]",
				)}
			>
				{label}
			</span>
			{selected ? (
				<StepIcon name="check" className="text-text-strong-950" />
			) : meta ? (
				<span className="shrink-0 text-[13px] text-text-soft-400">{meta}</span>
			) : null}
			{onEdit ? (
				<button
					type="button"
					aria-label={editLabel}
					title={editLabel}
					onMouseDown={(e) => e.preventDefault()}
					onClick={(e) => {
						e.stopPropagation();
						onEdit();
					}}
					className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-white-0 hover:text-text-strong-950 dark:hover:bg-white/10"
				>
					<Icon name="edit" className="h-3.5 w-3.5" />
				</button>
			) : (
				<span className="w-1" />
			)}
		</div>
	);
};

export const MenuEmpty = ({ children }: { children: ReactNode }) => (
	<p className="px-3 py-3 text-[13px] text-text-soft-400">{children}</p>
);

/** Secondary actions under the options (create, delete…). */
export const MenuFooter = ({ children }: { children: ReactNode }) => (
	<div className="p-1 pt-0">{children}</div>
);

export const MenuAction = ({
	icon,
	children,
	tone = "default",
	disabled,
	onClick,
}: {
	icon: string;
	children: ReactNode;
	tone?: "default" | "danger";
	disabled?: boolean;
	onClick: () => void;
}) => {
	const { setHoveredEl } = useContext(HighlightContext);
	return (
		<button
			type="button"
			data-tone={tone}
			onPointerEnter={(e) => setHoveredEl(e.currentTarget)}
			disabled={disabled}
			onMouseDown={(e) => e.preventDefault()}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			className={cn(
				"group relative z-10 flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[14px] transition-colors disabled:cursor-wait disabled:opacity-60",
				tone === "danger"
					? "text-text-sub-600 hover:text-error-base"
					: "text-text-sub-600 hover:text-text-strong-950",
			)}
		>
			<StepIcon name={icon} />
			<span className="min-w-0 flex-1 truncate">{children}</span>
		</button>
	);
};

/** Arrow-key highlight over a list of `count` options. */
export function useListNav(count: number, onEnter: (index: number) => void) {
	const [highlight, setHighlight] = useState(0);
	const clamped = Math.min(highlight, Math.max(count - 1, 0));
	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlight(Math.min(clamped + 1, count - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlight(Math.max(clamped - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			onEnter(clamped);
		}
	};
	return {
		highlight: clamped,
		setHighlight,
		onKeyDown,
		submit: () => onEnter(clamped),
	};
}
