import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { play } from "cuelume";
import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { Check, ChevronsRight, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

export interface SlideToPublishProps {
	onPublish: () => void;
	isPublishing: boolean;
	isSuccess: boolean;
	disabled?: boolean;
}

export function SlideToPublish({
	onPublish,
	isPublishing,
	isSuccess,
	disabled = false,
}: SlideToPublishProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [trackWidth, setTrackWidth] = useState(0);
	const x = useMotionValue(0);

	const thumbSize = 36;
	const padding = 4;
	const maxDrag = Math.max(0, trackWidth - thumbSize - padding * 2);

	useEffect(() => {
		const updateWidth = () => {
			if (trackRef.current) {
				setTrackWidth(trackRef.current.offsetWidth);
			}
		};
		updateWidth();
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, []);

	// Keep thumb at the end if publishing or success
	useEffect(() => {
		if (isPublishing || isSuccess) {
			if (maxDrag > 0) {
				animate(x, maxDrag, { type: "spring", bounce: 0, duration: 0.25 });
			}
		} else {
			animate(x, 0, { type: "spring", bounce: 0, duration: 0.3 });
		}
	}, [isPublishing, isSuccess, maxDrag, x]);

	const textOpacity = useTransform(x, [0, Math.max(1, maxDrag * 0.55)], [1, 0]);
	const progressOpacity = useTransform(x, [0, 6], [0, 1]);
	const progressWidth = useTransform(x, (curr) => curr + thumbSize + padding * 2);

	const handleDragEnd = (_: any, info: { velocity: { x: number } }) => {
		if (disabled || isPublishing || isSuccess || maxDrag <= 0) return;
		const currentX = x.get();
		const threshold = maxDrag * 0.7;
		const isFlick = info.velocity.x > 300;

		if (currentX >= threshold || isFlick) {
			play("success", { volume: 0.45 });
			animate(x, maxDrag, {
				type: "spring",
				bounce: 0.12,
				duration: 0.25,
				onComplete: () => {
					onPublish();
				},
			});
		} else {
			animate(x, 0, {
				type: "spring",
				bounce: 0,
				duration: 0.35,
			});
		}
	};

	return (
		<div
			ref={trackRef}
			className={cn(
				"relative flex h-11 w-full select-none items-center overflow-hidden rounded-full border p-1 transition-colors duration-200",
				isSuccess
					? "border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/15"
					: isPublishing
						? "border-primary-base/30 bg-primary-base/5 dark:border-primary-base/30 dark:bg-primary-base/10"
						: "border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]",
				disabled && "pointer-events-none opacity-60",
			)}
		>
			{/* Animated Progress Fill behind thumb */}
			<motion.div
				style={{
					width: progressWidth,
					opacity: isSuccess || isPublishing ? 1 : progressOpacity,
				}}
				className={cn(
					"pointer-events-none absolute top-0 bottom-0 left-0 rounded-full transition-colors duration-200",
					isSuccess
						? "bg-emerald-500/20 dark:bg-emerald-500/30"
						: "bg-primary-base/15 dark:bg-primary-base/20",
				)}
			/>

			{/* Center Text: Apple Slide Shimmer */}
			<motion.div
				style={{ opacity: textOpacity }}
				className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 pl-7 pr-4 font-medium text-xs tracking-tight"
			>
				<style>{`
					@keyframes slide-shimmer {
						0% {
							background-position: 150% 0;
						}
						100% {
							background-position: -150% 0;
						}
					}
					.slide-shimmer-text {
						background: linear-gradient(
							110deg,
							#949499 0%,
							#949499 35%,
							#111111 50%,
							#949499 65%,
							#949499 100%
						);
						background-size: 250% 100%;
						-webkit-background-clip: text;
						background-clip: text;
						-webkit-text-fill-color: transparent;
						color: transparent !important;
						animation: slide-shimmer 2.2s linear infinite;
						display: inline-flex;
						align-items: center;
						gap: 4px;
					}
					:is(.dark, [data-theme="dark"]) .slide-shimmer-text {
						background: linear-gradient(
							110deg,
							rgba(255, 255, 255, 0.35) 0%,
							rgba(255, 255, 255, 0.35) 35%,
							rgba(255, 255, 255, 1) 50%,
							rgba(255, 255, 255, 0.35) 65%,
							rgba(255, 255, 255, 0.35) 100%
						);
						background-size: 250% 100%;
						-webkit-background-clip: text;
						background-clip: text;
						-webkit-text-fill-color: transparent;
						color: transparent !important;
					}
				`}</style>
				<AnimatePresence mode="popLayout" initial={false}>
					{isPublishing ? (
						<motion.span
							key="publishing"
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 8 }}
							className="flex items-center gap-1.5 text-primary-base font-semibold"
						>
							<Spinner size={13} color="currentColor" />
							<span>Publishing...</span>
						</motion.span>
					) : isSuccess ? (
						<motion.span
							key="success"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
							className="flex items-center gap-1 text-emerald-600 font-semibold dark:text-emerald-400"
						>
							<Check className="size-3.5" strokeWidth={2.5} />
							<span>Published</span>
						</motion.span>
					) : (
						<motion.span
							key="idle"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="slide-shimmer-text font-medium text-xs tracking-tight"
						>
							<span>slide to publish</span>
							<span className="font-mono text-sm leading-none tracking-tighter">››</span>
						</motion.span>
					)}
				</AnimatePresence>
			</motion.div>

			{/* Draggable Thumb Knob */}
			<motion.div
				drag={!disabled && !isPublishing && !isSuccess ? "x" : false}
				dragConstraints={{ left: 0, right: maxDrag }}
				dragElastic={0.06}
				dragMomentum={false}
				onDragEnd={handleDragEnd}
				style={{ x }}
				whileHover={!disabled && !isPublishing ? { scale: 1.04 } : undefined}
				whileTap={!disabled && !isPublishing ? { scale: 0.96 } : undefined}
				className={cn(
					"relative z-10 flex size-9 cursor-grab items-center justify-center rounded-full text-white shadow-sm transition-shadow active:cursor-grabbing",
					isSuccess
						? "bg-emerald-600 shadow-emerald-500/30"
						: "bg-primary-base shadow-primary-base/30 hover:shadow-md hover:shadow-primary-base/40",
				)}
			>
				<AnimatePresence mode="popLayout" initial={false}>
					{isPublishing ? (
						<motion.div
							key="publishing-thumb"
							initial={{ opacity: 0, scale: 0.7 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.7 }}
						>
							<Spinner size={15} color="currentColor" />
						</motion.div>
					) : isSuccess ? (
						<motion.div
							key="success-thumb"
							initial={{ opacity: 0, scale: 0.7 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.7 }}
						>
							<Check className="size-4" strokeWidth={2.5} />
						</motion.div>
					) : (
						<motion.div
							key="idle-thumb"
							initial={{ opacity: 0, scale: 0.7 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.7 }}
						>
							<ChevronsRight className="size-4.5" strokeWidth={2.5} />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}

interface PublishModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (description: string) => Promise<void>;
	isPublishing?: boolean;
	latestPublished?: any;
	currentHtml?: string;
	currentSubject?: string;
	title?: string;
}

export function PublishTemplateModal({
	isOpen,
	onClose,
	onConfirm,
	isPublishing = false,
	title = "Publish template",
}: PublishModalProps) {
	const [status, setStatus] = useState<"idle" | "publishing" | "success">("idle");
	const [description, setDescription] = useState("");

	const isBusy = status === "publishing" || isPublishing;

	const handleClose = () => {
		if (isBusy) return;
		setDescription("");
		setStatus("idle");
		onClose();
	};

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => {
				setDescription("");
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	const handlePublish = async () => {
		if (isBusy) return;

		setStatus("publishing");
		try {
			await onConfirm(description.trim());
			setStatus("success");
			setTimeout(() => {
				setDescription("");
				setStatus("idle");
				onClose();
			}, 500);
		} catch (error) {
			console.error("Failed to publish version:", error);
			setStatus("idle");
		}
	};

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (isOpen && !isBusy) {
				void handlePublish();
			}
		},
		{ enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: isOpen },
		[isOpen, isBusy, description],
	);

	useHotkeys(
		"escape",
		() => {
			if (isOpen && !isBusy) {
				handleClose();
			}
		},
		{ enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: isOpen },
		[isOpen, isBusy],
	);

	return (
		<Modal.Root open={isOpen} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
			>
				<div className="relative m-0.5 space-y-4.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
					{/* Header without icon */}
					<div className="flex items-center justify-between px-6 dark:border-stroke-soft-100/40">
						<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
							{title}
						</Modal.Title>
						<button
							type="button"
							onClick={handleClose}
							aria-label="Close"
							disabled={isBusy}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
						>
							<X className="size-3.5" strokeWidth={2.25} />
						</button>
					</div>

					{/* Form Content */}
					<div className="space-y-4 px-6 pb-6">
						{/* Release Description */}
						<div className="space-y-1.5">
							<Label.Root
								htmlFor="publishDescription"
								className="font-semibold text-sm text-text-strong-950 dark:text-white"
							>
								Release description
							</Label.Root>
							<Textarea.Root
								id="publishDescription"
								simple
								placeholder="Describe what changed in this version (e.g. fixed layout issues, added welcome banner)..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={isBusy}
								className="min-h-[108px] resize-none rounded-xl text-xs text-text-strong-950 dark:text-white"
								autoFocus
							/>
						</div>
					</div>
				</div>

				{/* Actions / Footer with Slide to Confirm */}
				<div className="relative flex items-center justify-between gap-3 px-3.5 pt-2.5 pb-3.5">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={handleClose}
						className={cn(
							"shrink-0 gap-1.5 transition-opacity duration-200",
							isBusy && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>

					<div className="min-w-0 flex-1">
						<SlideToPublish
							onPublish={handlePublish}
							isPublishing={isBusy}
							isSuccess={status === "success"}
							disabled={isBusy}
						/>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
