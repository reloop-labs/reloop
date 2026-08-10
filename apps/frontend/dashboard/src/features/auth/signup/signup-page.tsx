import * as LinkButton from "@reloop/ui/link-button";
import { motion } from "framer-motion";
import Link from "next/link";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { AuthAside } from "#/features/auth/auth-aside";
import { AuthCard } from "#/features/auth/auth-card";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell, authStepVariants } from "#/features/auth/auth-shell";
import { SocialSignup } from "#/features/auth/signup/social-signup";
import { useAuthStepDirection } from "#/features/auth/use-auth-step-direction";
import { useRedirectIfAuthenticated } from "#/features/auth/use-redirect-if-authenticated";
import { VerifyOTP } from "#/features/auth/verify-otp";

export function SignupPage() {
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

	const currentLevel = otpSentEmail ? 1 : 0;
	const direction = useAuthStepDirection(currentLevel);
	const { shouldBlockAuthUi } = useRedirectIfAuthenticated(inviteId);

	if (shouldBlockAuthUi) {
		return <AuthSessionLoader />;
	}

	const loginFooter = (
		<>
			Already have an account?{" "}
			<Link
				href={"/login"}
				className={LinkButton.linkButtonVariants({
					variant: "black",
				}).root({ className: "text-[13px]!" })}
			>
				Login
			</Link>
		</>
	);

	return (
		<AuthShell direction={direction} aside={<AuthAside />} hideLogo>
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
					<AuthCard
						title="Check your email"
						description={
							<>
								We&apos;ve sent you a temporary signup otp. Please check your
								inbox at{" "}
								<span className="font-medium text-text-strong-950">
									{otpSentEmail}
								</span>
								.
							</>
						}
						footer={loginFooter}
					>
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
					</AuthCard>
				</motion.div>
			) : (
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
					<AuthCard
						title="Create your Account"
						description="Sign up and start sending email"
						footer={loginFooter}
					>
						<SocialSignup inviteId={inviteId} />
					</AuthCard>
				</motion.div>
			)}
		</AuthShell>
	);
}
