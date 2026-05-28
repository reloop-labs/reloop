"use client";

import * as Button from "@reloop/ui/button";
import { Logo } from "@reloop/ui/logo";
import {
	Activity,
	ArrowRight,
	BarChart3,
	Code2,
	Globe,
	Pause,
	Play,
	Sparkles,
	Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";

export const SetupCompleteStep = () => {
	const router = useRouter();
	const [name] = useQueryState("name", parseAsString.withDefault(""));
	const [domain] = useQueryState("domain", parseAsString.withDefault(""));
	const [logoUrl] = useQueryState("logoUrl", parseAsString.withDefault(""));
	const [logoPreview] = useQueryState(
		"logoPreview",
		parseAsString.withDefault(""),
	);

	const [countdown, setCountdown] = useState(15);
	const [isPaused, setIsPaused] = useState(false);

	useEffect(() => {
		if (isPaused) return;
		if (countdown <= 0) {
			router.push("/");
			return;
		}

		const timer = setTimeout(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [countdown, isPaused, router]);

	const monogram = useMemo(() => {
		return name ? name.charAt(0).toUpperCase() : "W";
	}, [name]);

	const confettiParticles = useMemo(() => {
		return Array.from({ length: 16 }).map((_, i) => {
			const angle = (i * 360) / 16 + (Math.random() * 15 - 7.5);
			const rad = (angle * Math.PI) / 180;
			const distance = 55 + Math.random() * 35;
			return {
				x: Math.cos(rad) * distance,
				y: Math.sin(rad) * distance,
				scale: 0.4 + Math.random() * 0.6,
				delay: Math.random() * 0.25,
				color: i % 3 === 0 ? "#1fc16b" : i % 3 === 1 ? "#335cff" : "#f6b51e",
			};
		});
	}, []);

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-white-0 p-4 font-sans sm:p-6 md:p-8 dark:bg-[#0a0a0a]">
			{/* Animated Ambient background grid + mesh gradients */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

				<motion.div
					animate={{
						x: [0, 30, -20, 0],
						y: [0, -40, 30, 0],
					}}
					transition={{
						duration: 14,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
					className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-green-500/10 blur-[100px] dark:bg-green-500/5"
				/>

				<motion.div
					animate={{
						x: [0, -40, 20, 0],
						y: [0, 30, -30, 0],
					}}
					transition={{
						duration: 16,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
					className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/5"
				/>
			</div>

			{/* Main Container */}
			<div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
				{/* Top Logo */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-8 flex items-center space-x-2"
				>
					<Logo className="h-9 w-9" />
					<span
						className="-ml-3 -mt-0.5 font-semibold text-lg text-text-strong-950 dark:text-white/90"
						style={{ fontFamily: "var(--font-outfit)" }}
					>
						reloop
					</span>
				</motion.div>

				{/* Animated Success Checkmark & Confetti */}
				<div className="relative mb-6 flex h-20 w-20 items-center justify-center">
					<div className="absolute inset-0 rounded-full bg-success-light/10 blur-md dark:bg-success-dark/10" />

					{/* Custom Confetti particles burst */}
					{confettiParticles.map((p, idx) => (
						<motion.div
							key={idx}
							className="absolute h-1.5 w-1.5 rounded-full"
							style={{ backgroundColor: p.color }}
							initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
							animate={{ x: p.x, y: p.y, scale: p.scale, opacity: 0 }}
							transition={{
								duration: 0.9,
								delay: p.delay + 0.3,
								ease: [0.23, 1, 0.32, 1],
							}}
						/>
					))}

					{/* Drawing Checkmark Circle */}
					<svg
						className="relative z-10 h-16 w-16 text-success-base"
						viewBox="0 0 52 52"
						fill="none"
					>
						<motion.circle
							cx="26"
							cy="26"
							r="24"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 0.6, ease: "easeOut" }}
						/>
						<motion.path
							d="M16 27 l7 7 l13 -14"
							stroke="currentColor"
							strokeWidth="3.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 0.4, delay: 0.4, ease: "easeInOut" }}
						/>
					</svg>
				</div>

				{/* Headings */}
				<motion.h2
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="mb-2 text-center font-bold text-3xl text-text-strong-950 tracking-tight md:text-4xl dark:text-white/95"
					style={{ fontFamily: "var(--font-outfit)" }}
				>
					Workspace Ready!
				</motion.h2>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.3 }}
					className="mx-auto mb-8 max-w-md text-center text-text-sub-600 dark:text-white/60"
				>
					Your onboarding setup is complete. Reloop is configured and active.
				</motion.p>

				{/* Cards Grid */}
				<div className="mb-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
					{/* Workspace Preview Card */}
					<motion.div
						initial={{ opacity: 0, x: -15 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
						className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-stroke-soft-100 bg-white/60 p-6 shadow-custom-sm backdrop-blur-md dark:border-white/10 dark:bg-[#1a1a1a]/60"
					>
						<div className="-top-10 -right-10 pointer-events-none absolute h-32 w-32 rounded-full bg-success-base/5 blur-2xl" />

						<div>
							<div className="mb-6 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
										{logoUrl || logoPreview ? (
											<img
												src={logoUrl || logoPreview}
												alt="Workspace Logo"
												className="h-full w-full object-cover"
											/>
										) : (
											<span className="bg-gradient-to-tr from-primary-base to-blue-400 bg-clip-text font-bold text-transparent text-xl">
												{monogram}
											</span>
										)}
									</div>
									<div>
										<h4 className="font-semibold text-text-strong-950 dark:text-white/90">
											{name || "My Workspace"}
										</h4>
										<p className="text-text-soft-400 text-xs dark:text-white/40">
											Active Organization
										</p>
									</div>
								</div>

								<div className="flex items-center gap-1.5 rounded-full bg-success-lighter/50 px-2.5 py-1 font-semibold text-success-base text-xs dark:bg-success-dark/20">
									<span className="relative flex h-2 w-2">
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-base opacity-75" />
										<span className="relative inline-flex h-2 w-2 rounded-full bg-success-base" />
									</span>
									Ready
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center justify-between border-stroke-soft-100/50 border-b py-2 text-sm dark:border-white/5">
									<span className="flex items-center gap-1.5 text-text-sub-600 dark:text-white/50">
										<Globe size={14} className="text-text-soft-400" />
										Domain
									</span>
									<span className="select-all font-medium text-text-strong-950 dark:text-white/80">
										{domain || "sandbox.reloop.co"}
									</span>
								</div>

								<div className="flex items-center justify-between border-stroke-soft-100/50 border-b py-2 text-sm dark:border-white/5">
									<span className="flex items-center gap-1.5 text-text-sub-600 dark:text-white/50">
										<Activity size={14} className="text-text-soft-400" />
										Environment
									</span>
									<span className="font-medium text-text-strong-950 dark:text-white/80">
										Production
									</span>
								</div>

								<div className="flex flex-col gap-1.5 py-2">
									<span className="text-text-soft-400 text-xs dark:text-white/50">
										Default API Endpoint
									</span>
									<div className="flex items-center justify-between rounded-lg border border-stroke-soft-100/50 bg-bg-weak-50/50 px-3 py-1.5 dark:border-white/5 dark:bg-black/20">
										<span className="font-mono text-text-sub-600 text-xs dark:text-white/60">
											https://api.reloop.co/v1
										</span>
										<span className="font-bold text-[10px] text-success-base uppercase tracking-wider">
											Verified
										</span>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-6 flex items-center gap-2 border-stroke-soft-100/50 border-t pt-4 text-text-soft-400 text-xs dark:border-white/5 dark:text-white/40">
							<Sparkles size={12} className="text-success-base" />
							Manage settings anytime in dashboard.
						</div>
					</motion.div>

					{/* Next Steps Checklist */}
					<motion.div
						initial={{ opacity: 0, x: 15 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
						className="flex flex-col gap-4"
					>
						<h3 className="px-1 font-bold text-text-soft-400 text-xs uppercase tracking-wider dark:text-white/40">
							Quick Start Checklist
						</h3>

						<div className="group flex items-start gap-4 rounded-2xl border border-stroke-soft-100 bg-white/40 p-4 transition-all hover:bg-bg-weak-50/70 dark:border-white/5 dark:bg-[#1a1a1a]/30 dark:hover:bg-white/[0.04]">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-base/10 text-primary-base">
								<Users size={18} />
							</div>
							<div>
								<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white/90">
									Invite Teammates
								</h4>
								<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
									Add developers, admins, and support agents to share workspace
									controls.
								</p>
							</div>
						</div>

						<div className="group flex items-start gap-4 rounded-2xl border border-stroke-soft-100 bg-white/40 p-4 transition-all hover:bg-bg-weak-50/70 dark:border-white/5 dark:bg-[#1a1a1a]/30 dark:hover:bg-white/[0.04]">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
								<Code2 size={18} />
							</div>
							<div>
								<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white/90">
									Integrate the SDK / API
								</h4>
								<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
									Check out developer guides to setup Node.js, Python, PHP SDK,
									or SMTP.
								</p>
							</div>
						</div>

						<div className="group flex items-start gap-4 rounded-2xl border border-stroke-soft-100 bg-white/40 p-4 transition-all hover:bg-bg-weak-50/70 dark:border-white/5 dark:bg-[#1a1a1a]/30 dark:hover:bg-white/[0.04]">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
								<BarChart3 size={18} />
							</div>
							<div>
								<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white/90">
									Monitor Delivery Metrics
								</h4>
								<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
									Watch real-time delivery graphs, bounce rates, and webhook
									events.
								</p>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Redirect Footer Banner */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
					className="flex w-full flex-col items-center justify-between gap-4 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 sm:flex-row dark:border-white/10 dark:bg-neutral-900/30"
				>
					<div className="flex items-center gap-3">
						{/* Progress ring countdown */}
						<div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
							<svg className="-rotate-90 h-8 w-8" viewBox="0 0 36 36">
								<circle
									className="text-stroke-soft-100 dark:text-white/5"
									strokeWidth="3"
									stroke="currentColor"
									fill="none"
									cx="18"
									cy="18"
									r="16"
								/>
								<motion.circle
									className="text-success-base"
									strokeWidth="3"
									strokeDasharray="100"
									strokeDashoffset={100 - (countdown / 15) * 100}
									strokeLinecap="round"
									stroke="currentColor"
									fill="none"
									cx="18"
									cy="18"
									r="16"
									animate={{ strokeDashoffset: 100 - (countdown / 15) * 100 }}
									transition={{ duration: 0.2 }}
								/>
							</svg>
							<span className="absolute font-bold text-[11px] text-text-strong-950 dark:text-white">
								{countdown}
							</span>
						</div>
						<span className="text-sm text-text-sub-600 dark:text-white/60">
							{isPaused
								? "Auto-redirect paused"
								: "Redirecting to dashboard..."}
						</span>
					</div>

					<div className="flex w-full items-center gap-3 sm:w-auto">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => setIsPaused(!isPaused)}
							className="flex-1 sm:flex-initial"
						>
							{isPaused ? (
								<>
									<Play size={14} className="mr-1.5" /> Resume
								</>
							) : (
								<>
									<Pause size={14} className="mr-1.5" /> Pause
								</>
							)}
						</Button.Root>
						<Button.Root
							variant="neutral"
							mode="filled"
							size="xsmall"
							onClick={() => router.push("/")}
							className="flex-1 sm:flex-initial"
						>
							Go to Dashboard <ArrowRight size={14} className="ml-1.5" />
						</Button.Root>
					</div>
				</motion.div>
			</div>
		</div>
	);
};
