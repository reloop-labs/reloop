"use client";
import { authClient } from "@reloop/auth/client";
import { Logo } from "@reloop/ui/logo";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { LoginForm } from "./login-form";
import { SocialLogin } from "./social-login";
import { VerifyOTP } from "./verify-otp";

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

	useEffect(() => {
		if (session && !isPending) {
			router.push("/");
		}
	}, [session, isPending, router]);

	if (isPending) {
		return (
			<div className="flex h-dvh flex-col items-center justify-center">
				<Spinner size={32} />
			</div>
		);
	}

	return (
		<div className="flex h-dvh flex-col items-center justify-center">
			<div className="w-full max-w-sm p-5 md:p-8">
				<div className="flex flex-col items-center justify-center gap-2">
					<div className="space-y-1 pb-6 text-center">
						<div className="mb-2 flex items-center justify-center">
							<Logo className="h-16" />
						</div>
						<h2 className="font-medium text-label-lg text-text-strong-950">
							{otpSentEmail
								? "Check your email"
								: showEmail
									? "What’s your email address?"
									: "Login in to Reloop"}
						</h2>
						{otpSentEmail && (
							<p className="mt-2 text-center text-[13px] text-text-sub-600">
								We’ve sent you a temporary login otp.
								<br />
								Please check your inbox at
								<br />
								<span className="font-medium text-text-strong-950">
									{otpSentEmail}
								</span>
								.
							</p>
						)}
					</div>
				</div>
				{otpSentEmail ? (
					<VerifyOTP
						email={otpSentEmail}
						onBack={() => {
							setOtpSentEmail(null);
							setEnterCode(null);
						}}
					/>
				) : !showEmail ? (
					<SocialLogin onContinueWithEmail={() => setShowEmail(true)} />
				) : (
					<div className="flex flex-col gap-4">
						<LoginForm />
						<button
							type="button"
							onClick={() => setShowEmail(false)}
							className="text-center font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950"
						>
							Back to login
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Page;
