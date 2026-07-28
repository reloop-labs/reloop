import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useSendFirstEmail } from "#/features/home/hooks/use-send-first-email";

type SendFirstEmailButtonProps = {
	/** Visual style. Fancy = primary CTA; stroke = quieter empty-state action. */
	variant?: "fancy" | "stroke";
	size?: "small" | "xsmall";
	/** Override label (default: "Send test email"). */
	label?: string;
	className?: string;
	/** Show trailing arrow (setup checklist style). */
	showArrow?: boolean;
};

/**
 * One-click first email. No modal, no form — server picks domain + template.
 */
export function SendFirstEmailButton({
	variant = "fancy",
	size = "small",
	label = "Send test email",
	className,
	showArrow = false,
}: SendFirstEmailButtonProps) {
	const send = useSendFirstEmail();
	const pending = send.isPending;

	const content = pending ? (
		<>
			<Spinner size={14} color="#fff" />
			Sending…
		</>
	) : (
		<>
			<Icon name="mail-send" className="h-4 w-4" />
			{label}
			{showArrow ? <Icon name="arrow-right" className="h-3.5 w-3.5" /> : null}
		</>
	);

	if (variant === "stroke") {
		return (
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				size={size}
				className={className ?? "gap-1.5 rounded-xl"}
				disabled={pending}
				onClick={() => send.mutate()}
			>
				{pending ? (
					<>
						<Spinner size={14} />
						Sending…
					</>
				) : (
					content
				)}
			</Button.Root>
		);
	}

	return (
		<FancyButton.Root
			type="button"
			variant="blue"
			size={size}
			className={className ?? "gap-1.5 rounded-xl"}
			disabled={pending}
			onClick={() => send.mutate()}
		>
			{content}
		</FancyButton.Root>
	);
}
