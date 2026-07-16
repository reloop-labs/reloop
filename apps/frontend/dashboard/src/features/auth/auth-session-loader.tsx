import { Loader } from "@dot-loaders/react";

export function AuthSessionLoader() {
	return (
		<div
			className="flex h-dvh w-full items-center justify-center text-text-strong-950 dark:text-white"
			aria-busy="true"
			aria-live="polite"
		>
			<span className="sr-only">Loading</span>
			<Loader loader="pulse" />
		</div>
	);
}
