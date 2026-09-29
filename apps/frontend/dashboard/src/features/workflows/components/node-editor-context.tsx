"use client";

import { createContext, useContext } from "react";

export type InsertStepKind = "send_email" | "condition" | "delay";

interface NodeEditorContextValue {
	updateNode: (nodeId: string, data: Record<string, unknown>) => void;
	deleteNode: (nodeId: string) => void;
	insertStep: (edgeId: string, kind: InsertStepKind) => void;
	appendStep: (kind: InsertStepKind) => void;
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
