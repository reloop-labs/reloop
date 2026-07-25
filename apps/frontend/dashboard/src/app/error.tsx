"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-dvh items-center justify-center bg-bg-white-0 px-6 text-center dark:bg-black">
			<div className="flex max-w-sm flex-col items-center">
				<div className="mb-5 flex size-11 items-center justify-center rounded-full bg-error-lighter">
					<Icon name="error-warning" className="size-5 text-error-base" />
				</div>
				<h1 className="font-semibold text-lg text-text-strong-950 dark:text-white">
					Something went wrong
				</h1>
				<p className="mt-2 text-sm text-text-sub-600 dark:text-white/60">
					The dashboard could not finish loading. Try the request again.
				</p>
				<Button.Root
					type="button"
					variant="neutral"
					className="mt-6"
					onClick={reset}
				>
					Try again
				</Button.Root>
			</div>
		</div>
	);
}
