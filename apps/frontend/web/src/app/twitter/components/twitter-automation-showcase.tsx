"use client";

import { cn } from "@reloop/ui/cn";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
	useTransform,
} from "framer-motion";
import { Check, ChevronsRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function delay(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// SlideToPublish — copied from dashboard publish-template-modal, trimmed
// for standalone Twitter demo (no cuelume sound, no Modal wrapper)
// ---------------------------------------------------------------------------

function SlideToPublish({
	onPublish,
	isPublishing,
	isSuccess,
	disabled = false,
	x,
	trackRef,
	maxDrag,
}: {
	onPublish: () => void;
	isPublishing: boolean;
	isSuccess: boolean;
	disabled?: boolean;
	x: ReturnType<typeof useMotionValue<number>>;
	trackRef: React.RefObject<HTMLDivElement | null>;
	maxDrag: number;
}) {
	const idleTextOpacity = useTransform(
		x,
		[0, Math.max(1, maxDrag * 0.55)],
		[1, 0],
	);
	const progressOpacity = useTransform(x, [0, 6], [0, 1]);
	const progressWidth = useTransform(x, (curr) => curr + 56 + 4 * 2);

	const handleDragEnd = (_: unknown, info: { velocity: { x: number } }) => {
		if (disabled || isPublishing || isSuccess || maxDrag <= 0) return;
		const currentX = x.get();
		const threshold = maxDrag * 0.7;
		const isFlick = info.velocity.x > 300;
		if (currentX >= threshold || isFlick) {
			animate(x, maxDrag, {
				type: "spring",
				bounce: 0.12,
				duration: 0.25,
				onComplete: () => onPublish(),
			});
		} else {
			animate(x, 0, { type: "spring", bounce: 0, duration: 0.35 });
		}
	};

	useEffect(() => {
		if (isPublishing || isSuccess) {
			if (maxDrag > 0)
				animate(x, maxDrag, { type: "spring", bounce: 0, duration: 0.25 });
		} else {
			animate(x, 0, { type: "spring", bounce: 0, duration: 0.3 });
		}
	}, [isPublishing, isSuccess, maxDrag, x]);

	return (
		<div
			ref={trackRef}
			className={cn(
				"relative flex h-11 w-full select-none items-center overflow-hidden rounded-full border p-1 transition-colors duration-200",
				isSuccess
					? "border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/15"
					: isPublishing
						? "border-primary-base/30 bg-primary-base/5 dark:border-primary-base/30 dark:bg-primary-base/10"
						: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]",
				disabled && "pointer-events-none opacity-60",
			)}
		>
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

			<motion.div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 pr-4 pl-7 font-medium text-xs tracking-tight">
				<style>{`
					@keyframes slide-shimmer {
						0% { background-position: 150% 0; }
						100% { background-position: -150% 0; }
					}
					.slide-shimmer-text {
						background: linear-gradient(110deg, #949499 0%, #949499 35%, #111111 50%, #949499 65%, #949499 100%);
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
						background: linear-gradient(110deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.35) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.35) 65%, rgba(255,255,255,0.35) 100%);
						background-size: 250% 100%;
						-webkit-background-clip: text;
						background-clip: text;
						-webkit-text-fill-color: transparent;
						color: transparent !important;
					}
				`}</style>
				<AnimatePresence mode="popLayout" initial={false}>
					{isPublishing ? null : isSuccess ? (
						<motion.span
							key="success"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
							className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"
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
							style={{ opacity: idleTextOpacity }}
							className="slide-shimmer-text font-medium text-xs tracking-tight"
						>
							<span>Slide to publish »</span>
						</motion.span>
					)}
				</AnimatePresence>
			</motion.div>

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
					"relative z-10 flex h-9 w-14 cursor-grab items-center justify-center rounded-full text-white active:cursor-grabbing",
					isSuccess
						? "bg-emerald-600"
						: "bg-zero-blue shadow-[0_1px_2px_0_rgba(14,18,27,0.24),0_0_0_1px_#006ffe] before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/[.12] before:to-transparent before:p-px after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-gradient-to-b after:from-white after:to-transparent after:opacity-[.16] hover:after:opacity-[.24] before:[mask-clip:content-box,border-box] before:[mask-composite:exclude] before:[mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)]",
				)}
			>
				<AnimatePresence mode="popLayout" initial={false}>
					{isPublishing ? (
						<motion.div
							className="-mt-3.5 relative"
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
							<ChevronsRight className="size-[18px]" strokeWidth={2.5} />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Publish card demo with auto cursor (for video)
// ---------------------------------------------------------------------------

function PublishSlideDemo() {
	const shouldReduceMotion = !!useReducedMotion();
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState<"idle" | "publishing" | "success">(
		"idle",
	);

	const trackRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const thumbRef = useRef<HTMLDivElement>(null);

	const x = useMotionValue(0);
	const [trackWidth, setTrackWidth] = useState(360);
	const thumbSize = 56;
	const padding = 4;
	const maxDrag = Math.max(0, trackWidth - thumbSize - padding * 2);

	const [cursor, setCursor] = useState({
		x: 50,
		y: 90,
		visible: true,
		down: false,
	});

	const isPublishing = status === "publishing";
	const isSuccess = status === "success";

	useEffect(() => {
		const update = () => {
			if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth);
		};
		update();
		const ro = new ResizeObserver(update);
		if (trackRef.current) ro.observe(trackRef.current);
		window.addEventListener("resize", update);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", update);
		};
	}, []);

	const handlePublish = async () => {
		if (isPublishing || isSuccess) return;
		setStatus("publishing");
		await delay(1500);
		setStatus("success");
		await delay(1800);
		// keeps success visible — auto loop will reset
	};

	// Auto cursor loop
	useEffect(() => {
		let cancelled = false;
		const AUTO_TEXT = "Fixed layout issues, added welcome banner.";

		const getPositions = () => {
			const card = cardRef.current;
			const ta = textareaRef.current;
			const track = trackRef.current;
			if (!card || !ta || !track) return null;
			const cardRect = card.getBoundingClientRect();
			const taRect = ta.getBoundingClientRect();
			const trackRect = track.getBoundingClientRect();
			const liveTrackWidth = track.offsetWidth;
			const liveMaxDrag = Math.max(0, liveTrackWidth - thumbSize - padding * 2);
			// thumb center is padding + half thumb
			const thumbX = trackRect.left - cardRect.left + padding + thumbSize / 2;
			const thumbY = trackRect.top - cardRect.top + trackRect.height / 2;
			const thumbEndX =
				trackRect.left - cardRect.left + padding + thumbSize / 2 + liveMaxDrag;
			return {
				textarea: {
					x: taRect.left - cardRect.left + taRect.width / 2,
					y: taRect.top - cardRect.top + taRect.height / 2,
				},
				thumbStart: { x: thumbX, y: thumbY },
				thumbEnd: { x: thumbEndX, y: thumbY },
				liveMaxDrag,
			};
		};

		const run = async () => {
			await delay(900);
			while (!cancelled) {
				setStatus("idle");
				setDescription("");
				x.set(0);
				setCursor((c) => ({ ...c, visible: true, down: false }));
				await delay(300);
				const pos = getPositions();
				if (!pos || pos.liveMaxDrag <= 0) {
					await delay(400);
					continue;
				}

				// Move to textarea
				setCursor({
					x: pos.textarea.x,
					y: pos.textarea.y,
					visible: true,
					down: false,
				});
				await delay(550);
				setCursor((c) => ({ ...c, down: true }));
				await delay(120);
				setCursor((c) => ({ ...c, down: false }));
				await delay(150);

				// Type description
				for (let i = 1; i <= AUTO_TEXT.length; i++) {
					if (cancelled) return;
					setDescription(AUTO_TEXT.slice(0, i));
					await delay(28);
				}
				await delay(450);

				// Move to thumb
				setCursor({
					x: pos.thumbStart.x,
					y: pos.thumbStart.y,
					visible: true,
					down: false,
				});
				await delay(450);
				// Grab and drag — keep thumb + cursor locked together
				setCursor((c) => ({ ...c, down: true }));
				await delay(100);
				// animate thumb to live measured end, not stale maxDrag
				void animate(x, pos.liveMaxDrag, {
					type: "spring",
					bounce: 0.12,
					duration: 0.55,
				});
				// move cursor visually with thumb to exact end center
				setCursor({
					x: pos.thumbEnd.x,
					y: pos.thumbEnd.y,
					visible: true,
					down: true,
				});
				await delay(620);
				if (cancelled) return;
				// trigger publish
				void handlePublish();
				setCursor((c) => ({ ...c, down: false }));
				await delay(3800);
				if (cancelled) return;
				// fade cursor then loop
				setCursor((c) => ({ ...c, visible: false }));
				await delay(600);
			}
		};
		void run();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div
			ref={cardRef}
			className="relative w-[400px] max-w-[92vw] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
		>
			<div className="relative flex flex-col justify-between overflow-hidden">
				<AnimatePresence mode="wait">
					{isSuccess ? (
						<motion.div
							key="success"
							initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
							animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ type: "spring", duration: 0.35, bounce: 0 }}
							className="m-0.5 flex flex-col items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 py-10 text-center dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
						>
							<svg
								width="36"
								height="36"
								viewBox="0 0 32 32"
								fill="none"
								className="text-primary-base"
							>
								<path
									d="M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
									fill="currentColor"
									fillOpacity="0.16"
								/>
								<path
									d="M12.1334 16.9667L15.0334 19.8667L19.8667 13.1M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
									stroke="currentColor"
									strokeWidth="2.4"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<h3 className="mt-3 font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
								Template published!
							</h3>
							<p className="mt-1 text-text-sub-600 text-xs dark:text-text-sub-400">
								Your template is now live.
							</p>
						</motion.div>
					) : (
						<motion.div
							key="form"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
							transition={{ duration: 0.2 }}
							className="flex h-full flex-col justify-between"
						>
							<div className="m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
								<div className="flex items-center justify-between px-6 pt-5">
									<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
										Publish template
									</h2>
									<button
										type="button"
										aria-label="Close"
										className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
									>
										<X className="size-3.5" strokeWidth={2.25} />
									</button>
								</div>
								<div className="space-y-4 px-6 pt-4 pb-5">
									<div className="space-y-1.5">
										<Label.Root
											htmlFor="publishDescriptionTwitter"
											className="font-semibold text-sm text-text-strong-950 dark:text-white"
										>
											Release description
										</Label.Root>
										<Textarea.Root
											id="publishDescriptionTwitter"
											simple
											rows={2}
											placeholder="Describe what changed in this version (e.g. fixed layout issues, added welcome banner)..."
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											className="min-h-[58px] resize-none rounded-xl text-text-strong-950 text-xs dark:text-white"
											ref={
												textareaRef as unknown as React.Ref<HTMLTextAreaElement>
											}
										/>
									</div>
								</div>
							</div>
							<div className="relative p-2.5 pb-3.5">
								<SlideToPublish
									onPublish={handlePublish}
									isPublishing={isPublishing}
									isSuccess={false}
									disabled={isPublishing}
									x={x}
									trackRef={trackRef}
									maxDrag={maxDrag}
								/>
								{/* invisible thumb ref for cursor targeting — actual thumb is inside SlideToPublish */}
								<div ref={thumbRef} className="pointer-events-none absolute" />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Gradient auto cursor */}
			<AnimatePresence>
				{cursor.visible ? (
					<motion.div
						className="pointer-events-none absolute z-50"
						initial={false}
						animate={{
							x: cursor.x,
							y: cursor.y,
							scale: cursor.down ? 0.88 : 1,
						}}
						transition={
							shouldReduceMotion
								? { duration: 0 }
								: { type: "spring", duration: 0.45, bounce: 0 }
						}
						style={{ left: 0, top: 0 }}
					>
						<motion.div
							animate={{ scale: cursor.down ? 0.92 : 1 }}
							transition={{ duration: 0.12 }}
							className="relative"
						>
							<svg
								width="28"
								height="28"
								viewBox="0 0 28 28"
								fill="none"
								className="drop-shadow-[0_2px_10px_rgba(37,99,235,0.35)]"
							>
								<defs>
									<linearGradient
										id="cursorGradPublish"
										x1="5"
										y1="3"
										x2="19"
										y2="25"
										gradientUnits="userSpaceOnUse"
									>
										<stop offset="0%" stopColor="#60A5FA" />
										<stop offset="55%" stopColor="#3B82F6" />
										<stop offset="100%" stopColor="#6366F1" />
									</linearGradient>
									<filter
										id="cursorShadowPub"
										x="-20%"
										y="-20%"
										width="140%"
										height="140%"
									>
										<feDropShadow
											dx="0"
											dy="2"
											stdDeviation="2.5"
											floodOpacity="0.28"
										/>
									</filter>
								</defs>
								<path
									d="M5 3L23 12.5L13.2 16.6L9.5 25L5 3Z"
									fill="url(#cursorGradPublish)"
									stroke="white"
									strokeWidth="1.4"
									strokeLinejoin="round"
									filter="url(#cursorShadowPub)"
								/>
								<path
									d="M5 3L23 12.5L13.2 16.6L9.5 25L5 3Z"
									fill="none"
									stroke="black"
									strokeOpacity="0.10"
									strokeWidth="0.9"
									strokeLinejoin="round"
								/>
							</svg>
							<AnimatePresence>
								{cursor.down ? (
									<motion.div
										initial={{ scale: 0.4, opacity: 0.5 }}
										animate={{ scale: 1, opacity: 0 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.45, ease: "easeOut" }}
										className="absolute top-[4px] left-[4px] h-6 w-6 rounded-full border border-black/15 bg-black/10"
									/>
								) : null}
							</AnimatePresence>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

export function TwitterAutomationShowcase() {
	return (
		<div
			data-standalone="true"
			className="relative flex min-h-dvh w-full items-center justify-center bg-white p-6 dark:bg-[#080808]"
		>
			<div className="absolute inset-0 bg-white dark:bg-[#080808]" />
			<div className="relative flex w-full justify-center">
				<PublishSlideDemo />
			</div>
		</div>
	);
}
