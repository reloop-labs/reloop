"use client";
import { authClient } from "@reloop/auth/client";
import { Logo } from "@reloop/ui/logo";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { SignupForm } from "./signup-form";
import {
	fetchSignupInviteStatus,
	validateSignupInviteCode,
} from "./signup-invite";
import { SignupInviteGate } from "./signup-invite-gate";
import { SocialSignup } from "./social-signup";
import { VerifyOTP } from "./verify-otp";

const variants = {
	initial: (direction: number) => ({
		opacity: 0,
		transform: `translateX(${direction > 0 ? 20 : -20}px)`,
	}),
	animate: {
		opacity: 1,
		transform: "translateX(0px)",
	},
	exit: (direction: number) => ({
		opacity: 0,
		transform: `translateX(${direction > 0 ? -20 : 20}px)`,
	}),
};

const Page = () => {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [showEmail, setShowEmail] = useQueryState(
		"email",
		parseAsBoolean.withDefault(false),
	);
	const [otpSentEmail, setOtpSentEmail] = useQueryState(
		"otpSent",
		parseAsString.withDefault(""),
	);
	const [, setEnterCode] = useQueryState(
		"enterCode",
		parseAsBoolean.withDefault(false),
	);
	const [, setOtpValue] = useQueryState("otp", parseAsString.withDefault(""));
	const [inviteId] = useQueryState("inviteId", parseAsString.withDefault(""));
	const [inviteCode, setInviteCode] = useQueryState(
		"inviteCode",
		parseAsString.withDefault(""),
	);

	const [inviteRequired, setInviteRequired] = useState<boolean | null>(null);
	const [inviteEmail, setInviteEmail] = useState<string | null>(null);
	const [inviteReady, setInviteReady] = useState(false);
	const [inviteError, setInviteError] = useState<string | null>(null);

	const currentLevel = otpSentEmail ? 2 : showEmail ? 1 : 0;
	const prevLevel = useRef(currentLevel);
	const prevDirection = useRef(1);
	let direction = prevDirection.current;
	if (currentLevel !== prevLevel.current) {
		direction = currentLevel > prevLevel.current ? 1 : -1;
	}
	useEffect(() => {
		prevLevel.current = currentLevel;
		prevDirection.current = direction;
	}, [currentLevel, direction]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const status = await fetchSignupInviteStatus();
			if (cancelled) return;
			setInviteRequired(status.required);

			if (!status.required || inviteId) {
				setInviteReady(true);
				return;
			}

			if (inviteCode) {
				const result = await validateSignupInviteCode(inviteCode);
				if (cancelled) return;
				if (result.valid && result.email && result.code) {
					setInviteEmail(result.email);
					setInviteCode(result.code);
					setInviteReady(true);
					setInviteError(null);
				} else {
					setInviteError(result.message || "Invalid or expired invite code");
					setInviteReady(false);
				}
			} else {
				setInviteReady(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [inviteCode, inviteId, setInviteCode]);

	useEffect(() => {
		if (session) {
			if (inviteId) {
				router.push(`/invite?id=${inviteId}`);
			} else {
				router.push("/");
			}
		}
	}, [session, router, inviteId]);

	if (isPending && session === undefined) {
		return (
			<div className="flex h-dvh flex-col items-center justify-center">
				<div className="w-full max-w-sm p-5 md:p-8">
					<div className="flex flex-col items-center justify-center gap-2">
						<div className="mb-2 flex items-center justify-center">
							<Logo className="h-16" />
						</div>
					</div>
					<div>
						<div className="space-y-1 pb-5 text-center">
							<h2 className="font-medium text-label-lg text-text-strong-950">
								We are getting things ready...
							</h2>
						</div>
						<div className="w-full space-y-3">
							<Skeleton className="h-11 w-full rounded-2xl!" />
							<Skeleton className="h-11 w-full rounded-2xl!" />
							<Skeleton className="h-11 w-full rounded-2xl!" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (inviteRequired === null) {
		return (
			<div className="flex h-dvh flex-col items-center justify-center">
				<div className="w-full max-w-sm p-5 md:p-8">
					<div className="mb-2 flex items-center justify-center">
						<Logo className="h-16" />
					</div>
					<Skeleton className="mx-auto h-11 w-full rounded-2xl!" />
				</div>
			</div>
		);
	}

	const showInviteGate = inviteRequired && !inviteReady;

	return (
		<div className="flex h-dvh flex-col items-center justify-center">
			<AnimatePresence mode="wait" custom={direction}>
				<div className="w-full max-w-sm p-5 md:p-8">
					<motion.div
						layout
						className="flex flex-col items-center justify-center gap-2"
					>
						<div className="mb-2 flex items-center justify-center">
							<Logo className="h-16" />
						</div>
					</motion.div>

					{showInviteGate ? (
						<SignupInviteGate
							onValidated={({ email, code }) => {
								setInviteEmail(email);
								setInviteCode(code);
								setInviteReady(true);
								setInviteError(null);
							}}
						/>
					) : otpSentEmail ? (
						<motion.div
							key="verify-otp"
							custom={direction}
							variants={variants}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
						>
							<div className="space-y-1 pb-6 text-center">
								<h2 className="font-medium text-label-lg text-text-strong-950">
									Check your email
								</h2>
								<p className="mt-2 text-center text-[13px] text-text-sub-600">
									We’ve sent you a temporary signup otp.
									<br />
									Please check your inbox at
									<br />
									<span className="font-medium text-text-strong-950">
										{otpSentEmail}
									</span>
									.
								</p>
							</div>
							<VerifyOTP
								email={otpSentEmail}
								onBack={() => {
									setOtpSentEmail(null);
									setEnterCode(null);
									setOtpValue("");
								}}
							/>
						</motion.div>
					) : !showEmail ? (
						<motion.div
							key="social-signup"
							custom={direction}
							variants={variants}
							initial={
								currentLevel === 0 && direction === -1 ? "initial" : undefined
							}
							animate="animate"
							exit="exit"
							transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
						>
							<div className="space-y-1 pb-6 text-center">
								<h2 className="font-medium text-label-lg text-text-strong-950">
									Create your workspace
								</h2>
								{inviteEmail && (
									<p className="text-[13px] text-text-sub-600">
										Invited as{" "}
										<span className="font-medium text-text-strong-950">
											{inviteEmail}
										</span>
									</p>
								)}
								{inviteError && (
									<p className="text-[13px] text-error-base">{inviteError}</p>
								)}
							</div>
							<SocialSignup
								onContinueWithEmail={() => setShowEmail(true)}
								inviteId={inviteId || undefined}
								inviteCode={inviteCode || undefined}
								lockedEmail={inviteEmail || undefined}
							/>
						</motion.div>
					) : (
						<motion.div
							key="signup-form"
							custom={direction}
							variants={variants}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
						>
							<div className="space-y-1 pb-6 text-center">
								<h2 className="font-medium text-label-lg text-text-strong-950">
									What’s your email address?
								</h2>
							</div>
							<div className="flex flex-col gap-4">
								<SignupForm lockedEmail={inviteEmail || undefined} />
								<div className="flex justify-center">
									<button
										type="button"
										onClick={() => setShowEmail(false)}
										className="cursor-pointer text-center font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 hover:underline"
									>
										Back to signup
									</button>
								</div>
							</div>
						</motion.div>
					)}
				</div>
			</AnimatePresence>
		</div>
	);
};

export default Page;
