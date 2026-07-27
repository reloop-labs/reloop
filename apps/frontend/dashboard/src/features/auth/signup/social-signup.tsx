import Link from "next/link";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";

/** Public path for OAuth return (includes app basepath). */
function signupCallbackURL(inviteId?: string) {
	const params = new URLSearchParams();
	if (inviteId) params.set("inviteId", inviteId);
	const qs = params.toString();
	return qs ? `/dashboard/signup?${qs}` : "/dashboard/signup";
}

export function SocialSignup({
	onContinueWithEmail,
	inviteId,
}: {
	onContinueWithEmail: () => void;
	/** Organization Invitation id — preserved through OAuth callback. */
	inviteId?: string;
}) {
	const [loading, setLoading] = useState<{
		name: "google" | "github" | "email";
		loading: boolean;
	}>({ name: "email", loading: false });

	useEffect(() => {
		const handlePageShow = (event: PageTransitionEvent) => {
			if (event.persisted) {
				setLoading({ name: "email", loading: false });
			}
		};
		window.addEventListener("pageshow", handlePageShow);
		return () => {
			window.removeEventListener("pageshow", handlePageShow);
		};
	}, []);
	const [, setError] = useState<{
		name: "google" | "github" | "email";
		error: string | null;
	}>({ name: "email", error: null });

	return (
		<>
			<div className="grid grid-cols-1 gap-2.5">
				<FancyButton.Root
					disabled={loading.loading}
					variant="blue"
					size="medium"
					className="relative h-10 w-full rounded-xl justify-center font-medium text-sm gap-2.5"
					onClick={async () => {
						try {
							setLoading({ name: "google", loading: true });
							await authClient.signIn.social({
								provider: "google",
								callbackURL: signupCallbackURL(inviteId),
							});
						} catch {
							setLoading({ name: "google", loading: false });
							setError({
								name: "google",
								error: "Failed to signup with Google",
							});
						}
					}}
				>
					{loading.name === "google" && loading.loading ? (
						<Spinner color="currentColor" size={16} />
					) : (
					<svg
						viewBox="0 0 512 512"
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4 shrink-0"
						fill="currentColor"
						fillRule="evenodd"
						clipRule="evenodd"
						strokeLinejoin="round"
						strokeMiterlimit={2}
						aria-hidden="true"
					>
						<title>Google</title>
						<path d="M32.582 370.734C15.127 336.291 5.12 297.425 5.12 256c0-41.426 10.007-80.291 27.462-114.735C74.705 57.484 161.047 0 261.12 0c69.12 0 126.836 25.367 171.287 66.793l-73.31 73.309c-26.763-25.135-60.276-38.168-97.977-38.168-66.56 0-123.113 44.917-143.36 105.426-5.12 15.36-8.146 31.65-8.146 48.64 0 16.989 3.026 33.28 8.146 48.64l-.303.232h.303c20.247 60.51 76.8 105.426 143.36 105.426 34.443 0 63.534-9.31 86.341-24.67 27.23-18.152 45.382-45.148 51.433-77.032H261.12v-99.142h241.105c3.025 16.757 4.654 34.211 4.654 52.364 0 77.963-27.927 143.592-76.334 188.276-42.356 39.098-100.305 61.905-169.425 61.905-100.073 0-186.415-57.483-228.538-141.032v-.233z" />
					</svg>
					)}
					<span>Continue with Google</span>
				</FancyButton.Root>
				<Button.Root
					disabled={loading.loading}
					variant="neutral"
					mode="stroke"
					className="relative h-10 w-full rounded-xl justify-center font-medium text-sm gap-2.5 flex items-center"
					onClick={async () => {
						try {
							setLoading({ name: "github", loading: true });
							await authClient.signIn.social({
								provider: "github",
								callbackURL: signupCallbackURL(inviteId),
							});
						} catch {
							setLoading({ name: "github", loading: false });
							setError({
								name: "github",
								error: "Failed to signup with GitHub",
							});
						}
					}}
				>
					{loading.name === "github" && loading.loading ? (
						<Spinner color="currentColor" size={16} />
					) : (
						<Icon name="github" className="h-4 w-4 shrink-0" />
					)}
					<span>Continue with GitHub</span>
				</Button.Root>
				<Button.Root
					disabled={loading.loading}
					variant="neutral"
					mode="stroke"
					className="relative h-10 w-full rounded-xl justify-center font-medium text-sm gap-2.5 flex items-center"
					onClick={onContinueWithEmail}
				>
					<Icon name="social-mail" className="h-4 w-4 shrink-0" />
					<span>Continue with Email</span>
				</Button.Root>
			</div>
			<p className="pt-5 text-center font-medium text-[13px] text-text-sub-600">
				By creating an account, you agree to our <br />
				<a
					href="/terms-and-conditions"
					className={LinkButton.linkButtonVariants({
						variant: "black",
					}).root({ className: "text-xs!" })}
				>
					Terms of Service
				</a>{" "}
				and{" "}
				<a
					href="/privacy"
					className={LinkButton.linkButtonVariants({
						variant: "black",
					}).root({ className: "text-xs!" })}
				>
					Privacy Policy
				</a>
			</p>
			<p className="pt-3 text-center font-medium text-[13px] text-text-sub-600">
				Already have an account?{" "}
				<Link href={"/login"} className={LinkButton.linkButtonVariants({
						variant: "black",
					}).root({ className: "text-[13px]!" })}>
					Login
				</Link>
			</p>
		</>
	);
}
