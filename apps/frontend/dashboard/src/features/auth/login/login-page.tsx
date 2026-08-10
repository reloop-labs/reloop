import { motion } from "framer-motion";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { AuthAside } from "#/features/auth/auth-aside";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell, authStepVariants } from "#/features/auth/auth-shell";
import { LoginForm } from "#/features/auth/login/login-form";
import { SocialLogin } from "#/features/auth/login/social-login";
import { useAuthStepDirection } from "#/features/auth/use-auth-step-direction";
import { useRedirectIfAuthenticated } from "#/features/auth/use-redirect-if-authenticated";
import { VerifyOTP } from "#/features/auth/verify-otp";

export function LoginPage() {
	const [showEmail, setShowEmail] = useQueryState(
		"email",
		parseAsBoolean.withDefault(false),
	);
	const [otpSentEmail, setOtpSentEmail] = useQueryState(
		"otpSent",
		parseAsString.withDefault(""),
	);
	const [, setOtpValue] = useQueryState("otp", parseAsString.withDefault(""));
	const [inviteIdQuery] = useQueryState(
		"inviteId",
		parseAsString.withDefault(""),
	);
	const [redirectToQuery] = useQueryState(
		"redirectTo",
		parseAsString.withDefault(""),
	);
	const [redirectQuery] = useQueryState(
		"redirect",
		parseAsString.withDefault(""),
	);
	const inviteId = inviteIdQuery || undefined;
	const redirectTo = redirectToQuery || redirectQuery || undefined;

	const currentLevel = otpSentEmail ? 2 : showEmail ? 1 : 0;
	const direction = useAuthStepDirection(currentLevel);
	const { shouldBlockAuthUi } = useRedirectIfAuthenticated(inviteId, redirectTo);

	if (shouldBlockAuthUi) {
		return <AuthSessionLoader />;
	}

	return (
		<AuthShell direction={direction} aside={<AuthAside />}>
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
							We&apos;ve sent you a temporary login otp.
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
						mode="login"
						inviteId={inviteId}
						redirectTo={redirectTo}
						onBack={() => {
							setOtpSentEmail(null);
							setOtpValue("");
						}}
					/>
				</motion.div>
			) : !showEmail ? (
				<motion.div
					key="social-login"
					custom={direction}
					variants={authStepVariants}
					animate="animate"
					initial={
						currentLevel === 0 && direction === -1 ? "initial" : undefined
					}
					exit="exit"
					transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
				>
					<div className="space-y-1 pb-6 text-center">
						<h2 className="font-medium text-label-lg text-text-strong-950">
							Login in to Reloop
						</h2>
					</div>
					<SocialLogin
						onContinueWithEmail={() => setShowEmail(true)}
						inviteId={inviteId}
						redirectTo={redirectTo}
					/>
				</motion.div>
			) : (
				<motion.div
					key="login-form"
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
					<div>
						<LoginForm />
						<div className="mt-4 flex justify-center">
							<button
								type="button"
								onClick={() => setShowEmail(false)}
								className="cursor-pointer text-center font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 hover:underline"
							>
								Back to login
							</button>
						</div>
					</div>
				</motion.div>
			)}
		</AuthShell>
	);
}
