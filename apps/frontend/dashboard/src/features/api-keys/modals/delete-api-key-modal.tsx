import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
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
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyData } from "../types";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteApiKeyModal({
	apiKeys,
	onDeleteSuccess,
}: {
	apiKeys: ApiKeyData[];
	onDeleteSuccess?: (deletedName: string) => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);
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

	const handleDelete = async () => {
		if (!apiKeyToDelete || deleteState !== "idle") return;
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
			if (apiKeyToDelete && deleteState === "idle") {
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
						targetApiKeyRef.current = null;
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
						Delete API key
					</Modal.Title>
					<p className="mt-2 text-sm leading-relaxed text-text-sub-600">
						Are you sure you want to delete this API key? This action cannot be
						undone.
					</p>
				</div>

				{/* Key Details Card */}
				<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<div>
						<p className="font-normal text-text-sub-600 text-xs">
							API key name
						</p>
						<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
							{displayName}
						</p>
					</div>
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
				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-bold text-[#6D4000] dark:text-amber-100">
						Warning:
					</span>{" "}
					Deleting this API key will permanently remove it along with all its
					permissions. Any services using this API key will stop working
					immediately.
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
