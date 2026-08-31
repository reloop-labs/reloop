import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { Campaign } from "../campaign-types";
import { deleteCampaignRequest } from "../campaigns-api";
import { useInvalidateCampaigns } from "../campaigns-provider";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteCampaignModal({
	campaigns,
	selectedCampaigns = [],
	onClearSelection,
}: {
	campaigns: Campaign[];
	selectedCampaigns?: Campaign[];
	onClearSelection?: () => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [nameCopied, setNameCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const pathname = usePathname();
	const router = useRouter();
	const invalidate = useInvalidateCampaigns();

	const isBulk = deleteId === "bulk" || deleteId === "selected";

	const targetCampaignRef = useRef<Campaign | null>(null);
	const currentCampaign = campaigns.find(
		(campaign) => campaign.id === deleteId,
	);
	if (currentCampaign) {
		targetCampaignRef.current = currentCampaign;
	}
	const campaignToDelete = currentCampaign || targetCampaignRef.current;

	const targetBulkCampaignsRef = useRef<Campaign[]>([]);
	if (isBulk && selectedCampaigns.length > 0) {
		targetBulkCampaignsRef.current = selectedCampaigns;
	}
	const bulkCampaignsToDelete = isBulk
		? selectedCampaigns.length > 0
			? selectedCampaigns
			: targetBulkCampaignsRef.current
		: [];

	const isOnDetailPage =
		pathname.includes("/campaigns/") &&
		!pathname.includes("/campaigns/create") &&
		!pathname.endsWith("/campaigns") &&
		!pathname.endsWith("/campaigns/");

	const displayName = isBulk
		? `delete ${bulkCampaignsToDelete.length} campaign${bulkCampaignsToDelete.length === 1 ? "" : "s"}`
		: campaignToDelete?.name || "campaign";

	const normalizedInput = confirmationText.trim().toLowerCase();
	const isConfirmed = isBulk
		? normalizedInput === displayName.toLowerCase() ||
			normalizedInput === `delete ${bulkCampaignsToDelete.length} campaign` ||
			normalizedInput === "delete"
		: confirmationText === displayName;

	const canDelete =
		isConfirmed &&
		deleteState === "idle" &&
		(isBulk ? bulkCampaignsToDelete.length > 0 : !!campaignToDelete);

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
				for (const campaign of bulkCampaignsToDelete) {
					try {
						await deleteCampaignRequest(campaign.id);
						ok += 1;
					} catch {
						failed += 1;
					}
				}
				setDeleteState("success");
				await invalidate();

				setTimeout(() => {
					onClearSelection?.();
					void setDeleteId(null);
					if (ok > 0) {
						toast.success(`Deleted ${ok} campaign${ok === 1 ? "" : "s"}`);
					}
					if (failed > 0) {
						toast.error(
							`${failed} campaign${failed === 1 ? "" : "s"} failed to delete`,
						);
					}
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetBulkCampaignsRef.current = [];
					}, 300);
				}, 300);
			} catch {
				toast.error("Failed to delete campaigns");
				setDeleteState("idle");
			}
			return;
		}

		if (!campaignToDelete) return;
		try {
			setDeleteState("deleting");
			const deletedName = campaignToDelete.name;
			await deleteCampaignRequest(campaignToDelete.id);
			setDeleteState("success");
			await invalidate();

			setTimeout(() => {
				void setDeleteId(null);
				toast.success(`Deleted "${deletedName}"`);
				if (isOnDetailPage) {
					setTimeout(() => {
						router.push("/campaigns");
					}, 100);
				}
				setTimeout(() => {
					setDeleteState("idle");
					setConfirmationText("");
					targetCampaignRef.current = null;
				}, 300);
			}, 300);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete campaign",
			);
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
						onClearSelection?.();
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetCampaignRef.current = null;
						targetBulkCampaignsRef.current = [];
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
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						{isBulk
							? `Delete ${bulkCampaignsToDelete.length || "selected"} campaigns`
							: "Delete campaign"}
					</Modal.Title>
					<Modal.Description className="text-sm text-text-sub-600 leading-relaxed">
						{isBulk
							? `Are you sure you want to delete ${bulkCampaignsToDelete.length > 1 ? `these ${bulkCampaignsToDelete.length} campaigns` : "this campaign"}? This action cannot be undone.`
							: "Are you sure you want to delete this campaign? This action cannot be undone."}
					</Modal.Description>
				</div>

				<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs leading-relaxed dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
					<span className="font-bold text-red-800 dark:text-red-200">
						Warning:
					</span>{" "}
					{isBulk
						? "Deleting these campaigns removes their send history and analytics from this workspace."
						: "Deleting this campaign removes its send history and analytics from this workspace."}
				</div>

				{isBulk ? (
					<div className="mt-5 space-y-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<p className="font-normal text-text-sub-600 text-xs">
							Selected campaigns ({bulkCampaignsToDelete.length})
						</p>
						<div className="flex flex-wrap gap-1.5 pt-1">
							{bulkCampaignsToDelete.slice(0, 4).map((campaign) => (
								<span
									key={campaign.id}
									className="inline-flex items-center rounded-md bg-bg-white-0 px-2 py-1 font-medium text-text-strong-950 text-xs shadow-2xs dark:bg-bg-weak-50/40"
								>
									{campaign.name}
								</span>
							))}
							{bulkCampaignsToDelete.length > 4 ? (
								<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-2 py-1 font-medium text-text-sub-600 text-xs dark:bg-bg-weak-50/30">
									+{bulkCampaignsToDelete.length - 4} more
								</span>
							) : null}
						</div>
					</div>
				) : (
					<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<div>
							<p className="font-normal text-text-sub-600 text-xs">
								Campaign name
							</p>
							<div className="mt-1 flex items-center">
								<span className="font-medium text-sm text-text-strong-950">
									{campaignToDelete?.name || "—"}
								</span>
							</div>
						</div>
					</div>
				)}

				<div className="mt-4 space-y-2">
					<Label.Root
						htmlFor="delete-campaign-confirmation"
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
								id="delete-campaign-confirmation"
								value={confirmationText}
								onChange={(e) => setConfirmationText(e.target.value)}
								placeholder={displayName}
								disabled={deleteState !== "idle"}
								autoComplete="off"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

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
											? `Delete ${bulkCampaignsToDelete.length || ""} campaign${bulkCampaignsToDelete.length === 1 ? "" : "s"}`
											: "Delete campaign"}
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
