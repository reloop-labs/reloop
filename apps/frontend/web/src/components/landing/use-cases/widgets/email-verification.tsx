"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

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
		<div className="flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 text-left font-sans shadow-lg dark:border-white/10 dark:bg-slate-950 dark:shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3 dark:border-white/5 dark:bg-slate-900">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-violet-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-text-sub-600 text-xs dark:text-white/40">
						secure_magic_authenticator.json
					</span>
				</div>
				<span className="rounded border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-600 dark:text-violet-400">
					Identity OTP
				</span>
			</div>

			{/* Main Content Area */}
			<div className="flex flex-1 flex-col items-center justify-center p-5">
				<div className="flex w-full max-w-[280px] flex-col gap-4 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-5 text-center shadow-xl dark:border-white/5 dark:bg-slate-900">
					{step === "request" && (
						<>
							<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
								<Icon name="ShieldAlert" className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-bold text-text-strong-950 text-xs dark:text-white">
									Secure Verification
								</h3>
								<p className="mt-1 text-[10px] text-text-sub-600 dark:text-white/40">
									We'll send a 6-digit magic code to your email.
								</p>
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
									className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-center text-text-strong-950 text-xs focus:border-violet-500/50 focus:outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white"
								/>
								{error && (
									<p className="text-[9px] text-red-600 dark:text-red-400">
										{error}
									</p>
								)}
								<button
									onClick={sendCode}
									className="w-full cursor-pointer rounded-lg bg-violet-600 py-1.5 font-semibold text-white text-xs transition-colors hover:bg-violet-500"
								>
									Send Code
								</button>
							</div>
						</>
					)}

					{step === "verify" && (
						<>
							<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
								<Icon name="KeyRound" className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-bold text-text-strong-950 text-xs dark:text-white">
									Verify Account
								</h3>
								<p className="mt-1 text-[10px] text-text-sub-600 dark:text-white/40">
									Enter the 6-digit verification code sent below.
								</p>
							</div>

							<div className="flex flex-col gap-2">
								<input
									type="text"
									maxLength={6}
									value={otp}
									onChange={(e) => checkOtp(e.target.value)}
									placeholder="------"
									className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-center font-bold font-mono text-sm text-text-strong-950 tracking-widest focus:border-violet-500/50 focus:outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white"
								/>
								{error && (
									<p className="text-[9px] text-red-600 dark:text-red-400">
										{error}
									</p>
								)}
								<button
									onClick={() => setStep("request")}
									className="cursor-pointer font-mono text-[9px] text-text-sub-600 transition-colors hover:text-text-sub-600 dark:text-white/40 dark:hover:text-white/60"
								>
									← Go Back
								</button>
							</div>
						</>
					)}

					{step === "success" && (
						<>
							<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
								<Icon name="Check" className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-bold text-text-strong-950 text-xs dark:text-white">
									Identity Verified
								</h3>
								<p className="mt-1 text-[10px] text-text-sub-600 dark:text-white/40">
									Token confirmed. You have successfully authenticated.
								</p>
							</div>
							<button
								onClick={() => {
									setStep("request");
									setOtp("");
								}}
								className="w-full cursor-pointer rounded-lg bg-stroke-soft-200 py-1.5 font-medium text-text-strong-950 text-xs transition-colors hover:bg-stroke-sub-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
							>
								Test Again
							</button>
						</>
					)}
				</div>
			</div>

			{/* Mock Inbox Message Notification Area */}
			{step === "verify" && (
				<div className="flex flex-col gap-1.5 border-stroke-soft-200 border-t bg-bg-weak-50 p-3 dark:border-white/5 dark:bg-slate-900">
					<div className="font-mono text-[9px] text-text-soft-400 dark:text-white/30">
						SIMULATED RECIPIENT INBOX ({email})
					</div>
					<div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2.5 text-[10px] dark:border-white/5 dark:bg-slate-950">
						<div>
							<div className="font-bold text-text-strong-950 dark:text-white/80">
								🛡️ Reloop Verification System
							</div>
							<div className="mt-0.5 text-[9px] text-text-sub-600 dark:text-white/45">
								Your Reloop login code is:{" "}
								<strong className="font-mono text-violet-600 dark:text-violet-400">
									728109
								</strong>
							</div>
						</div>
						<span className="font-mono text-[8px] text-text-soft-400 dark:text-white/30">
							Just Now
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
