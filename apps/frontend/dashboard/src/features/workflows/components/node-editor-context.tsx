"use client";

import { createContext, useContext } from "react";
import type { EnrollmentDetail, StepRun } from "../hooks/use-automations-api";

export type StepKind = "send_email" | "condition" | "delay";

/** Where a step chosen in the picker goes: after a node's handle, or into an edge. */
export type PickerTarget =
	| { type: "append"; nodeId: string; handle?: string }
	| { type: "insert"; edgeId: string }
	/** Change an existing step to a different type (the tab's back button). */
	| { type: "replace"; nodeId: string };

export const pickerTargetKey = (target: PickerTarget) =>
	target.type === "append"
		? `append:${target.nodeId}:${target.handle ?? ""}`
		: target.type === "insert"
			? `insert:${target.edgeId}`
			: `replace:${target.nodeId}`;

/** Where the step menu was when a step was picked, so the new step can grow out of it. */
export interface MorphFrom {
	/** Screen y of the menu's top (its tab). */
	top: number;
	frameHeight: number;
	cardHeight: number;
	/** Screen rect of the picked row's icon; it flies into the input's icon. */
	icon?: { left: number; top: number; width: number; height: number };
	/** Snapshot of the menu's rows, shown collapsing inside the new step. */
	ghost?: HTMLElement;
	/** Snapshot of the menu's tab, which fades out as the step's tab arrives. */
	tabGhost?: HTMLElement;
}

/** One run shown on a read-only canvas: what happened at each step. */
export interface RunOverlay {
	/** Latest step run per node ID. */
	steps: Record<string, StepRun>;
	trigger: EnrollmentDetail["trigger"];
	enrollment: EnrollmentDetail["enrollment"];
}

interface NodeEditorContextValue {
	updateNode: (nodeId: string, data: Record<string, unknown>) => void;
	deleteNode: (nodeId: string) => void;
	/** Leaves in-place editing (deselects the step). */
	closeEditor: () => void;
	/** Opens a step's editor (the pencil on a resting step). */
	editNode: (nodeId: string) => void;
	/** Opens the step picker next to `anchor` (the clicked "+" button). */
	openPicker: (target: PickerTarget, anchor: HTMLElement) => void;
	closePicker: () => void;
	/** `pickerTargetKey` of the open picker, if any. */
	activePickerKey: string | null;
	/** A step that was just picked from the menu and should morph out of it. */
	morph: (MorphFrom & { nodeId: string }) | null;
	/** Adds/replaces a step from the menu (used by the in-flow placeholder). */
	pickStep: (target: PickerTarget, kind: StepKind, from?: MorphFrom) => void;
	/** Drops the insert placeholder and closes the gap it opened. */
	removePlaceholder: () => void;
	clearMorph: () => void;
	readOnly: boolean;
	/** Start was pressed with steps still needing setup: outline them in red. */
	showIssues?: boolean;
	/** Set on the Runs view: each step shows how it went for this run. */
	run?: RunOverlay;
}

const NodeEditorContext = createContext<NodeEditorContextValue | null>(null);

export const NodeEditorProvider = NodeEditorContext.Provider;

export function useNodeEditor(): NodeEditorContextValue {
	const ctx = useContext(NodeEditorContext);
	if (!ctx) {
		throw new Error("useNodeEditor must be used inside a workflow canvas");
	}
	return ctx;
}
