"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@reloop/ui/icon";

export default function PasswordResetWidget() {
	const [step, setStep] = useState<"idle" | "notified" | "form" | "done">("idle");
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
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans text-left items-center justify-center p-6">
			{/* Controls outside phone */}
			<div className="mb-4 w-full flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-white/5">
				<div>
					<span className="text-[10px] text-white/40 font-mono">AUTH TYPE</span>
					<div className="text-xs text-white/80 font-bold font-mono">Transactional JWT Drip</div>
				</div>
				{step === "idle" ? (
					<button
						onClick={requestReset}
						className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-lg shadow-orange-600/20 active:scale-95 transition-all cursor-pointer"
					>
						🔑 Request Reset Link
					</button>
				) : (
					<button
						onClick={resetAll}
						className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors cursor-pointer"
					>
						Reset Simulation
					</button>
				)}
			</div>

			{/* Smartphone Case Mockup */}
			<div className="relative w-[210px] h-[340px] border-[6px] border-slate-800 bg-slate-950 rounded-[28px] overflow-hidden shadow-xl ring-2 ring-white/10 flex flex-col justify-between">
				{/* Camera Notch */}
				<div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-800 rounded-full z-30 flex items-center justify-center">
					<div className="w-1.5 h-1.5 rounded-full bg-slate-900 ml-6" />
				</div>

				{/* Smartphone Screen Content */}
				<div className="flex-1 pt-6 pb-4 px-3 flex flex-col justify-between text-xs select-none">
					{/* Status Bar */}
					<div className="flex justify-between items-center text-[8px] text-white/50 px-1 font-mono">
						<span>08:14 AM</span>
						<div className="flex items-center gap-1">
							<Icon name="Wifi" className="w-2 h-2" />
							<Icon name="BatteryCharging" className="w-2.5 h-2.5" />
						</div>
					</div>

					{/* Step Screens */}
					<div className="flex-1 flex flex-col justify-center items-center relative mt-4">
						{step === "idle" && (
							<div className="text-center space-y-2">
								<Icon name="Lock" className="w-8 h-8 mx-auto text-white/20" />
								<p className="text-[10px] text-white/40">Waiting for trigger request...</p>
							</div>
						)}

						{step === "notified" && (
							<div className="w-full h-full flex flex-col justify-between py-4 items-center">
								{/* Locked Screen Wallpaper Details */}
								<div className="text-center pt-2">
									<div className="text-2xl font-bold text-white/95">08:14</div>
									<div className="text-[9px] text-white/60">Tuesday, July 7</div>
								</div>

								{/* Animated Dropdown Push Notification Banner */}
								<motion.div
									initial={{ y: -60, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									onClick={openResetForm}
									className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl shadow-2xl flex flex-col gap-1 w-full text-left cursor-pointer hover:border-orange-500/30 transition-colors"
								>
									<div className="flex justify-between items-center">
										<span className="font-bold text-[9px] text-orange-400">🛡️ Reloop Identity</span>
										<span className="text-[8px] text-white/30">now</span>
									</div>
									<p className="text-[10px] text-white font-medium">Reset your password</p>
									<p className="text-[9px] text-white/60">Click here to complete password update token verification.</p>
								</motion.div>

								<span className="text-[8px] text-white/30 animate-pulse mt-2">Tap notification to open</span>
							</div>
						)}

						{step === "form" && (
							<form onSubmit={submitNewPassword} className="w-full flex flex-col gap-2">
								<h4 className="text-[11px] font-bold text-white/95 text-center mb-1">Set New Password</h4>
								
								<input
									type="password"
									placeholder="New Password"
									value={pass}
									onChange={(e) => setPass(e.target.value)}
									className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-orange-500/50"
								/>
								<input
									type="password"
									placeholder="Confirm Password"
									value={confirm}
									onChange={(e) => setConfirm(e.target.value)}
									className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-orange-500/50"
								/>

								{error && <p className="text-[8px] text-red-400 text-center leading-normal">{error}</p>}

								<button
									type="submit"
									className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-1 rounded text-[10px] transition-colors cursor-pointer"
								>
									Update Password
								</button>
							</form>
						)}

						{step === "done" && (
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="text-center space-y-2 flex flex-col items-center"
							>
								<div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
									<Icon name="Check" className="w-5 h-5 text-green-400" />
								</div>
								<h4 className="text-[11px] font-bold text-white">Password Updated</h4>
								<p className="text-[9px] text-white/50 leading-relaxed">Secure credentials successfully updated.</p>
							</motion.div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
