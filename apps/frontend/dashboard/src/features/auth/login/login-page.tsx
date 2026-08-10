import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { type ReactNode, useCallback, useState } from "react";
import { AuthAside } from "#/features/auth/auth-aside";
import { AuthCard, AuthCardHeader } from "#/features/auth/auth-card";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell, authStepVariants } from "#/features/auth/auth-shell";
import { SocialLogin } from "#/features/auth/login/social-login";
import { useAuthStepDirection } from "#/features/auth/use-auth-step-direction";
import { useRedirectIfAuthenticated } from "#/features/auth/use-redirect-if-authenticated";
import { VerifyOTP } from "#/features/auth/verify-otp";

export function LoginPage() {
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

	const handleEditEmail = () => {
		void setOtpSentEmail(null);
		void setOtpValue("");
	};

	const currentLevel = otpSentEmail ? 1 : 0;
	const direction = useAuthStepDirection(currentLevel);
	const { shouldBlockAuthUi } = useRedirectIfAuthenticated(inviteId, redirectTo);

	// OTP step: card footer shows "Didn't receive a code?" instead of signup link.
	const [otpResendFooter, setOtpResendFooter] = useState<ReactNode>(null);
	const handleResendFooterChange = useCallback((footer: ReactNode | null) => {
		setOtpResendFooter(footer);
	}, []);

	if (shouldBlockAuthUi) {
		return <AuthSessionLoader />;
	}

	const signupFooter = (
		<>
			Don&apos;t have an account?{" "}
			<Link
				href={"/signup"}
				className={LinkButton.linkButtonVariants({
					variant: "primary",
				}).root({ className: "text-[13px]!" })}
			>
				Sign up
			</Link>
		</>
	);

	const cardFooter = otpSentEmail ? (otpResendFooter ?? null) : signupFooter;

	return (
		// Shell stays static; step animation lives inside the card only.
		<AuthShell direction={direction} aside={<AuthAside />} hideLogo>
			<AuthCard footer={cardFooter}>
				<AnimatePresence mode="wait" custom={direction} initial={false}>
					{otpSentEmail ? (
						<motion.div
							key="verify-otp"
							custom={direction}
							variants={authStepVariants}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
							className="space-y-6"
						>
							<AuthCardHeader
								title="Confirm your email"
								description={
									<>
										We sent a 6 digit code to{" "}
										<span className="inline-flex items-center gap-1 font-medium text-text-strong-950">
											{otpSentEmail}
											<button
												type="button"
												onClick={handleEditEmail}
												className="inline-flex shrink-0 items-center justify-center rounded-md p-0.5 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
												aria-label="Edit email"
											>
												<Icon name="pencil" className="size-3" />
											</button>
										</span>
									</>
								}
							/>
							<VerifyOTP
								email={otpSentEmail}
								mode="login"
								inviteId={inviteId}
								redirectTo={redirectTo}
								onResendFooterChange={handleResendFooterChange}
							/>
						</motion.div>
					) : (
						<motion.div
							key="social-login"
							custom={direction}
							variants={authStepVariants}
							initial={
								currentLevel === 0 && direction === -1 ? "initial" : false
							}
							animate="animate"
							exit="exit"
							transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
							className="space-y-6"
						>
							<AuthCardHeader
								title="Sign in to Reloop"
								description="Welcome back — continue where you left off"
							/>
							<SocialLogin inviteId={inviteId} redirectTo={redirectTo} />
						</motion.div>
					)}
				</AnimatePresence>
			</AuthCard>
		</AuthShell>
	);
}
