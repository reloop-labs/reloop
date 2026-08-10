import { authClient } from "@reloop/auth/client";
import * as DigitInput from "@reloop/ui/digit-input";
import * as LinkButton from "@reloop/ui/link-button";
import { useLoading } from "@reloop/ui/use-loading";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import {
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { sessionQueryOptions } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";
import {
	getRateLimitInfo,
	showRateLimitCountdownToast,
	toastApiError,
} from "#/lib/rate-limit-toast";
import { navigatePostAuth } from "#/utils/navigate-post-auth";
import { resolvePostAuthDestinationWithQuery } from "#/utils/post-auth-destination";

/** Matches Better Auth emailOTP send rate-limit window (3 / 60s). */
const OTP_RESEND_COOLDOWN_SECONDS = 60;

export type VerifyOtpUiState = {
	canSubmit: boolean;
	isLoading: boolean;
	isSuccess: boolean;
};

export function VerifyOTP({
	email,
	onBack,
	inviteId,
	redirectTo,
	mode = "login",
	onResendFooterChange,
	showBack = false,
	/** When set, primary CTA is owned by the page — wire verify + disabled state. */
	onUiStateChange,
	registerVerify,
}: {
	email: string;
	onBack?: () => void;
	/** Organization invitation id preserved through email OTP auth. */
	inviteId?: string;
	redirectTo?: string;
	mode?: "login" | "signup";
	onResendFooterChange?: (footer: ReactNode | null) => void;
	showBack?: boolean;
	onUiStateChange?: (state: VerifyOtpUiState) => void;
	/** Parent stores this and calls it from the shared primary button. */
	registerVerify?: (verify: (() => void) | null) => void;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const [otpValue, setOtpValue] = useQueryState(
		"otp",
		parseAsString.withDefault(""),
	);
	const { changeStatus, status } = useLoading();
	const [error, setError] = useState<{
		name: "google" | "github" | "email";
		error: string | null;
	}>({ name: "email", error: null });
	const [isSuccess, setIsSuccess] = useState(false);
	const [isResending, setIsResending] = useState(false);
	// OTP was just sent from login/signup — start cooldown immediately.
	const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_COOLDOWN_SECONDS);

	useEffect(() => {
		if (secondsLeft <= 0) return;
		const id = setTimeout(() => {
			setSecondsLeft((current) => Math.max(0, current - 1));
		}, 1000);
		return () => clearTimeout(id);
	}, [secondsLeft]);

	const handleVerify = async (otpToVerify: string) => {
		if (otpToVerify.length !== 6 || status === "loading" || isSuccess) return;
		try {
			changeStatus("loading");
			const { data, error: verifyError } = await authClient.signIn.emailOtp({
				email: email,
				otp: otpToVerify,
			});
			if (data?.user.id) {
				setIsSuccess(true);
				changeStatus("idle");
				// Refresh TanStack Query session cache after OTP sign-in.
				await queryClient.invalidateQueries({
					queryKey: queryKeys.auth.session(),
				});
				await queryClient.ensureQueryData(sessionQueryOptions());
				await queryClient.invalidateQueries({
					queryKey: queryKeys.auth.organizations(),
				});
				await queryClient.invalidateQueries({
					queryKey: queryKeys.auth.userInvitations(),
				});
				const destination = await resolvePostAuthDestinationWithQuery(
					queryClient,
					{ inviteId: inviteId || null, redirectTo: redirectTo || null },
				);
				timeoutRef.current = setTimeout(() => {
					void navigatePostAuth(router, destination);
				}, 2000);
			} else {
				changeStatus("idle");
				setError({
					name: "email",
					error:
						verifyError?.message ||
						"Invalid verification code. Please try again.",
				});
			}
		} catch {
			changeStatus("idle");
			setError({
				name: "email",
				error: "An error occurred during verification. Please try again.",
			});
		}
	};

	const handleResend = async () => {
		if (secondsLeft > 0 || isResending || isSuccess) return;

		setIsResending(true);
		setError({ name: "email", error: null });
		try {
			const { error: resendError } =
				await authClient.emailOtp.sendVerificationOtp({
					email,
					type: "sign-in",
				});

			if (resendError) {
				const info = getRateLimitInfo(resendError);
				if (info) {
					setSecondsLeft(info.retryAfter);
					showRateLimitCountdownToast(info);
				} else {
					toastApiError(resendError, "Could not resend the code.");
				}
				return;
			}

			setOtpValue("");
			setIsSuccess(false);
			setSecondsLeft(OTP_RESEND_COOLDOWN_SECONDS);
			toast.success("A new code was sent to your email.");
		} catch {
			toast.error("Could not resend the code. Please try again.");
		} finally {
			setIsResending(false);
		}
	};

	const canResend = secondsLeft <= 0 && !isResending && !isSuccess;
	const canSubmit = otpValue.length === 6 && status !== "loading";
	const isLoading = status === "loading";

	// Keep parent CTA in sync (shared Create account / Sign in button).
	useEffect(() => {
		onUiStateChange?.({
			canSubmit: canSubmit || isSuccess,
			isLoading,
			isSuccess,
		});
	}, [canSubmit, isLoading, isSuccess, onUiStateChange]);

	useEffect(() => {
		const run = () => {
			void handleVerify(otpValue);
		};
		registerVerify?.(run);
		return () => registerVerify?.(null);
		// otpValue must be current when parent clicks the shared button.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- register stable wrapper
	}, [otpValue, registerVerify, status, isSuccess]);

	const resendLine = isSuccess ? null : isResending ? (
		"Sending a new code…"
	) : canResend ? (
		<>
			Didn&apos;t receive a code?{" "}
			<button
				type="button"
				onClick={() => void handleResend()}
				className={LinkButton.linkButtonVariants({
					variant: "primary",
				}).root({
					className: "cursor-pointer font-medium! text-[13px]!",
				})}
			>
				Resend
			</button>
		</>
	) : (
		<>
			Didn&apos;t receive a code?{" "}
			<span className="text-text-soft-400">Resend in {secondsLeft}s</span>
		</>
	);

	// Push resend into AuthCard footer when requested; clear on unmount.
	useLayoutEffect(() => {
		if (!onResendFooterChange) return;
		onResendFooterChange(resendLine);
		return () => onResendFooterChange(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
	}, [onResendFooterChange, isSuccess, isResending, canResend, secondsLeft]);

	return (
		<div className="flex flex-col gap-5">
			{/* Six equal digit boxes — left-aligned */}
			<div className="flex w-full flex-col items-start">
				<DigitInput.Root
					value={otpValue}
					onChange={(val) => {
						setError({ name: "email", error: null });
						setIsSuccess(false);
						setOtpValue(val);
					}}
					onComplete={handleVerify}
					inputMode="numeric"
					maxLength={6}
					autoFocus
					hasError={!!error.error}
					isSuccess={isSuccess}
					containerClassName="w-full justify-start gap-2.5"
				>
					<DigitInput.Group className="w-full justify-center gap-2.5">
						{[0, 1, 2, 3, 4, 5].map((index) => (
							<DigitInput.Slot
								key={index}
								index={index}
								className="size-13 shrink-0 rounded-xl border-stroke-soft-200 bg-bg-white-0 text-lg data-[active=true]:border-primary-base data-[active=true]:ring-primary-base/30"
							/>
						))}
					</DigitInput.Group>
				</DigitInput.Root>
				{error.error && (
					<p className="pt-2 text-left text-error-base text-sm">
						{error.error}
					</p>
				)}
			</div>

			{/* Primary CTA is the shared page button (Create account / Sign in). */}

			{showBack && onBack ? (
				<button
					type="button"
					onClick={onBack}
					className="cursor-pointer text-center font-medium text-[13px] text-text-soft-400 transition-colors hover:text-text-strong-950 hover:underline"
				>
					Back to {mode}
				</button>
			) : null}
		</div>
	);
}
