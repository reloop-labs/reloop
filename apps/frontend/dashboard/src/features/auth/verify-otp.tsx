import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as DigitInput from "@reloop/ui/digit-input";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { sessionQueryOptions } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";
import { navigatePostAuth } from "#/utils/navigate-post-auth";
import { resolvePostAuthDestinationWithQuery } from "#/utils/post-auth-destination";

export function VerifyOTP({
	email,
	onBack,
	inviteId,
	mode = "login",
}: {
	email: string;
	onBack: () => void;
	/** Organization invitation id preserved through email OTP auth. */
	inviteId?: string;
	mode?: "login" | "signup";
}) {
	const navigate = useNavigate();
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
					{ inviteId: inviteId || null },
				);
				timeoutRef.current = setTimeout(() => {
					void navigatePostAuth(navigate, destination);
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
					className="h-10 w-full rounded-xl font-medium text-sm gap-2 justify-center flex items-center"
					onClick={() => setEnterCode(true)}
				>
					Enter code manually
				</Button.Root>
			) : (
				<FancyButton.Root
					type="button"
					variant="blue"
					size="medium"
					className="h-10 w-full overflow-hidden rounded-xl font-medium text-sm gap-2 justify-center"
					onClick={() => {
						if (isSuccess || status === "loading") return;
						handleVerify(otpValue);
					}}
					disabled={(otpValue.length !== 6 || status === "loading") && !isSuccess}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={isSuccess ? "success" : status === "loading" ? "loading" : "idle"}
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
							{status === "loading" && <Spinner size={14} color="currentColor" />}
							{isSuccess && <Icon name="check-circle" className="h-4 w-4 shrink-0" />}
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
			<div className="mt-4 flex justify-center">
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
