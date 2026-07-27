import { motion } from "framer-motion";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell, authStepVariants } from "#/features/auth/auth-shell";
import { SignupForm } from "#/features/auth/signup/signup-form";
import { SocialSignup } from "#/features/auth/signup/social-signup";
import { useAuthStepDirection } from "#/features/auth/use-auth-step-direction";
import { useRedirectIfAuthenticated } from "#/features/auth/use-redirect-if-authenticated";
import { VerifyOTP } from "#/features/auth/verify-otp";

export function SignupPage() {
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
	const [inviteIdQuery] = useQueryState(
		"inviteId",
		parseAsString.withDefault(""),
	);
	const inviteId = inviteIdQuery || undefined;

	const currentLevel = otpSentEmail ? 2 : showEmail ? 1 : 0;
	const direction = useAuthStepDirection(currentLevel);
	const { shouldBlockAuthUi } = useRedirectIfAuthenticated(inviteId);

	if (shouldBlockAuthUi) {
		return <AuthSessionLoader />;
	}

	return (
		<AuthShell direction={direction}>
			{otpSentEmail ? (
				<motion.div
					key="verify-otp"
					custom={direction}
					variants={authStepVariants}
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
							We&apos;ve sent you a temporary signup otp.
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
						mode="signup"
						inviteId={inviteId}
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
					variants={authStepVariants}
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
						inviteId={inviteId}
					/>
				</motion.div>
			) : (
				<motion.div
					key="signup-form"
					custom={direction}
					variants={authStepVariants}
					initial="initial"
					animate="animate"
					exit="exit"
					transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
				>
					<div className="space-y-1 pb-6 text-center">
						<h2 className="font-medium text-label-lg text-text-strong-950">
							What&apos;s your email address?
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
		</AuthShell>
	);
}
