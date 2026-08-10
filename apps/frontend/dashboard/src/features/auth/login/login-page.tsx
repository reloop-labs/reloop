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
import { LOGIN_EMAIL_FORM_ID } from "#/features/auth/login/login-form";
import { SocialLogin } from "#/features/auth/login/social-login";
import { useAuthStepDirection } from "#/features/auth/use-auth-step-direction";
import { useRedirectIfAuthenticated } from "#/features/auth/use-redirect-if-authenticated";
import {
	type VerifyOtpUiState,
	VerifyOTP,
} from "#/features/auth/verify-otp";

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

	const [otpResendFooter, setOtpResendFooter] = useState<ReactNode>(null);
	const handleResendFooterChange = useCallback((footer: ReactNode | null) => {
		if (footer != null) setOtpResendFooter(footer);
	}, []);

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

	const otpFooterPlaceholder = (
		<>
			Didn&apos;t receive a code?{" "}
			<span className="text-text-soft-400">Resend in 60s</span>
		</>
	);

	const isOtpStep = Boolean(otpSentEmail);
	const cardFooter = isOtpStep
		? (otpResendFooter ?? otpFooterPlaceholder)
		: signupFooter;
	const cardFooterKey = isOtpStep ? "otp-resend" : "signup-link";

	const ctaLoading = isOtpStep ? otpUi.isLoading : emailLoading;
	const ctaSuccess = isOtpStep && otpUi.isSuccess;
	const ctaDisabled = isOtpStep
		? (!otpUi.canSubmit && !otpUi.isSuccess) || otpUi.isLoading
		: !emailCanSubmit || emailLoading;

	return (
		<AuthShell direction={direction} aside={<AuthAside />} hideLogo>
			<AuthCard footer={cardFooter} footerKey={cardFooterKey}>
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
									mode="login"
									inviteId={inviteId}
									redirectTo={redirectTo}
									onResendFooterChange={handleResendFooterChange}
									onUiStateChange={setOtpUi}
									registerVerify={registerVerify}
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
								transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
								className="w-full space-y-6"
							>
								<AuthCardHeader
									title="Sign in to Reloop"
									description="Welcome back — continue where you left off"
								/>
								<SocialLogin
									inviteId={inviteId}
									redirectTo={redirectTo}
									onEmailCanSubmitChange={setEmailCanSubmit}
									onEmailLoadingChange={setEmailLoading}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* One primary button for both steps */}
				<div className="mt-6">
					<FancyButton.Root
						type={isOtpStep ? "button" : "submit"}
						form={isOtpStep ? undefined : LOGIN_EMAIL_FORM_ID}
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
											? "Signing in…"
											: "Sign in"}
								</span>
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</AuthCard>
		</AuthShell>
	);
}
