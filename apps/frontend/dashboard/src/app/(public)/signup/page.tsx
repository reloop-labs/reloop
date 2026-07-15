"use client";
import { Loader } from "@dot-loaders/react";
import { resolvePostAuthDestination } from "@fe/dashboard/utils/post-auth-destination";
import { authClient } from "@reloop/auth/client";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import { SignupForm } from "./signup-form";
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
	// Organization Invitation deep link (not platform signup codes).
	const [inviteId] = useQueryState("inviteId", parseAsString.withDefault(""));

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
		if (!session) return;
		let cancelled = false;
		void (async () => {
			const destination = await resolvePostAuthDestination({
				inviteId: inviteId || null,
			});
			if (!cancelled) router.push(destination);
		})();
		return () => {
			cancelled = true;
		};
	}, [session, router, inviteId]);

	// Match the dashboard pulse loader while session is unknown or a signed-in
	// user is being routed (onboarding / invite / home). Never flash the form.
	const isSessionLoading = isPending && session === undefined;
	const isRedirecting = Boolean(session);
	if (isSessionLoading || isRedirecting) {
		return (
			<div className="flex h-dvh w-full items-center justify-center text-text-strong-950 dark:text-white">
				<Loader loader="pulse" />
			</div>
		);
	}

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

					{otpSentEmail ? (
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
								inviteId={inviteId || undefined}
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
							</div>
							<SocialSignup
								onContinueWithEmail={() => setShowEmail(true)}
								inviteId={inviteId || undefined}
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
								<SignupForm />
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
