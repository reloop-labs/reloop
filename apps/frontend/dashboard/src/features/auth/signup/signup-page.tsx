import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { AuthAside } from "#/features/auth/auth-aside";
import { AuthCard, AuthCardHeader } from "#/features/auth/auth-card";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell, authStepVariants } from "#/features/auth/auth-shell";
import { SIGNUP_EMAIL_FORM_ID } from "#/features/auth/signup/signup-form";
import { SocialSignup } from "#/features/auth/signup/social-signup";
import { useAuthStepDirection } from "#/features/auth/use-auth-step-direction";
import { useRedirectIfAuthenticated } from "#/features/auth/use-redirect-if-authenticated";
import {
	type VerifyOtpUiState,
	VerifyOTP,
} from "#/features/auth/verify-otp";

export function SignupPage() {
	const [otpSentEmail, setOtpSentEmail] = useQueryState(
		"otpSent",
		parseAsString.withDefault(""),
	);
	const [, setOtpValue] = useQueryState("otp", parseAsString.withDefault(""));
	const [inviteIdQuery] = useQueryState(
		"inviteId",
		parseAsString.withDefault(""),
	);
	const inviteId = inviteIdQuery || undefined;

	const handleEditEmail = () => {
		void setOtpSentEmail(null);
		void setOtpValue("");
	};

	const currentLevel = otpSentEmail ? 1 : 0;
	const direction = useAuthStepDirection(currentLevel);
	const { shouldBlockAuthUi } = useRedirectIfAuthenticated(inviteId);

	// OTP step: card footer shows "Didn't receive a code?" instead of login link.
	const [otpResendFooter, setOtpResendFooter] = useState<ReactNode>(null);
	const handleResendFooterChange = useCallback((footer: ReactNode | null) => {
		setOtpResendFooter(footer);
	}, []);

	// Shared primary CTA state (one button for email send + OTP confirm).
	const [emailCanSubmit, setEmailCanSubmit] = useState(false);
	const [emailLoading, setEmailLoading] = useState(false);
	const [otpUi, setOtpUi] = useState<VerifyOtpUiState>({
		canSubmit: false,
		isLoading: false,
		isSuccess: false,
	});
	const verifyOtpRef = useRef<(() => void) | null>(null);
	const registerVerify = useCallback((fn: (() => void) | null) => {
		verifyOtpRef.current = fn;
	}, []);

	if (shouldBlockAuthUi) {
		return <AuthSessionLoader />;
	}

	const loginFooter = (
		<>
			Already have an account?{" "}
			<Link
				href={"/login"}
				className={LinkButton.linkButtonVariants({
					variant: "primary",
				}).root({ className: "text-[13px]!" })}
			>
				Login
			</Link>
		</>
	);

	const isOtpStep = Boolean(otpSentEmail);
	const cardFooter = isOtpStep ? (otpResendFooter ?? null) : loginFooter;

	const ctaLoading = isOtpStep ? otpUi.isLoading : emailLoading;
	const ctaSuccess = isOtpStep && otpUi.isSuccess;
	const ctaDisabled = isOtpStep
		? (!otpUi.canSubmit && !otpUi.isSuccess) || otpUi.isLoading
		: !emailCanSubmit || emailLoading;

	return (
		// Shell stays static; step animation lives inside the card only.
		<AuthShell direction={direction} aside={<AuthAside />} hideLogo>
			<AuthCard footer={cardFooter}>
				{/* relative + sync exit so card height can tween without collapsing to 0 */}
				<div className="relative">
					<AnimatePresence mode="sync" custom={direction} initial={false}>
						{isOtpStep ? (
							<motion.div
								key="verify-otp"
								custom={direction}
								variants={authStepVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
								className="w-full space-y-6"
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
									mode="signup"
									inviteId={inviteId}
									onResendFooterChange={handleResendFooterChange}
									onUiStateChange={setOtpUi}
									registerVerify={registerVerify}
								/>
							</motion.div>
						) : (
							<motion.div
								key="social-signup"
								custom={direction}
								variants={authStepVariants}
								initial={
									currentLevel === 0 && direction === -1 ? "initial" : false
								}
								animate="animate"
								exit="exit"
								transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
								className="w-full space-y-6"
							>
								<AuthCardHeader
									title="Create an account"
									description={
										<>
											By creating an account, you agree to our{" "}
											<a
												href="/terms-and-conditions"
												className={LinkButton.linkButtonVariants({
													variant: "black",
												}).root({ className: "text-sm!" })}
											>
												Terms of Service
											</a>{" "}
											and{" "}
											<a
												href="/privacy"
												className={LinkButton.linkButtonVariants({
													variant: "black",
												}).root({ className: "text-sm!" })}
											>
												Privacy Policy
											</a>
										</>
									}
								/>
								<SocialSignup
									inviteId={inviteId}
									onEmailCanSubmitChange={setEmailCanSubmit}
									onEmailLoadingChange={setEmailLoading}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* One primary button for both steps — outside AnimatePresence so it stays put */}
				<div className="mt-6">
					<FancyButton.Root
						type={isOtpStep ? "button" : "submit"}
						form={isOtpStep ? undefined : SIGNUP_EMAIL_FORM_ID}
						variant="blue"
						size="medium"
						disabled={ctaDisabled}
						className="h-11 w-full justify-center gap-2 overflow-hidden rounded-xl font-medium text-sm"
						onClick={() => {
							if (!isOtpStep || ctaSuccess || ctaLoading) return;
							verifyOtpRef.current?.();
						}}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={
									ctaSuccess
										? "success"
										: ctaLoading
											? "loading"
											: "idle"
								}
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="flex items-center justify-center gap-1.5"
							>
								{ctaLoading && <Spinner size={14} color="currentColor" />}
								{ctaSuccess && (
									<Icon name="check-circle" className="h-4 w-4 shrink-0" />
								)}
								<span>
									{ctaSuccess
										? "Verified successfully!"
										: ctaLoading
											? isOtpStep
												? "Creating…"
												: "Creating…"
											: "Create account"}
								</span>
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</AuthCard>
		</AuthShell>
	);
}
