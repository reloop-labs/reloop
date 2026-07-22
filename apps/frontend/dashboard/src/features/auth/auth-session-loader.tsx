import { LoadingDot } from "../agent-inbox/components/shared/loading-dot";

export function AuthSessionLoader() {
	return (
		<div
			className="flex h-dvh w-full items-center justify-center text-text-strong-950 dark:text-white"
			aria-busy="true"
			aria-live="polite"
		>
			<span className="sr-only">Loading</span>
			<LoadingDot size={24} dotSize={3} />
		</div>
	);
}
