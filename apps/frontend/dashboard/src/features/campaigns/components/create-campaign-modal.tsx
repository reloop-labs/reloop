"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useCampaigns } from "../campaigns-provider";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface CreateCampaignModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateCampaignModal({
	open,
	onOpenChange,
}: CreateCampaignModalProps) {
	const router = useRouter();
	const { activeOrganization } = useActiveOrganization();
	const { createCampaign } = useCampaigns();
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<"idle" | "creating" | "success">("idle");

	const handleClose = () => {
		if (status !== "idle") return;
		setName("");
		setError(null);
		setStatus("idle");
		onOpenChange(false);
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		const trimmed = name.trim();
		if (!trimmed || status !== "idle") return;

		setError(null);
		setStatus("creating");
		try {
			const campaign = await createCampaign(
				{
					name: trimmed,
					subject: trimmed,
					fromName: activeOrganization?.name
						? `${activeOrganization.name} Team`
						: "Team",
					fromEmail: "updates@reloop.sh",
					audienceType: "all",
					audienceTargetName: "All Contacts",
					contentHtml: "",
					sendImmediately: false,
				},
				0,
			);
			setStatus("success");
			setTimeout(() => {
				onOpenChange(false);
				setName("");
				setError(null);
				setStatus("idle");
				router.push(`/campaigns/create?id=${encodeURIComponent(campaign.id)}`);
			}, 450);
		} catch (err) {
			setStatus("idle");
			setError(
				err instanceof Error ? err.message : "Failed to create campaign",
			);
			toast.error(
				err instanceof Error ? err.message : "Failed to create campaign",
			);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle" && name.trim()) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status, name],
	);

	useHotkeys(
		"escape",
		() => {
			if (open && status === "idle") {
				handleClose();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status],
	);

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setName("");
				setError(null);
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	return (
		<Modal.Root open={open} onOpenChange={(next) => !next && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Create campaign
						</Modal.Title>
						<Modal.Description className="mt-1 text-sm text-text-sub-600">
							Give this broadcast a name. You can set audience, sender, and
							content next.
						</Modal.Description>

						<form onSubmit={(e) => void handleSubmit(e)} className="mt-5">
							<div className="space-y-2">
								<Label.Root htmlFor="campaign-name">
									Campaign name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="medium" hasError={Boolean(error)}>
									<Input.Wrapper>
										<Input.Input
											id="campaign-name"
											placeholder="e.g. April product update"
											value={name}
											onChange={(e) => {
												setName(e.target.value);
												if (error) setError(null);
											}}
											autoFocus
											disabled={status !== "idle"}
										/>
									</Input.Wrapper>
								</Input.Root>
								{error ? (
									<p className="text-error-base text-paragraph-xs">{error}</p>
								) : (
									<p className="text-paragraph-xs text-text-sub-600">
										Used internally to find this campaign in your list.
									</p>
								)}
							</div>

							<div className="mt-6 flex items-center justify-end gap-3">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									onClick={handleClose}
									className={cn(
										"gap-1.5 transition-opacity duration-200",
										status !== "idle" && "pointer-events-none opacity-50",
									)}
								>
									Cancel
									<ActionKbd className="lowercase! w-auto min-w-0 px-1">
										esc
									</ActionKbd>
								</Button.Root>
								<FancyButton.Root
									type="submit"
									variant={status === "success" ? "success" : "blue"}
									size="small"
									disabled={
										status === "creating" || (status === "idle" && !name.trim())
									}
									className={cn(
										"min-w-[168px] justify-center overflow-hidden transition-all duration-200",
										status !== "idle" && "pointer-events-none",
										status === "creating" && "opacity-90",
									)}
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={status}
											transition={{
												type: "spring",
												duration: 0.25,
												bounce: 0,
											}}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{status === "creating" ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Creating...</span>
												</>
											) : status === "success" ? (
												<>
													<Icon name="check-circle" className="h-4 w-4" />
													<span>Created</span>
												</>
											) : (
												<>
													Create campaign
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							</div>
						</form>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
