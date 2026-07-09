"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";

export default function ForbiddenPage() {
	return (
		<div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
			<Logo className="h-12" />
			<h1 className="font-semibold text-text-strong-950 text-title-h4">
				Console access required
			</h1>
			<p className="max-w-md text-paragraph-sm text-text-sub-600">
				Your account is signed in but does not have the platform{" "}
				<code className="rounded bg-bg-weak-50 px-1">admin</code> role. Ask an
				existing operator to promote you, or run the promote-admin script.
			</p>
			<div className="flex gap-2">
				<Button.Root
					variant="neutral"
					mode="stroke"
					onClick={() => authClient.signOut()}
				>
					Sign out
				</Button.Root>
				<Button.Root asChild variant="neutral" mode="ghost">
					<Link href="/login">Back to login</Link>
				</Button.Root>
			</div>
		</div>
	);
}
