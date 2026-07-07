"use client";

import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
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
		<div className="flex h-full min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-6 text-left font-sans shadow-2xl">
			{/* Controls outside phone */}
			<div className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-3">
				<div>
					<span className="font-mono text-[10px] text-white/40">AUTH TYPE</span>
					<div className="font-bold font-mono text-white/80 text-xs">
						Transactional JWT Drip
					</div>
				</div>
				{step === "idle" ? (
					<button
						onClick={requestReset}
						className="cursor-pointer rounded-lg bg-orange-600 px-4 py-2 font-medium text-white text-xs shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-500 active:scale-95"
					>
						🔑 Request Reset Link
					</button>
				) : (
					<button
						onClick={resetAll}
						className="cursor-pointer rounded bg-slate-800 px-3 py-1.5 text-white text-xs transition-colors hover:bg-slate-700"
					>
						Reset Simulation
					</button>
				)}
			</div>

			{/* Smartphone Case Mockup */}
			<div className="relative flex h-[340px] w-[210px] flex-col justify-between overflow-hidden rounded-[28px] border-[6px] border-slate-800 bg-slate-950 shadow-xl ring-2 ring-white/10">
				{/* Camera Notch */}
				<div className="-translate-x-1/2 absolute top-1.5 left-1/2 z-30 flex h-3.5 w-16 items-center justify-center rounded-full bg-slate-800">
					<div className="ml-6 h-1.5 w-1.5 rounded-full bg-slate-900" />
				</div>

				{/* Smartphone Screen Content */}
				<div className="flex flex-1 select-none flex-col justify-between px-3 pt-6 pb-4 text-xs">
					{/* Status Bar */}
					<div className="flex items-center justify-between px-1 font-mono text-[8px] text-white/50">
						<span>08:14 AM</span>
						<div className="flex items-center gap-1">
							<Icon name="Wifi" className="h-2 w-2" />
							<Icon name="BatteryCharging" className="h-2.5 w-2.5" />
						</div>
					</div>

					{/* Step Screens */}
					<div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
						{step === "idle" && (
							<div className="space-y-2 text-center">
								<Icon name="Lock" className="mx-auto h-8 w-8 text-white/20" />
								<p className="text-[10px] text-white/40">
									Waiting for trigger request...
								</p>
							</div>
						)}

						{step === "notified" && (
							<div className="flex h-full w-full flex-col items-center justify-between py-4">
								{/* Locked Screen Wallpaper Details */}
								<div className="pt-2 text-center">
									<div className="font-bold text-2xl text-white/95">08:14</div>
									<div className="text-[9px] text-white/60">
										Tuesday, July 7
									</div>
								</div>

								{/* Animated Dropdown Push Notification Banner */}
								<motion.div
									initial={{ y: -60, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									onClick={openResetForm}
									className="flex w-full cursor-pointer flex-col gap-1 rounded-xl border border-white/10 bg-slate-900/90 p-2.5 text-left shadow-2xl transition-colors hover:border-orange-500/30"
								>
									<div className="flex items-center justify-between">
										<span className="font-bold text-[9px] text-orange-400">
											🛡️ Reloop Identity
										</span>
										<span className="text-[8px] text-white/30">now</span>
									</div>
									<p className="font-medium text-[10px] text-white">
										Reset your password
									</p>
									<p className="text-[9px] text-white/60">
										Click here to complete password update token verification.
									</p>
								</motion.div>

								<span className="mt-2 animate-pulse text-[8px] text-white/30">
									Tap notification to open
								</span>
							</div>
						)}

						{step === "form" && (
							<form
								onSubmit={submitNewPassword}
								className="flex w-full flex-col gap-2"
							>
								<h4 className="mb-1 text-center font-bold text-[11px] text-white/95">
									Set New Password
								</h4>

								<input
									type="password"
									placeholder="New Password"
									value={pass}
									onChange={(e) => setPass(e.target.value)}
									className="w-full rounded border border-white/10 bg-slate-900 px-2 py-1 text-[10px] text-white focus:border-orange-500/50 focus:outline-none"
								/>
								<input
									type="password"
									placeholder="Confirm Password"
									value={confirm}
									onChange={(e) => setConfirm(e.target.value)}
									className="w-full rounded border border-white/10 bg-slate-900 px-2 py-1 text-[10px] text-white focus:border-orange-500/50 focus:outline-none"
								/>

								{error && (
									<p className="text-center text-[8px] text-red-400 leading-normal">
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
									<Icon name="Check" className="h-5 w-5 text-green-400" />
								</div>
								<h4 className="font-bold text-[11px] text-white">
									Password Updated
								</h4>
								<p className="text-[9px] text-white/50 leading-relaxed">
									Secure credentials successfully updated.
								</p>
							</motion.div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
