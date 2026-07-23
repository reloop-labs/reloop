import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import axios from "axios";
import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	type AnimationPlaybackControls,
} from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import type { Domain } from "../types";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteDomainModal({
	domains,
	onDeleteSuccess,
}: {
	domains: Domain[];
	onDeleteSuccess?: (deletedName: string) => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);

	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const invalidate = useInvalidateDomains();

	// Cache the selected domain so details remain stable when query invalidates upon deletion
	const targetDomainRef = useRef<Domain | null>(null);
	const currentDomain = domains.find((domain) => domain.id === deleteId);
	if (currentDomain) {
		targetDomainRef.current = currentDomain;
	}
	const domainToDelete = currentDomain || targetDomainRef.current;

	const isOnDetailPage =
		pathname.includes("/domain/") &&
		!pathname.includes("/domain/add") &&
		!pathname.endsWith("/domain") &&
		!pathname.endsWith("/domain/");

	const handleDelete = async () => {
		if (!domainToDelete || deleteState !== "idle") return;
		try {
			setDeleteState("deleting");
			const deletedName = domainToDelete.domain;
			await axios.delete(`/api/domain/v1/${domainToDelete.id}`, {
				withCredentials: true,
			});
			setDeleteState("success");
			await invalidate();

			// Show checkmark 'Deleted' state for 900ms before closing modal
			setTimeout(() => {
				onDeleteSuccess?.(deletedName);
				void setDeleteId(null);
				if (isOnDetailPage) {
					setTimeout(() => {
						void navigate({ to: "/domain" });
					}, 100);
				}
				// Reset internal button state after modal exit animation finishes
				setTimeout(() => {
					setDeleteState("idle");
				}, 300);
			}, 900);
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete domain"
				: "Failed to delete domain";
			toast.error(message);
			setDeleteState("idle");
		}
	};

	const startHold = () => {
		if (deleteState !== "idle") return;
		setIsHolding(true);
		holdProgress.set(0);
		animationRef.current = animate(holdProgress, 1, {
			duration: 1.2,
			ease: "linear",
			onComplete: () => {
				setIsHolding(false);
				holdProgress.set(0);
				void handleDelete();
			},
		});
	};

	const cancelHold = () => {
		if (!isHolding && holdProgress.get() === 0) return;
		setIsHolding(false);
		animationRef.current?.stop();
		animate(holdProgress, 0, {
			duration: 0.2,
			ease: "easeOut",
		});
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (domainToDelete && deleteState === "idle") {
				void handleDelete();
			}
		},
		{ enabled: !!deleteId },
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
					cancelHold();
					if (deleteStateRef.current === "success") {
						const name = targetDomainRef.current?.domain;
						if (name) onDeleteSuccess?.(name);
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						targetDomainRef.current = null;
					}, 300);
				}
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				{/* Header */}
				<div className="pr-6">
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Delete domain
					</Modal.Title>
					<p className="mt-2 text-sm text-text-sub-600 leading-relaxed">
						Deleting{" "}
						<span className="font-semibold">{domainToDelete?.domain}</span> will
						stop email sending and receiving immediately. This action cannot be
						undone.
					</p>
				</div>

				{/* Domain Details Card */}
				<div className="mt-5 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<div>
						<p className="font-normal text-text-sub-600 text-xs">Domain name</p>
						<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
							{domainToDelete?.domain}
						</p>
					</div>
				</div>

				{/* Warning Banner */}
				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-bold text-[#6D4000] dark:text-amber-100">
						Important Note:
					</span>{" "}
					DNS records for this domain won't be deleted automatically — you'll
					need to remove them manually from your DNS provider, or email may
					continue to be routed incorrectly.
				</div>

				{/* Footer Actions */}
				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={() => {
							if (deleteState === "idle") {
								cancelHold();
								void setDeleteId(null);
								setDeleteState("idle");
							}
						}}
						className={cn(
							"transition-opacity duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant="destructive"
						size="small"
						onPointerDown={startHold}
						onPointerUp={cancelHold}
						onPointerLeave={cancelHold}
						onPointerCancel={cancelHold}
						className={cn(
							"relative min-w-[134px] select-none justify-center overflow-hidden transition-all duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-90",
						)}
					>
						{/* Hold progress overlay fill */}
						<motion.div
							className="pointer-events-none absolute inset-0 bg-white/25 origin-left"
							style={{ scaleX: holdProgress }}
						/>

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
										<Icon name="check" className="h-4 w-4 shrink-0 text-white" />
										<span>Deleted</span>
									</>
								) : (
									<span>Hold to delete</span>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
