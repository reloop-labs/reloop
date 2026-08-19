import { imageSlashCommand } from "@react-email/editor/plugins";
import {
	BubbleMenu,
	defaultSlashCommands,
	SlashCommand,
} from "@react-email/editor/ui";
import { Icon } from "@reloop/ui/icon";
import { generateJSON } from "@tiptap/html";
import { EditorContext } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useEditorHook } from "#/features/templates/editor/hooks/use-editor-hooks";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useSWR } from "#/features/templates/editor/hooks/use-swr-compat";
import { mapTemplateVariables } from "#/features/templates/lib/template-variables";
import {
	getRandomColor,
	useCollaboration,
} from "../collobration/hooks/useCollaboration";
import { PresenceProvider } from "../collobration/PresenceProvider";
import { TemplateDetailHeader } from "../components/header/template-detail-header";
import { AddTemplateVariableModal } from "../components/panels/variables/add-variable-modal";
import { useMousePresence } from "../cursor/hooks/useMousePresence";
import { useRemoteCursors } from "../cursor/hooks/useRemoteCursors";
import { RemoteCursors } from "../cursor/RemoteCursors";

interface EditorProviderProps {
	children: React.ReactNode;
	roomId: string;
}

export const variableSlashCommand = {
	title: "Variable",
	description: "Create and insert a dynamic variable",
	icon: <Icon name="brackets" className="h-5 w-5" />,
	category: "Basic",
	searchTerms: ["variable", "dynamic", "custom", "tag", "bracket"],
	command: ({ editor, range }: { editor: any; range: any }) => {
		editor.chain().focus().deleteRange(range).insertContent("{{").run();
	},
};

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
	try {
		const fragment = ydoc.getXmlFragment("email-content");
		if (fragment && fragment.length === 0) return true;
		if (fragment && fragment.length === 1) {
			const firstChild = fragment.get(0);
			if (
				firstChild &&
				firstChild.length === 0 &&
				(!firstChild.toString ||
					firstChild.toString() === "<paragraph></paragraph>")
			) {
				return true;
			}
		}
	} catch {
		// If fragment access fails, fall through to the TipTap check above
	}

	return false;
}

export const EditorProvider = ({ children, roomId }: EditorProviderProps) => {
	const { user } = useActiveOrganization();

	const collabUser = {
		name: user?.name || undefined,
		color: getRandomColor(user?.id ?? ""),
		avatar: user?.image ?? undefined,
		email: user?.email ?? undefined,
	};

	const { ydoc, provider, connectionStatus, isSynced } = useCollaboration({
		roomName: roomId,
		user: collabUser,
	});
	const containerRef = useRef<HTMLDivElement>(null);

	useMousePresence(provider, containerRef);
	const remoteCursors = useRemoteCursors(provider);
	const editor = useEditorHook({ ydoc, provider, user: collabUser });

	const { data: templateData, mutate } = useSWR(
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

	const isCreatingVar = useEditorStore((s) => s.isCreatingVar);
	const setIsCreatingVar = useEditorStore((s) => s.setIsCreatingVar);
	const [isSavingConfig, setIsSavingConfig] = useState(false);

	const handleCreateAndInsertVar = async (
		name: string,
		type: "string" | "number",
		defaultValue: string | null,
	) => {
		if (!name.trim()) {
			throw new Error("Variable name is required");
		}
		if (!roomId) {
			throw new Error("Template not loaded");
		}

		setIsSavingConfig(true);
		try {
			// 1. Insert custom Variable node into editor
			if (editor) {
				editor
					.chain()
					.focus()
					.insertContent({
						type: "variable",
						attrs: { name },
					})
					.run();
			} else {
				const placeholder = `{{{${name}}}}`;
				navigator.clipboard.writeText(placeholder);
				toast.success(`Copied ${placeholder} — paste into your email`);
			}

			// 2. Add to template variables list in DB
			const detectedVars = mapTemplateVariables(templateData?.variables);

			const newVar = { name, type, defaultValue };
			const exists = detectedVars.some((v) => v.name === name);
			const updatedVariables = exists
				? detectedVars.map((v) => (v.name === name ? newVar : v))
				: [...detectedVars, newVar];

			const response = await fetch(`/api/template/v1/${roomId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					variables: updatedVariables,
				}),
			});

			if (!response.ok) {
				const err = await response.json().catch(() => null);
				throw new Error(
					err?.message || err?.error || "Failed to save variable configuration",
				);
			}

			toast.success(`Variable ${name} created`);
			await mutate();
		} catch (error: any) {
			toast.error(error.message || "Something went wrong");
			throw error;
		} finally {
			setIsSavingConfig(false);
		}
	};

	// Clear global Zustand state on mount to prevent leakage between templates
	useEffect(() => {
		setSubject("");
		setFromEmail("");
		setReplyTo("");
		setPreviewText("");
	}, [setSubject, setFromEmail, setReplyTo, setPreviewText]);

	/**
	 * Determine the best source for the subject line.
	 * Priority: latest version's subject → template baseline subject.
	 */
	const resolveSubject = useCallback(
		(template: any, versionList: any[]): string => {
			if (versionList && versionList.length > 0) {
				const latestVersion = versionList[0];
				if (latestVersion?.subject) return latestVersion.subject;
			}
			return template?.subject || "";
		},
		[],
	);

	const resolveFromEmail = useCallback(
		(template: any, versionList: any[]): string => {
			if (versionList && versionList.length > 0) {
				const latestVersion = versionList[0];
				if (
					latestVersion?.fromEmail !== undefined &&
					latestVersion.fromEmail !== null
				)
					return latestVersion.fromEmail;
			}
			return template?.fromEmail || "";
		},
		[],
	);

	const resolveReplyTo = useCallback(
		(template: any, versionList: any[]): string => {
			if (versionList && versionList.length > 0) {
				const latestVersion = versionList[0];
				if (
					latestVersion?.replyTo !== undefined &&
					latestVersion.replyTo !== null
				)
					return latestVersion.replyTo;
			}
			return template?.replyTo || "";
		},
		[],
	);

	const resolvePreviewText = useCallback(
		(template: any, versionList: any[]): string => {
			if (versionList && versionList.length > 0) {
				const latestVersion = versionList[0];
				if (
					latestVersion?.previewText !== undefined &&
					latestVersion.previewText !== null
				)
					return latestVersion.previewText;
			}
			return template?.previewText || "";
		},
		[],
	);

	const isWsUnavailable =
		connectionStatus === "disconnected" || connectionStatus === "error";
	const canInitialize = isSynced || isWsUnavailable;

	const [timedOut, setTimedOut] = useState(false);
	useEffect(() => {
		if (hasInitializedRef.current) return;
		const timer = setTimeout(() => setTimedOut(true), 3000);
		return () => clearTimeout(timer);
	}, []);

	const shouldInitialize = canInitialize || timedOut;

	const initializeEditor = useCallback(
		(template: any, versionList: any[]) => {
			if (isSynced && !isEditorContentEmpty(editor, ydoc)) {
				const subjectToSet = resolveSubject(template, versionList);
				if (subjectToSet) {
					setSubject(subjectToSet);
				}
				setFromEmail(resolveFromEmail(template, versionList));
				setReplyTo(resolveReplyTo(template, versionList));
				setPreviewText(resolvePreviewText(template, versionList));
				return;
			}

			let sourceToLoad: any = null;

			if (template.status === "published") {
				const latestPublished = versionList.find((v: any) => v.isMajor);
				if (latestPublished) {
					sourceToLoad = latestPublished;
				}
			}

			if (!sourceToLoad) {
				const latestVersion = versionList[0];
				if (latestVersion?.content && latestVersion.content.length > 0) {
					sourceToLoad = latestVersion;
				}
			}

			if (!sourceToLoad && template.content && template.content.length > 0) {
				sourceToLoad = template;
			}

			if (sourceToLoad?.content && sourceToLoad.content.length > 0) {
				const rawContent = sourceToLoad.content;
				if (Array.isArray(rawContent)) {
					const firstItem = rawContent[0];
					if (
						firstItem &&
						typeof firstItem === "object" &&
						"html" in firstItem &&
						typeof firstItem.html === "string"
					) {
						const safeHtml = firstItem.html;
						if (editor) {
							const extensions = editor.extensionManager.extensions;
							try {
								const jsonDoc = generateJSON(safeHtml, extensions as any);
								editor.commands.setContent(jsonDoc);
							} catch {
								editor.commands.setContent(safeHtml);
							}
						}
					} else {
						editor?.commands.setContent({
							type: "doc",
							content: rawContent as Record<string, unknown>[],
						});
					}
				} else if (typeof rawContent === "string" && editor) {
					const extensions = editor.extensionManager.extensions;
					try {
						const jsonDoc = generateJSON(rawContent, extensions as any);
						editor.commands.setContent(jsonDoc);
					} catch {
						editor.commands.setContent(rawContent);
					}
				}
			}

			const subjectToSet =
				sourceToLoad?.subject || resolveSubject(template, versionList);
			if (subjectToSet) {
				setSubject(subjectToSet);
			}

			const fromEmailToSet =
				sourceToLoad?.fromEmail || resolveFromEmail(template, versionList);
			setFromEmail(fromEmailToSet);

			const replyToToSet =
				sourceToLoad?.replyTo || resolveReplyTo(template, versionList);
			setReplyTo(replyToToSet);

			const previewTextToSet =
				sourceToLoad?.previewText || resolvePreviewText(template, versionList);
			setPreviewText(previewTextToSet);
		},
		[
			editor,
			ydoc,
			isSynced,
			setSubject,
			setFromEmail,
			setReplyTo,
			setPreviewText,
			resolveSubject,
			resolveFromEmail,
			resolveReplyTo,
			resolvePreviewText,
		],
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

			const timer = setTimeout(() => {
				initializeEditor(templateData as any, versions as any[]);
			}, 0);

			return () => clearTimeout(timer);
		}
	}, [shouldInitialize, editor, templateData, versions, initializeEditor]);

	return (
		<PresenceProvider awareness={provider?.awareness ?? null}>
			<EditorContext.Provider value={{ editor }}>
				<div
					ref={containerRef}
					className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-bg-weak-50 dark:bg-black"
				>
					<TemplateDetailHeader
						connectionStatus={connectionStatus}
						isSynced={isSynced}
					/>
					<div className="min-h-0 flex-1 overflow-hidden">{children}</div>
					<RemoteCursors cursors={remoteCursors} />
					<BubbleMenu
						hideWhenActiveNodes={["button", "image", "variable"]}
						hideWhenActiveMarks={["link"]}
					/>
					<BubbleMenu.LinkDefault />
					<BubbleMenu.ButtonDefault />
					<BubbleMenu.ImageDefault />
					<SlashCommand
						items={[
							...defaultSlashCommands,
							imageSlashCommand,
							variableSlashCommand,
						]}
					/>
				</div>
				<AddTemplateVariableModal
					open={isCreatingVar}
					onOpenChange={setIsCreatingVar}
					onAdd={handleCreateAndInsertVar}
					isSubmitting={isSavingConfig}
				/>
			</EditorContext.Provider>
		</PresenceProvider>
	);
};
