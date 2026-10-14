"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Handle, Position, useEdges, useNodeId } from "@xyflow/react";
import {
	AnimatePresence,
	animate,
	MotionConfig,
	motion,
	useReducedMotion,
} from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";
import { BRANCH_OFFSET, BRANCH_SPLIT_DROP } from "../../layout";
import {
	ACTION_BUTTON,
	ACTIONS_WRAP,
	FRAME_MID_FROM_BOTTOM,
	FRAME_TOP,
	NodeFrame,
	SNAPPY_EASE,
} from "../editors/editor-shell";
import {
	type PickerTarget,
	pickerTargetKey,
	useNodeEditor,
} from "../node-editor-context";
import { RunStepCard } from "../runs/run-step-card";
import { StepIcon } from "../step-icon";

/** The value from the previous render (the current value on first render). */
export function usePrevious<T>(value: T): T {
	const ref = useRef(value);
	useEffect(() => {
		ref.current = value;
	});
	return ref.current;
}

const hiddenHandle =
	"!h-px !w-px !min-h-0 !min-w-0 !border-0 !bg-transparent pointer-events-none";

/** Small square nub on a node's outgoing side, like a port. */
const portHandle =
	"!h-2.5 !w-1.5 !min-h-0 !min-w-0 !rounded-[2px] !border-0 !bg-stroke-sub-300 pointer-events-none";

/** Where incoming arrows land: the top of the frame, under the tab row (or `top`). */
export const TargetHandle = ({ top = FRAME_TOP }: { top?: number }) => (
	<Handle
		type="target"
		position={Position.Top}
		isConnectable={false}
		className={hiddenHandle}
		style={{ top }}
	/>
);

export const SourceHandle = ({
	id,
	position = Position.Bottom,
	hidden,
}: {
	id?: string;
	position?: Position;
	/** Keeps the handle for edges but hides the nub (e.g. while editing). */
	hidden?: boolean;
}) => (
	<Handle
		type="source"
		id={id}
		position={position}
		isConnectable={false}
		className={cn(
			portHandle,
			position !== Position.Right && "!h-1.5 !w-2.5",
			hidden && "!opacity-0",
		)}
		style={
			position === Position.Right
				? { top: `calc(100% - ${FRAME_MID_FROM_BOTTOM}px)` }
				: undefined
		}
	/>
);

interface NodePillProps {
	/** Step type shown on the tab, e.g. "Trigger". */
	title: string;
	icon: string;
	/** Main text; falls back to the muted `placeholder` when empty. */
	label?: string | null;
	placeholder: string;
	mono?: boolean;
	ready: boolean;
	/** True on the render right after editing closed, to fade the tab out. */
	titleExiting?: boolean;
	/** Adds a delete button next to edit (every step except the trigger). */
	removable?: boolean;
	/** Replaces the icon + label row (e.g. a template's details). */
	cardContent?: ReactNode;
	/** Second card inside the frame (e.g. the template's email preview). */
	belowCard?: ReactNode;
}

/**
 * A step at rest: same frame as its editor. Edit (and delete) sit in the
 * right-hand cells, so a step can be changed straight from the canvas; an
 * amber dot after the label flags missing setup.
 */
export const NodePill = ({
	title,
	icon,
	label,
	placeholder,
	mono,
	ready,
	titleExiting,
	removable,
	cardContent,
	belowCard,
}: NodePillProps) => {
	const nodeId = useNodeId();
	const { readOnly, editNode, deleteNode, showIssues, run } = useNodeEditor();
	const reduceMotion = useReducedMotion();
	const invalid = Boolean(showIssues) && !ready && !readOnly;
	// On the Runs view every step is compact, with how this run went below it.
	const runCard =
		run && nodeId ? <RunStepCard run={run} nodeId={nodeId} /> : null;
	// Plain icon buttons (no divider lines) on the right of the box.
	const actions =
		readOnly || !nodeId ? null : (
			<span className={ACTIONS_WRAP}>
				<button
					type="button"
					aria-label={`Edit ${title} step`}
					title="Edit"
					onClick={(e) => {
						e.stopPropagation();
						const button = e.currentTarget;
						if (reduceMotion) return editNode(nodeId);
						// Slide under the delete button (which stays put in the
						// editor) while fading out, then open the editor.
						const distance = removable ? button.offsetWidth + 2 : 12;
						animate(
							button,
							{ x: [0, distance], opacity: [1, 0] },
							{ duration: 0.18, ease: SNAPPY_EASE },
						).then(() => editNode(nodeId));
					}}
					className={cn(ACTION_BUTTON, "hover:text-text-strong-950")}
				>
					<Icon name="edit" className="h-4 w-4" />
				</button>
				{removable ? (
					<button
						type="button"
						aria-label={`Delete ${title} step`}
						title="Delete"
						onClick={(e) => {
							e.stopPropagation();
							deleteNode(nodeId);
						}}
						className={cn(ACTION_BUTTON, "relative z-10 hover:text-error-base")}
					>
						<Icon name="trash" className="h-4 w-4" />
					</button>
				) : null}
			</span>
		);

	return (
		<NodeFrame
			title={title}
			icon={icon}
			hoverable
			showTitle={false}
			titleExiting={titleExiting}
			trailing={actions}
			cardContent={runCard ? undefined : cardContent}
			belowCard={runCard ?? belowCard}
			invalid={invalid}
		>
			<span
				className={cn(
					"min-w-0 flex-1 truncate px-3 text-[15px]",
					label ? "text-text-strong-950" : "text-text-soft-400",
					mono && label && "font-mono text-[14px]",
				)}
			>
				{label || placeholder}
			</span>
			{ready || run ? null : (
				<span className="mr-3 flex shrink-0">
					<StatusDot ready={false} />
				</span>
			)}
		</NodeFrame>
	);
};

export const StatusDot = ({ ready }: { ready: boolean }) => (
	<span
		role="img"
		aria-label={ready ? "Ready" : "Needs setup"}
		className={cn(
			"flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
			ready ? "bg-green-500/15" : "bg-warning-base/15",
		)}
	>
		<span
			className={cn(
				"h-2 w-2 rounded-full",
				ready ? "bg-green-500" : "bg-warning-base",
			)}
		/>
	</span>
);

/**
 * Heavier "+" that turns into "×" by rotating 45° (rather than swapping
 * icons), using the sidebar's ease so open/close feels the same.
 */
export const RotatingPlus = ({
	open,
	className,
}: {
	open: boolean;
	className?: string;
}) => (
	<StepIcon
		name="plus"
		className={cn(
			"transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
			open && "rotate-45",
			className,
		)}
	/>
);

/** Black "+" button that opens the step picker; turns into "×" while open. */
export const AddStepButton = ({
	target,
	size = "md",
	label = "Add a step",
}: {
	target: PickerTarget;
	size?: "sm" | "md";
	label?: string;
}) => {
	const { openPicker, closePicker, activePickerKey } = useNodeEditor();
	const active = activePickerKey === pickerTargetKey(target);
	return (
		<button
			type="button"
			aria-label={active ? "Close step picker" : label}
			aria-expanded={active}
			onClick={(e) => {
				e.stopPropagation();
				if (active) closePicker();
				else openPicker(target, e.currentTarget);
			}}
			className={cn(
				"nodrag nopan pointer-events-auto flex shrink-0 items-center justify-center bg-bg-strong-950 text-text-white-0 transition-transform duration-150 hover:scale-105 active:scale-95",
				size === "md" ? "h-8 w-8 rounded-[9px]" : "h-6 w-6 rounded-[7px]",
			)}
		>
			<RotatingPlus
				open={active}
				className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"}
			/>
		</button>
	);
};

/** Dashed SVG line whose dashes march along the path toward the "+". */
const MarchingDash = ({
	d,
	width,
	height,
	active,
}: {
	d: string;
	width: number;
	height: number;
	active: boolean;
}) => {
	const reduceMotion = useReducedMotion();
	return (
		<svg
			aria-hidden
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			fill="none"
			className={cn(
				"shrink-0 overflow-visible transition-colors duration-150",
				active ? "text-stroke-strong-950" : "text-stroke-sub-300",
			)}
		>
			<path
				d={d}
				stroke="currentColor"
				strokeWidth={2}
				strokeDasharray="4 4"
				strokeLinecap="butt"
			>
				{reduceMotion ? null : (
					<animate
						attributeName="stroke-dashoffset"
						from="8"
						to="0"
						dur={active ? "0.4s" : "0.8s"}
						repeatCount="indefinite"
					/>
				)}
			</path>
		</svg>
	);
};

/** Small mono label used for a branch (YES / NO). */
export const BranchLabel = ({ children }: { children: ReactNode }) => (
	<span className="flex h-6 items-center rounded-[7px] border border-stroke-soft-200 bg-bg-white-0 px-1.5 font-mono text-[10px] text-text-sub-600 uppercase tracking-wide dark:border-stroke-soft-100/50 dark:bg-[#141419]">
		{children}
	</span>
);

/** Total height of a forked stub's dashed line, from the node's bottom to the "+". */
const FORK_DEPTH = 76;

/**
 * Dashed tail + "+" hanging off a handle that has nothing connected yet.
 * `down` continues the column; `left` / `right` fork out of a condition's
 * bottom center into its Yes / No path.
 */
export const DanglingStub = ({
	nodeId,
	handle,
	direction = "down",
	caption,
}: {
	nodeId: string;
	handle?: string;
	direction?: "down" | "left" | "right";
	caption?: ReactNode;
}) => {
	const edges = useEdges();
	const { readOnly, activePickerKey } = useNodeEditor();
	const target: PickerTarget = { type: "append", nodeId, handle };
	const connected = edges.some(
		(e) => e.source === nodeId && (e.sourceHandle ?? undefined) === handle,
	);
	if (readOnly || connected) return null;
	const active = activePickerKey === pickerTargetKey(target);

	if (direction !== "down") {
		const sign = direction === "left" ? -1 : 1;
		const w = BRANCH_OFFSET;
		const r = 10;
		const drop = BRANCH_SPLIT_DROP;
		// Drawn from the fork point outward; mirrored for the left branch.
		const d = `M 1 0 V ${drop - r} Q 1 ${drop} ${1 + r} ${drop} H ${w - r + 1} Q ${w + 1} ${drop} ${w + 1} ${drop + r} V ${FORK_DEPTH}`;
		return (
			<div className="pointer-events-none absolute top-full left-1/2 h-0 w-0">
				<div
					className="absolute top-0"
					style={{
						left: sign === 1 ? -1 : -(w + 1),
						transform: sign === 1 ? undefined : "scaleX(-1)",
					}}
				>
					<MarchingDash
						width={w + 2}
						height={FORK_DEPTH}
						d={d}
						active={active}
					/>
				</div>
				{caption ? (
					<div
						className="absolute -translate-x-1/2 -translate-y-1/2"
						style={{ left: sign * w, top: (drop + FORK_DEPTH) / 2 + 4 }}
					>
						<BranchLabel>{caption}</BranchLabel>
					</div>
				) : null}
				<div
					className="absolute -translate-x-1/2"
					style={{ left: sign * w, top: FORK_DEPTH }}
				>
					<AddStepButton target={target} />
				</div>
			</div>
		);
	}

	return (
		<div className="pointer-events-none absolute top-full left-1/2 flex -translate-x-1/2 flex-col items-center pt-1">
			<MarchingDash width={2} height={48} d="M 1 0 V 48" active={active} />
			<AddStepButton target={target} />
			{caption ? (
				<span className="absolute top-3 right-full mr-1.5 font-mono text-[10px] text-text-soft-400">
					{caption}
				</span>
			) : null}
		</div>
	);
};

/**
 * Swaps a step between its resting box and its editor. On close the editor
 * stays on top just long enough to roll its dropdown back up and fade into
 * the resting box underneath (both share the same frame, so it reads as one
 * box closing rather than a swap).
 */
export const EditSwap = ({
	editing,
	editor,
	rest,
}: {
	editing: boolean;
	editor: ReactNode;
	rest: ReactNode;
}) => (
	<MotionConfig reducedMotion="user">
		<AnimatePresence initial={false} mode="popLayout">
			{editing ? (
				<motion.div
					key="editor"
					className="relative z-10"
					exit={{
						opacity: 0,
						transition: { duration: 0.16, ease: SNAPPY_EASE },
					}}
				>
					{editor}
				</motion.div>
			) : (
				<motion.div key="rest">{rest}</motion.div>
			)}
		</AnimatePresence>
	</MotionConfig>
);
