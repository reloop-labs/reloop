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
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import type { Domain } from "../types";

/** Light keycap so it reads on the red/destructive FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteDomainModal({
	domains,
	selectedDomains = [],
	onClearSelection,
	onDeleteSuccess,
}: {
	domains: Domain[];
	selectedDomains?: Domain[];
	onClearSelection?: () => void;
	onDeleteSuccess?: (deletedName: string) => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [nameCopied, setNameCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const pathname = usePathname();
	const router = useRouter();
	const invalidate = useInvalidateDomains();

	const isBulk = deleteId === "bulk" || deleteId === "selected";

	// Cache the selected domain so details remain stable when query invalidates upon deletion
	const targetDomainRef = useRef<Domain | null>(null);
	const currentDomain = domains.find((domain) => domain.id === deleteId);
	if (currentDomain) {
		targetDomainRef.current = currentDomain;
	}
	const domainToDelete = currentDomain || targetDomainRef.current;

	const targetBulkDomainsRef = useRef<Domain[]>([]);
	if (isBulk && selectedDomains.length > 0) {
		targetBulkDomainsRef.current = selectedDomains;
	}
	const bulkDomainsToDelete = isBulk
		? selectedDomains.length > 0
			? selectedDomains
			: targetBulkDomainsRef.current
		: [];

	const isOnDetailPage =
		pathname.includes("/domain/") &&
		!pathname.includes("/domain/add") &&
		!pathname.endsWith("/domain") &&
		!pathname.endsWith("/domain/");

	const displayName = isBulk
		? `delete ${bulkDomainsToDelete.length} domain${bulkDomainsToDelete.length === 1 ? "" : "s"}`
		: domainToDelete?.domain || "domain";

	const normalizedInput = confirmationText.trim().toLowerCase();
	const isConfirmed = isBulk
		? normalizedInput === displayName.toLowerCase() ||
			normalizedInput === `delete ${bulkDomainsToDelete.length} domain` ||
			normalizedInput === "delete"
		: confirmationText === displayName;

	const canDelete =
		isConfirmed &&
		deleteState === "idle" &&
		(isBulk ? bulkDomainsToDelete.length > 0 : !!domainToDelete);

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
		if (!canDelete) return;

		if (isBulk) {
			try {
				setDeleteState("deleting");
				let ok = 0;
				let failed = 0;
				for (const domain of bulkDomainsToDelete) {
					try {
						await axios.delete(`/api/domain/v1/${domain.id}`, {
							withCredentials: true,
						});
						ok += 1;
					} catch {
						failed += 1;
					}
				}
				setDeleteState("success");
				await invalidate();

				setTimeout(() => {
					const summary = `${ok} domain${ok === 1 ? "" : "s"}`;
					onDeleteSuccess?.(summary);
					onClearSelection?.();
					void setDeleteId(null);
					if (failed > 0) {
						toast.error(
							`${failed} domain${failed === 1 ? "" : "s"} failed to delete`,
						);
					}
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetBulkDomainsRef.current = [];
					}, 300);
				}, 300);
			} catch {
				toast.error("Failed to delete domains");
				setDeleteState("idle");
			}
			return;
		}

		if (!domainToDelete) return;
		try {
			setDeleteState("deleting");
			const deletedName = domainToDelete.domain;
			await axios.delete(`/api/domain/v1/${domainToDelete.id}`, {
				withCredentials: true,
			});
			setDeleteState("success");
			await invalidate();

			setTimeout(() => {
				onDeleteSuccess?.(deletedName);
				void setDeleteId(null);
				if (isOnDetailPage) {
					setTimeout(() => {
						router.push("/domain");
					}, 100);
				}
				setTimeout(() => {
					setDeleteState("idle");
					setConfirmationText("");
					targetDomainRef.current = null;
				}, 300);
			}, 300);
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete domain"
				: "Failed to delete domain";
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
					if (deleteStateRef.current === "success") {
						if (isBulk) {
							const count =
								targetBulkDomainsRef.current.length ||
								bulkDomainsToDelete.length;
							onDeleteSuccess?.(`${count} domain${count === 1 ? "" : "s"}`);
							onClearSelection?.();
						} else {
							const name = targetDomainRef.current?.domain;
							if (name) onDeleteSuccess?.(name);
						}
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetDomainRef.current = null;
						targetBulkDomainsRef.current = [];
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
						{isBulk
							? `Delete ${bulkDomainsToDelete.length || "selected"} domains`
							: "Delete domain"}
					</Modal.Title>
					<Modal.Description className="text-sm text-text-sub-600 leading-relaxed">
						{isBulk
							? `Are you sure you want to delete ${bulkDomainsToDelete.length > 1 ? `these ${bulkDomainsToDelete.length} domains` : "this domain"}? This action cannot be undone.`
							: "Are you sure you want to delete this domain? This action cannot be undone."}
					</Modal.Description>
				</div>

				<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs leading-relaxed dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
					<span className="font-bold text-red-800 dark:text-red-200">
						Warning:
					</span>{" "}
					{isBulk
						? `Deleting ${bulkDomainsToDelete.length > 1 ? `these ${bulkDomainsToDelete.length} domains` : "this domain"} will stop email sending and receiving immediately. DNS records won't be removed automatically — you'll need to delete them from your DNS provider.`
						: "Deleting this domain will stop email sending and receiving immediately. DNS records won't be removed automatically — you'll need to delete them from your DNS provider."}
				</div>

				{/* Domain Details Card */}
				{isBulk ? (
					<div className="mt-5 space-y-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<p className="font-normal text-text-sub-600 text-xs">
							Selected domains ({bulkDomainsToDelete.length})
						</p>
						<div className="flex flex-wrap gap-1.5 pt-1">
							{bulkDomainsToDelete.slice(0, 4).map((d) => (
								<span
									key={d.id}
									className="inline-flex items-center rounded-md bg-bg-white-0 px-2 py-1 font-medium text-text-strong-950 text-xs shadow-2xs dark:bg-bg-weak-50/40"
								>
									{d.domain}
								</span>
							))}
							{bulkDomainsToDelete.length > 4 ? (
								<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-2 py-1 font-medium text-text-sub-600 text-xs dark:bg-bg-weak-50/30">
									+{bulkDomainsToDelete.length - 4} more
								</span>
							) : null}
						</div>
					</div>
				) : (
					<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<div>
							<p className="font-normal text-text-sub-600 text-xs">
								Domain name
							</p>
							<div className="mt-1 flex items-center">
								<span className="font-medium text-sm text-text-strong-950">
									{domainToDelete?.domain || "—"}
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Confirmation Input */}
				<div className="mt-4 space-y-2">
					<Label.Root
						htmlFor="delete-domain-confirmation"
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
								id="delete-domain-confirmation"
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
										{isBulk
											? `Delete ${bulkDomainsToDelete.length || ""} domain${bulkDomainsToDelete.length === 1 ? "" : "s"}`
											: "Delete domain"}
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
