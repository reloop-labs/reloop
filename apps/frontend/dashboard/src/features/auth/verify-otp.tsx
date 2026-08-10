import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as DigitInput from "@reloop/ui/digit-input";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
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

export function VerifyOTP({
	email,
	onBack,
	inviteId,
	redirectTo,
	mode = "login",
}: {
	email: string;
	onBack: () => void;
	/** Organization invitation id preserved through email OTP auth. */
	inviteId?: string;
	redirectTo?: string;
	mode?: "login" | "signup";
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

	const [enterCode, setEnterCode] = useQueryState(
		"enterCode",
		parseAsBoolean.withDefault(false),
	);
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

	return (
		<div>
			{enterCode && (
				<motion.div
					key="otp-input"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.2 }}
					className="flex flex-col items-center overflow-hidden"
				>
					<div className="pt-1 pb-5">
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
						>
							<DigitInput.Group>
								<DigitInput.Slot index={0} />
								<DigitInput.Slot index={1} />
								<DigitInput.Slot index={2} />
								<DigitInput.Separator />
								<DigitInput.Slot index={3} />
								<DigitInput.Slot index={4} />
								<DigitInput.Slot index={5} />
							</DigitInput.Group>
						</DigitInput.Root>
						{error.error && (
							<p className="pt-2 text-center text-error-base text-sm">
								{error.error}
							</p>
						)}
					</div>
				</motion.div>
			)}
			{!enterCode ? (
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					className="flex h-10 w-full items-center justify-center gap-2 rounded-xl font-medium text-sm"
					onClick={() => setEnterCode(true)}
				>
					Enter code manually
				</Button.Root>
			) : (
				<FancyButton.Root
					type="button"
					variant="blue"
					size="medium"
					className="h-10 w-full justify-center gap-2 overflow-hidden rounded-xl font-medium text-sm"
					onClick={() => {
						if (isSuccess || status === "loading") return;
						handleVerify(otpValue);
					}}
					disabled={
						(otpValue.length !== 6 || status === "loading") && !isSuccess
					}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={
								isSuccess
									? "success"
									: status === "loading"
										? "loading"
										: "idle"
							}
							transition={{
								type: "spring",
								duration: 0.25,
								bounce: 0,
							}}
							initial={{
								opacity: 0,
								y: -14,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								y: 14,
							}}
							className="flex items-center justify-center gap-1.5"
						>
							{status === "loading" && (
								<Spinner size={14} color="currentColor" />
							)}
							{isSuccess && (
								<Icon name="check-circle" className="h-4 w-4 shrink-0" />
							)}
							<span>
								{isSuccess
									? "Verified successfully!"
									: status === "loading"
										? "Verifying..."
										: `Continue with ${mode} code`}
							</span>
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			)}
			<div className="mt-4 flex flex-col items-center gap-2">
				{canResend ? (
					<button
						type="button"
						onClick={() => void handleResend()}
						className="cursor-pointer text-center font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 hover:underline"
					>
						Resend code
					</button>
				) : isSuccess ? null : (
					<p className="text-center font-medium text-[13px] text-text-soft-400">
						{isResending
							? "Sending a new code…"
							: `Resend code in ${secondsLeft}s`}
					</p>
				)}
				<button
					type="button"
					onClick={onBack}
					className="cursor-pointer text-center font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 hover:underline"
				>
					Back to {mode}
				</button>
			</div>
		</div>
	);
}
