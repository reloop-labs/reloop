"use client";

import { useCallback, useRef } from "react";
import { useAgentInbox } from "../components/agent-inbox-provider";
import type { BatchThreadAction } from "../types";

type UndoAction =
	| {
			type: "batch";
			ids: string[];
			undoAction: BatchThreadAction;
			label: string;
	  }
	| {
			type: "restore";
			ids: string[];
			label: string;
	  }
	| {
			type: "unarchive";
			ids: string[];
			label: string;
	  };

const undoForBatch = (
	action: BatchThreadAction,
): BatchThreadAction | "restore" | "unarchive" | null => {
	switch (action) {
		case "archive":
			return "unarchive";
		case "trash":
		case "spam":
			return "restore";
		case "star":
			return "unstar";
		case "unstar":
			return "star";
		case "read":
			return "unread";
		case "unread":
			return "read";
		case "important":
			return "unimportant";
		case "unimportant":
			return "important";
		case "pin":
			return "unpin";
		case "unpin":
			return "pin";
		case "restore":
		case "unspam":
			return null;
		default:
			return null;
	}
};

export const useInboxUndo = () => {
	const { batchThreads, restoreThread, unarchiveThread } = useAgentInbox();
	const stackRef = useRef<UndoAction[]>([]);

	const pushBatchUndo = useCallback(
		(ids: string[], action: BatchThreadAction, label: string) => {
			const undo = undoForBatch(action);
			if (!undo || ids.length === 0) return;
			if (undo === "restore" || undo === "unarchive") {
				stackRef.current.push({ type: undo, ids, label });
			} else {
				stackRef.current.push({
					type: "batch",
					ids,
					undoAction: undo,
					label,
				});
			}
		},
		[],
	);

	const undo = useCallback(async () => {
		const last = stackRef.current.pop();
		if (!last) return false;

		if (last.type === "batch") {
			await batchThreads(last.ids, last.undoAction);
		} else if (last.type === "restore") {
			await Promise.all(last.ids.map((id) => restoreThread(id)));
		} else {
			await Promise.all(last.ids.map((id) => unarchiveThread(id)));
		}
		return true;
	}, [batchThreads, restoreThread, unarchiveThread]);

	return { pushBatchUndo, undo };
};
