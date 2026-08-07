import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { WEBHOOK_EVENTS } from "@reloop/webhook-events";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";
import type { DeleteWebhookModalProps, WebhookData } from "./types";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type DeleteState = "idle" | "deleting" | "success";

const CATEGORY_ICON: Record<string, string> = {
	email: "mail-send",
	domain: "globe",
	"api-key": "key-new",
	contact: "contacts",
};

const CATEGORY_CHIP: Record<string, string> = {
	email:
		"border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/40 dark:bg-violet-950/40 dark:text-violet-200",
	domain:
		"border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-200",
	"api-key":
		"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-200",
	contact:
		"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-200",
};

export const DeleteWebhookModal = ({
	webhook,
	onSuccess,
}: DeleteWebhookModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [nameCopied, setNameCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const invalidate = useInvalidateWebhooks();
	const router = useRouter();
	const pathname = usePathname();

	const targetRef = useRef<WebhookData | null>(null);
	const current = webhook?.id === deleteId ? webhook : null;
	if (current) {
		targetRef.current = current;
	}
	const webhookToDelete = current || targetRef.current;

	const displayName =
		webhookToDelete?.name || webhookToDelete?.url || "Webhook";
	const displayUrl = webhookToDelete?.url || "—";
	const displayEvents = webhookToDelete?.events ?? [];

	const normalizedInput = confirmationText.trim().toLowerCase();
	const isConfirmed =
		normalizedInput === displayName.toLowerCase() ||
		normalizedInput === "delete";

	const canDelete = isConfirmed && deleteState === "idle" && !!webhookToDelete;

	const isOnDetailPage =
		pathname.includes("/webhooks/") &&
		!pathname.endsWith("/webhooks") &&
		!pathname.includes("/webhooks/create");

	const handleCopyName = async () => {
		try {
			await navigator.clipboard.writeText(displayName);
			setNameCopied(true);
			setTimeout(() => setNameCopied(false), 1500);
		} catch {
			// ignore
		}
	};

	const handleDelete = async () => {
		if (!canDelete || !webhookToDelete) return;
		try {
			setDeleteState("deleting");
			await axios.delete(`/api/webhook/v1/${webhookToDelete.id}`, {
				withCredentials: true,
			});
			setDeleteState("success");
			await invalidate();

			setTimeout(() => {
				void setDeleteId(null);
				onSuccess?.(displayName);
				if (isOnDetailPage) {
					router.push("/webhooks");
				}
				setTimeout(() => {
					setDeleteState("idle");
					setConfirmationText("");
					targetRef.current = null;
				}, 300);
			}, 300);
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete webhook"
				: "Failed to delete webhook";
			toast.error(message);
			setDeleteState("idle");
		}
	};

	useHotkeys(
		["enter", "mod+enter"],
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

	const deleteStateRef = useRef(deleteState);
	useEffect(() => {
		deleteStateRef.current = deleteState;
	}, [deleteState]);

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) {
					if (deleteStateRef.current === "success") {
						const name =
							targetRef.current?.name || targetRef.current?.url || "Webhook";
						onSuccess?.(name);
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetRef.current = null;
					}, 300);
				}
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					setTimeout(() => {
						inputRef.current?.focus();
					}, 0);
				}}
			>
				{/* Header */}
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Delete webhook
					</Modal.Title>
					<Modal.Description className="text-sm text-text-sub-600 leading-relaxed">
						Are you sure you want to delete this webhook? This action cannot be
						undone.
					</Modal.Description>
				</div>
				<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs leading-relaxed dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
					<span className="font-bold text-red-800 dark:text-red-200">
						Warning:
					</span>{" "}
					Deleting this webhook permanently removes the endpoint and all of its
					delivery history. Event deliveries will stop immediately.
				</div>

				{/* Webhook Details Card */}
				<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<div>
						<p className="font-normal text-text-sub-600 text-xs">Name</p>
						<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
							{displayName}
						</p>
					</div>
					<div>
						<p className="font-normal text-text-sub-600 text-xs">
							Endpoint URL
						</p>
						<p className="mt-0.5 truncate font-medium font-mono text-sm text-text-strong-950">
							{displayUrl}
						</p>
					</div>
					<div>
						<p className="font-normal text-text-sub-600 text-xs">
							Events
							{displayEvents.length > 0 ? (
								<span className="ml-1 tabular-nums">
									({displayEvents.length})
								</span>
							) : null}
						</p>
						{displayEvents.length > 0 ? (
							<div className="mt-1.5 flex max-h-28 flex-wrap gap-1 overflow-y-auto">
								{displayEvents.map((eventId) => {
									const definition = WEBHOOK_EVENTS.find(
										(e) => e.id === eventId,
									);
									const category = definition?.category ?? "";
									const iconName = CATEGORY_ICON[category] ?? "webhook";
									const chipClass =
										CATEGORY_CHIP[category] ??
										"border-stroke-soft-100 bg-bg-white-0 text-text-strong-950 dark:border-stroke-soft-100/40";
									return (
										<span
											key={eventId}
											className={cn(
												"inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-medium font-mono text-[10px]",
												chipClass,
											)}
										>
											<Icon name={iconName} className="h-2.5 w-2.5 shrink-0" />
											{eventId}
										</span>
									);
								})}
							</div>
						) : (
							<p className="mt-0.5 font-medium text-sm text-text-sub-600">
								No events subscribed
							</p>
						)}
					</div>
				</div>

				{/* Confirmation Input */}
				<div className="mt-4 space-y-2">
					<Label.Root
						htmlFor="delete-webhook-confirmation"
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
								className="-mr-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors"
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
												nameCopied ? "text-green-500" : "text-text-sub-600",
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
								ref={inputRef}
								id="delete-webhook-confirmation"
								value={confirmationText}
								onChange={(e) => setConfirmationText(e.target.value)}
								placeholder={displayName}
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
										<span>Delete webhook</span>
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
};
