import { cn } from "@reloop/ui/cn";

/**
 * Stripe-style secret display:
 * - Masked: prefix + middots
 * - Revealed: full secret (controlled via `revealed`)
 */
export function StripeSecret({
	secret,
	revealed = false,
	className,
	/** How many leading characters stay visible when masked. */
	prefixLength = 6,
	/** Bullet count for the masked body. */
	maskLength = 24,
}: {
	secret: string;
	revealed?: boolean;
	className?: string;
	prefixLength?: number;
	maskLength?: number;
}) {
	const safe = secret || "";

	if (!safe) {
		return (
			<span
				className={cn("font-mono text-[13px] text-text-sub-600", className)}
			>
				No secret
			</span>
		);
	}

	const prefix = safe.slice(0, Math.min(prefixLength, safe.length));
	const masked = `${prefix}${"•".repeat(maskLength)}`;

	return (
		<code
			className={cn(
				"min-w-0 truncate font-mono text-[13px] text-text-strong-950 tracking-tight",
				!revealed && "select-none",
				className,
			)}
			aria-label={
				revealed ? "Webhook signing secret" : `Secret starting with ${prefix}`
			}
		>
			{revealed ? safe : masked}
		</code>
	);
}

/** @deprecated Use StripeSecret — kept as alias for existing imports. */
export const BlurredSecret = StripeSecret;
