"use client";

import { useState } from "react";
import { Icon } from "@reloop/ui/icon";

export default function EmailVerificationWidget() {
	const [email, setEmail] = useState("user@company.com");
	const [step, setStep] = useState<"request" | "verify" | "success">("request");
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");

	const sendCode = () => {
		if (!email || !email.includes("@")) {
			setError("Please enter a valid email address.");
			return;
		}
		setError("");
		setStep("verify");
	};

	const checkOtp = (val: string) => {
		setOtp(val);
		setError("");
		if (val === "728109") {
			setStep("success");
		} else if (val.length === 6) {
			setError("Incorrect code. Try entering 728109.");
		}
	};

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans text-left justify-between">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-violet-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">secure_magic_authenticator.json</span>
				</div>
				<span className="text-[10px] text-violet-400 font-mono bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
					Identity OTP
				</span>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 p-5 flex flex-col justify-center items-center">
				<div className="w-full max-w-[280px] bg-slate-900 border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col gap-4 text-center">
					{step === "request" && (
						<>
							<div className="mx-auto w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400">
								<Icon name="ShieldAlert" className="w-5 h-5" />
							</div>
							<div>
								<h3 className="text-xs font-bold text-white">Secure Verification</h3>
								<p className="text-[10px] text-white/40 mt-1">We'll send a 6-digit magic code to your email.</p>
							</div>

							<div className="flex flex-col gap-2">
								<input
									type="email"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										setError("");
									}}
									placeholder="enter email address"
									className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white text-center focus:outline-none focus:border-violet-500/50"
								/>
								{error && <p className="text-[9px] text-red-400">{error}</p>}
								<button
									onClick={sendCode}
									className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
								>
									Send Code
								</button>
							</div>
						</>
					)}

					{step === "verify" && (
						<>
							<div className="mx-auto w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400">
								<Icon name="KeyRound" className="w-5 h-5" />
							</div>
							<div>
								<h3 className="text-xs font-bold text-white">Verify Account</h3>
								<p className="text-[10px] text-white/40 mt-1">Enter the 6-digit verification code sent below.</p>
							</div>

							<div className="flex flex-col gap-2">
								<input
									type="text"
									maxLength={6}
									value={otp}
									onChange={(e) => checkOtp(e.target.value)}
									placeholder="------"
									className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white tracking-widest text-center focus:outline-none focus:border-violet-500/50 font-mono font-bold"
								/>
								{error && <p className="text-[9px] text-red-400">{error}</p>}
								<button
									onClick={() => setStep("request")}
									className="text-[9px] text-white/40 hover:text-white/60 transition-colors font-mono cursor-pointer"
								>
									← Go Back
								</button>
							</div>
						</>
					)}

					{step === "success" && (
						<>
							<div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 text-emerald-400">
								<Icon name="Check" className="w-5 h-5" />
							</div>
							<div>
								<h3 className="text-xs font-bold text-white">Identity Verified</h3>
								<p className="text-[10px] text-white/40 mt-1">Token confirmed. You have successfully authenticated.</p>
							</div>
							<button
								onClick={() => {
									setStep("request");
									setOtp("");
								}}
								className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
							>
								Test Again
							</button>
						</>
					)}
				</div>
			</div>

			{/* Mock Inbox Message Notification Area */}
			{step === "verify" && (
				<div className="p-3 bg-slate-900 border-t border-white/5 flex flex-col gap-1.5">
					<div className="text-[9px] text-white/30 font-mono">SIMULATED RECIPIENT INBOX ({email})</div>
					<div className="bg-slate-950 p-2.5 rounded-lg border border-white/5 flex justify-between items-center text-[10px]">
						<div>
							<div className="font-bold text-white/80">🛡️ Reloop Verification System</div>
							<div className="text-[9px] text-white/45 mt-0.5">Your Reloop login code is: <strong className="text-violet-400 font-mono">728109</strong></div>
						</div>
						<span className="text-[8px] text-white/30 font-mono">Just Now</span>
					</div>
				</div>
			)}
		</div>
	);
}
