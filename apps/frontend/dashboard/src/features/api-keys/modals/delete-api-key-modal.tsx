import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyData } from "../types";

/** Light keycap so it reads on the red/destructive FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteApiKeyModal({
	apiKeys,
	onDeleteSuccess,
}: {
	apiKeys: ApiKeyData[];
	onDeleteSuccess?: (deletedName: string) => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [nameCopied, setNameCopied] = useState(false);
	const invalidate = useInvalidateApiKeys();

	// Cache the selected API key so details remain stable when query invalidates upon deletion
	const targetApiKeyRef = useRef<ApiKeyData | null>(null);
	const currentApiKey = apiKeys.find((k) => k.id === deleteId);
	if (currentApiKey) {
		targetApiKeyRef.current = currentApiKey;
	}
	const apiKeyToDelete = currentApiKey || targetApiKeyRef.current;

	const displayName =
		apiKeyToDelete?.name ||
		apiKeyToDelete?.start ||
		apiKeyToDelete?.prefix ||
		"Unnamed key";

	const isConfirmed = confirmationText === displayName;
	const canDelete = isConfirmed && deleteState === "idle";

	const handleCopyName = async () => {
		try {
			await navigator.clipboard.writeText(displayName);
			setNameCopied(true);
			setTimeout(() => setNameCopied(false), 1500);
		} catch {
			// silently fail
		}
	};

	const handleDelete = async () => {
		if (!apiKeyToDelete || !canDelete) return;
		try {
			setDeleteState("deleting");
			await axios.delete(`/api/api-key/v1/${apiKeyToDelete.id}`, {
				withCredentials: true,
			});
			setDeleteState("success");
			await invalidate();

			// Show checkmark 'Deleted' state for 900ms before closing modal
			setTimeout(() => {
				void setDeleteId(null);
				onDeleteSuccess?.(displayName);
				// Reset internal button state after modal exit animation finishes
				setTimeout(() => {
					setDeleteState("idle");
					setConfirmationText("");
				}, 300);
			}, 900);
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete API key"
				: "Failed to delete API key";
			toast.error(message);
			setDeleteState("idle");
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (canDelete) {
				void handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	useHotkeys(
		"escape",
		() => {
			if (deleteState === "idle") {
				void setDeleteId(null);
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	// Keep a ref so onOpenChange can read the latest deleteState without stale closure
	const deleteStateRef = useRef(deleteState);
	useEffect(() => {
		deleteStateRef.current = deleteState;
	}, [deleteState]);

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) {
					// If the user closes the modal after a successful delete (via X or
					// backdrop), still fire the success callback so the banner appears.
					if (deleteStateRef.current === "success") {
						const name =
							targetApiKeyRef.current?.name ||
							targetApiKeyRef.current?.start ||
							targetApiKeyRef.current?.prefix ||
							"Unnamed key";
						onDeleteSuccess?.(name);
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetApiKeyRef.current = null;
					}, 300);
				}
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				{/* Header */}
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Delete API key
					</Modal.Title>
					<p className="text-sm text-text-sub-600 leading-relaxed">
						Are you sure you want to delete this API key? This action cannot be
						undone.
					</p>
				</div>
				<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs leading-relaxed dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
					<span className="font-bold text-red-800 dark:text-red-200">
						Warning:
					</span>{" "}
					Deleting this API key will permanently remove it along with all its
					permissions. Any services using this API key will stop working
					immediately.
				</div>
				{/* Key Details Card */}
				<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<div>
						<p className="font-normal text-text-sub-600 text-xs">
							API key prefix
						</p>
						<div className="mt-1 flex items-center">
							<span className="font-medium font-mono text-sm">
								{apiKeyToDelete?.start || apiKeyToDelete?.prefix || "rl_..."}
							</span>
						</div>
					</div>
				</div>

				{/* Warning Banner */}

				{/* Confirmation Input */}
				<div className="mt-4 space-y-2">
					<Label.Root
						htmlFor="delete-api-key-confirmation"
						className="flex flex-wrap items-center gap-1.5"
					>
						<span>Type</span>
						<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-bg-weak-50/20">
							{displayName}
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									void handleCopyName();
								}}
								className="-mr-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors hover:bg-bg-white-0"
								aria-label={`Copy ${displayName}`}
								title="Copy name"
							>
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={nameCopied ? "check" : "copy"}
										initial={{ opacity: 0, scale: 0.6 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.6 }}
										transition={{ type: "spring", duration: 0.2, bounce: 0.3 }}
										className="flex items-center justify-center"
									>
										<Icon
											name={nameCopied ? "check" : "copy"}
											className={cn(
												"h-3 w-3",
												nameCopied
													? "text-green-500"
													: "text-text-sub-600 hover:text-text-strong-950",
											)}
										/>
									</motion.span>
								</AnimatePresence>
							</button>
						</span>
						<span>to confirm</span>
					</Label.Root>
					<Input.Root size="medium">
						<Input.Wrapper>
							<Input.Input
								id="delete-api-key-confirmation"
								value={confirmationText}
								onChange={(e) => setConfirmationText(e.target.value)}
								placeholder={displayName}
								autoFocus
								disabled={deleteState !== "idle"}
								autoComplete="off"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				{/* Footer Actions */}
				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => {
							if (deleteState === "idle") {
								void setDeleteId(null);
								setDeleteState("idle");
								setConfirmationText("");
							}
						}}
						className={cn(
							"gap-1.5 transition-opacity duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant="destructive"
						size="small"
						disabled={!canDelete}
						onClick={() => void handleDelete()}
						className={cn(
							"relative min-w-[134px] select-none justify-center overflow-hidden transition-all duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-90",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={deleteState}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{
									opacity: 0,
									y: -14,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									y: 14,
								}}
								className="relative z-10 flex items-center justify-center gap-1.5"
							>
								{deleteState === "deleting" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Deleting...</span>
									</>
								) : deleteState === "success" ? (
									<>
										<Icon
											name="check"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Deleted</span>
									</>
								) : (
									<>
										Delete key
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
