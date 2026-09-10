"use client";

import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PasswordResetWidget() {
	const [step, setStep] = useState<"idle" | "notified" | "form" | "done">(
		"idle",
	);
	const [pass, setPass] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState("");

	const requestReset = () => {
		if (step !== "idle") return;
		setStep("notified");
	};

	const openResetForm = () => {
		setStep("form");
	};

	const submitNewPassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (!pass || pass.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		if (pass !== confirm) {
			setError("Passwords do not match.");
			return;
		}
		setError("");
		setStep("done");
	};

	const resetAll = () => {
		setStep("idle");
		setPass("");
		setConfirm("");
		setError("");
	};

	return (
		<div className="flex h-full min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 text-left font-sans shadow-lg dark:border-white/10 dark:bg-slate-950 dark:shadow-2xl">
			{/* Controls outside phone */}
			<div className="mb-4 flex w-full items-center justify-between gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/60 p-3 dark:border-white/5 dark:bg-slate-900/60">
				<div className="min-w-0 flex-1">
					<span className="font-mono text-[10px] text-text-sub-600 dark:text-white/40">
						AUTH TYPE
					</span>
					<div className="truncate font-bold font-mono text-text-strong-950 text-xs dark:text-white/80">
						Transactional JWT Drip
					</div>
				</div>
				{step === "idle" ? (
					<button
						type="button"
						onClick={requestReset}
						className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 font-medium text-[11px] text-white transition-colors hover:bg-orange-500 active:scale-95"
					>
						<Icon name="lock" className="h-3 w-3" />
						<span>Request link</span>
					</button>
				) : (
					<button
						type="button"
						onClick={resetAll}
						className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 font-medium text-[11px] text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:bg-slate-900 dark:text-white/70 dark:hover:bg-slate-800"
					>
						<Icon name="refresh-cw" className="h-3 w-3" />
						<span>Reset</span>
					</button>
				)}
			</div>

			{/* iPhone Mockup */}
			<div className="relative h-[372px] w-[172px] rounded-[2.4rem] bg-gradient-to-b from-slate-600 via-slate-800 to-slate-700 p-[3px] shadow-[0_20px_45px_-15px_rgba(0,0,0,0.5)]">
				{/* Side buttons */}
				<span className="-left-[2px] absolute top-[68px] h-4 w-[2px] rounded-l bg-slate-700" />
				<span className="-left-[2px] absolute top-[96px] h-7 w-[2px] rounded-l bg-slate-700" />
				<span className="-left-[2px] absolute top-[132px] h-7 w-[2px] rounded-l bg-slate-700" />
				<span className="-right-[2px] absolute top-[110px] h-11 w-[2px] rounded-r bg-slate-700" />

				<div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[2.2rem] bg-bg-white-0 dark:bg-black">
					{/* Dynamic Island */}
					<div className="-translate-x-1/2 absolute top-2 left-1/2 z-30 flex h-[19px] w-[56px] items-center justify-end rounded-full bg-black pr-2">
						<span className="h-[7px] w-[7px] rounded-full bg-slate-700 ring-1 ring-slate-600" />
					</div>

					{/* Home indicator */}
					<div className="-translate-x-1/2 absolute bottom-1.5 left-1/2 z-30 h-[3px] w-[68px] rounded-full bg-text-strong-950/25 dark:bg-white/35" />

					{/* Smartphone Screen Content */}
					<div className="flex flex-1 select-none flex-col justify-between px-3 pt-2.5 pb-5 text-xs">
						{/* Status Bar */}
						<div className="flex items-center justify-between px-2 font-medium text-[9px] text-text-strong-950 dark:text-white">
							<span className="w-10">08:14</span>
							<div className="flex w-10 items-center justify-end gap-1">
								<Icon name="wifi" className="h-2.5 w-2.5" />
								<svg
									viewBox="0 0 26 13"
									className="h-2.5 w-[19px]"
									fill="none"
									aria-hidden
								>
									<rect
										x="0.5"
										y="0.5"
										width="22"
										height="12"
										rx="3.5"
										stroke="currentColor"
										strokeOpacity="0.4"
									/>
									<rect
										x="2"
										y="2"
										width="15"
										height="9"
										rx="2"
										fill="currentColor"
									/>
									<path
										d="M24.5 4.5v4a2.5 2.5 0 0 0 0-4Z"
										fill="currentColor"
										fillOpacity="0.4"
									/>
								</svg>
							</div>
						</div>

						{/* Step Screens */}
						<div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
							{step === "idle" && (
								<div className="space-y-2 text-center">
									<Icon
										name="lock"
										className="mx-auto h-8 w-8 text-text-soft-400 dark:text-white/20"
									/>
									<p className="text-[10px] text-text-sub-600 dark:text-white/40">
										Waiting for trigger request...
									</p>
								</div>
							)}

							{step === "notified" && (
								<div className="flex h-full w-full flex-col items-center justify-between py-4">
									{/* Locked Screen Wallpaper Details */}
									<div className="pt-2 text-center">
										<div className="font-bold text-2xl text-text-strong-950 dark:text-white/95">
											08:14
										</div>
										<div className="text-[9px] text-text-sub-600 dark:text-white/60">
											Tuesday, July 7
										</div>
									</div>

									{/* Animated Dropdown Push Notification Banner */}
									<motion.div
										initial={{ y: -60, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										onClick={openResetForm}
										className="flex w-full cursor-pointer flex-col gap-1 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/90 p-2.5 text-left shadow-lg transition-colors hover:border-orange-500/30 dark:border-white/10 dark:bg-slate-900/90 dark:shadow-2xl"
									>
										<div className="flex items-center justify-between">
											<span className="font-bold text-[9px] text-orange-600 dark:text-orange-400">
												Reloop Identity
											</span>
											<span className="text-[8px] text-text-soft-400 dark:text-white/30">
												now
											</span>
										</div>
										<p className="font-medium text-[10px] text-text-strong-950 dark:text-white">
											Reset your password
										</p>
										<p className="text-[9px] text-text-sub-600 dark:text-white/60">
											Click here to complete password update token verification.
										</p>
									</motion.div>

									<span className="mt-2 animate-pulse text-[8px] text-text-soft-400 dark:text-white/30">
										Tap notification to open
									</span>
								</div>
							)}

							{step === "form" && (
								<form
									onSubmit={submitNewPassword}
									className="flex w-full flex-col gap-2"
								>
									<h4 className="mb-1 text-center font-bold text-[11px] text-text-strong-950 dark:text-white/95">
										Set New Password
									</h4>

									<input
										type="password"
										placeholder="New Password"
										value={pass}
										onChange={(e) => setPass(e.target.value)}
										className="w-full rounded border border-stroke-soft-200 bg-bg-weak-50 px-2 py-1 text-[10px] text-text-strong-950 focus:border-orange-500/50 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
									/>
									<input
										type="password"
										placeholder="Confirm Password"
										value={confirm}
										onChange={(e) => setConfirm(e.target.value)}
										className="w-full rounded border border-stroke-soft-200 bg-bg-weak-50 px-2 py-1 text-[10px] text-text-strong-950 focus:border-orange-500/50 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
									/>

									{error && (
										<p className="text-center text-[8px] text-red-600 leading-normal dark:text-red-400">
											{error}
										</p>
									)}

									<button
										type="submit"
										className="w-full cursor-pointer rounded bg-orange-600 py-1 font-semibold text-[10px] text-white transition-colors hover:bg-orange-500"
									>
										Update Password
									</button>
								</form>
							)}

							{step === "done" && (
								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									className="flex flex-col items-center space-y-2 text-center"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-full border border-green-500/50 bg-green-500/20">
										<Icon
											name="check"
											className="h-5 w-5 text-green-600 dark:text-green-400"
										/>
									</div>
									<h4 className="font-bold text-[11px] text-text-strong-950 dark:text-white">
										Password Updated
									</h4>
									<p className="text-[9px] text-text-sub-600 leading-relaxed dark:text-white/50">
										Secure credentials successfully updated.
									</p>
								</motion.div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
