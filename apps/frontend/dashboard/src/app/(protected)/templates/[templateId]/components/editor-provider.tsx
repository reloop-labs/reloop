"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	BubbleMenu,
	defaultSlashCommands,
	SlashCommand,
} from "@react-email/editor/ui";
import { EditorContext } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import {
	getRandomColor,
	useCollaboration,
} from "./collobration/hooks/useCollaboration";
import { PresenceProvider } from "./collobration/PresenceProvider";
import { useMousePresence } from "./cursor/hooks/useMousePresence";
import { useRemoteCursors } from "./cursor/hooks/useRemoteCursors";
import { RemoteCursors } from "./cursor/RemoteCursors";
import { EditorHeaderActions } from "./editor-header-actions";
import { TemplateName } from "./template-name";
import { useEditorHook } from "./use-editor-hooks";
import { useEditorStore } from "./use-editor-store";

interface EditorProviderProps {
	children: React.ReactNode;
	roomId: string;
}

/**
 * Check if the Y.js-backed TipTap editor has real user content.
 *
 * The Collaboration extension always creates at least one empty paragraph node
 * in the Y.js XML fragment, so `editor.isEmpty` alone is unreliable.
 * We also inspect the Y.js document fragment directly to be sure.
 */
function isEditorContentEmpty(
	editor: ReturnType<typeof useEditorHook>,
	ydoc: any,
): boolean {
	if (!editor) return true;

	// Check Tiptap's built-in isEmpty
	if (editor.isEmpty) return true;

	// Check the actual JSON content — a single empty paragraph means "empty"
	const json = editor.getJSON();
	const contentNodes = json.content ?? [];
	if (contentNodes.length === 0) return true;
	if (
		contentNodes.length === 1 &&
		contentNodes[0]?.type === "paragraph" &&
		!contentNodes[0]?.content
	) {
		return true;
	}

	// Additionally, check the Y.js XML fragment directly.
	// If the collaboration field has a fragment with no meaningful content, treat as empty.
	try {
		const fragment = ydoc.getXmlFragment("email-content");
		if (fragment && fragment.length === 0) return true;
		// A single empty element is also considered empty
		if (fragment && fragment.length === 1) {
			const firstChild = fragment.get(0);
			if (firstChild && firstChild.length === 0 && (!firstChild.toString || firstChild.toString() === "<paragraph></paragraph>")) {
				return true;
			}
		}
	} catch {
		// If fragment access fails, fall through to the TipTap check above
	}

	return false;
}

export const EditorProvider = ({ children, roomId }: EditorProviderProps) => {
	const { user } = useUserOrganization();

	const collabUser = {
		name: user?.name ?? "Anonymous",
		color: getRandomColor(user?.id ?? ""),
		avatar: user?.image ?? undefined,
	};

	const { ydoc, provider, connectionStatus, isSynced } = useCollaboration({
		roomName: roomId,
		user: collabUser,
	});
	const containerRef = useRef<HTMLDivElement>(null);

	useMousePresence(provider, containerRef);
	const remoteCursors = useRemoteCursors(provider);
	const editor = useEditorHook({ ydoc, provider, user: collabUser });

	const { data: templateData } = useSWR(
		roomId ? `/api/template/v1/${roomId}` : null,
		(url) => fetch(url, { credentials: "include" }).then((res) => res.json()),
	);

	const { data: versions } = useSWR(
		roomId ? `/api/template/v1/${roomId}/versions` : null,
		(url) => fetch(url, { credentials: "include" }).then((res) => res.json()),
	) as { data: any[] | undefined };

	const hasInitializedRef = useRef(false);

	const setSubject = useEditorStore((s) => s.setSubject);
	const setFromEmail = useEditorStore((s) => s.setFromEmail);
	const setReplyTo = useEditorStore((s) => s.setReplyTo);
	const setPreviewText = useEditorStore((s) => s.setPreviewText);

	// Clear global Zustand state on mount to prevent leakage between templates
	useEffect(() => {
		setSubject("");
		setFromEmail("");
		setReplyTo("");
		setPreviewText("");
	}, [roomId, setSubject, setFromEmail, setReplyTo, setPreviewText]);

	/**
	 * Determine the best source for the subject line.
	 * Priority: latest version's subject → template baseline subject.
	 */
	const resolveSubject = useCallback(
		(template: any, versionList: any[]): string => {
			// First, check the latest version (sorted newest-first from API)
			if (versionList && versionList.length > 0) {
				const latestVersion = versionList[0];
				if (latestVersion?.subject) return latestVersion.subject;
			}
			// Fall back to template baseline
			return template?.subject || "";
		},
		[],
	);

	/**
	 * Determine whether we're ready to initialize:
	 *  - Y.js synced successfully, OR
	 *  - WebSocket connection failed/errored (so Y.js will never sync), OR
	 *  - Timeout of 3 seconds elapsed (safety net)
	 */
	const isWsUnavailable =
		connectionStatus === "disconnected" || connectionStatus === "error";
	const canInitialize = isSynced || isWsUnavailable;

	// Timeout fallback: if neither sync nor error occurs within 3s, force init
	const [timedOut, setTimedOut] = useState(false);
	useEffect(() => {
		if (hasInitializedRef.current) return;
		const timer = setTimeout(() => setTimedOut(true), 3000);
		return () => clearTimeout(timer);
	}, []);

	const shouldInitialize = canInitialize || timedOut;

	/**
	 * Core initialization: seed editor from database when Y.js is empty or unavailable.
	 */
	const initializeEditor = useCallback(
		(template: any, versionList: any[]) => {
			// If Y.js synced with real content, preserve it — only load subject
			if (isSynced && !isEditorContentEmpty(editor, ydoc)) {
				console.log(
					"[EditorProvider] Y.js cache has content, preserving editor state. Loading subject from DB.",
				);
				const subjectToSet = resolveSubject(template, versionList);
				if (subjectToSet) {
					setSubject(subjectToSet);
				}
				return;
			}

			// ── Editor is empty or WS failed — seed from database ──
			console.log(
				"[EditorProvider] Editor is empty or WS unavailable. Seeding from database.",
				{ isSynced, connectionStatus, timedOut },
			);

			let sourceToLoad: any = null;

			if (template.status === "published") {
				// For published templates, load the latest published (major) version
				const latestPublished = versionList.find((v: any) => v.isMajor);
				if (latestPublished) {
					sourceToLoad = latestPublished;
				}
			}

			// If no published version found, try the latest version of any kind
			if (!sourceToLoad) {
				const latestVersion = versionList[0];
				if (latestVersion?.content && latestVersion.content.length > 0) {
					sourceToLoad = latestVersion;
				}
			}

			// Final fallback: use the template baseline content
			if (!sourceToLoad && template.content && template.content.length > 0) {
				sourceToLoad = template;
			}

			// Apply the content into the editor
			if (sourceToLoad?.content && sourceToLoad.content.length > 0) {
				console.log(
					"[EditorProvider] Seeding editor from:",
					sourceToLoad.version
						? `version ${sourceToLoad.version} (${sourceToLoad.name || (sourceToLoad.isMajor ? "published" : "draft")})`
						: "template baseline",
				);
				editor?.commands.setContent({
					type: "doc",
					content: sourceToLoad.content as Record<string, unknown>[],
				});
			}

			// Load subject from the source, or resolve from the best available
			const subjectToSet =
				sourceToLoad?.subject || resolveSubject(template, versionList);
			if (subjectToSet) {
				setSubject(subjectToSet);
			}
		},
		[editor, ydoc, isSynced, connectionStatus, timedOut, setSubject, resolveSubject],
	);

	useEffect(() => {
		if (
			shouldInitialize &&
			editor &&
			templateData &&
			versions &&
			!hasInitializedRef.current
		) {
			hasInitializedRef.current = true;
			initializeEditor(templateData as any, versions as any[]);
		}
	}, [shouldInitialize, editor, templateData, versions, initializeEditor]);

	return (
		<PresenceProvider awareness={provider.awareness}>
			<EditorContext.Provider value={{ editor }}>
				<div ref={containerRef} className="bg-bg-weak-50 dark:bg-black">
					<div className="grid grid-cols-3 items-center px-4 pt-2">
						<div />
						<div className="flex justify-center">
							<TemplateName />
						</div>
						<div className="flex items-center justify-end">
							<EditorHeaderActions
								connectionStatus={connectionStatus}
								isSynced={isSynced}
							/>
						</div>
					</div>
					{children}
					<RemoteCursors cursors={remoteCursors} />
					<BubbleMenu
						hideWhenActiveNodes={["button"]}
						hideWhenActiveMarks={["link"]}
					/>
					<BubbleMenu.LinkDefault />
					<BubbleMenu.ButtonDefault />
					<SlashCommand items={defaultSlashCommands} />
				</div>
			</EditorContext.Provider>
		</PresenceProvider>
	);
};
