import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

export function MessageActionBar({
	onReply,
	onForward,
}: {
	onReply: () => void;
	onForward: () => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					onReply();
				}}
				className="rounded-full"
			>
				<Button.Icon as={Icon} name="reply" className="size-3.5" />
				Reply
			</Button.Root>
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					onForward();
				}}
				className="rounded-full"
			>
				<Button.Icon as={Icon} name="forward" className="size-3.5" />
				Forward
			</Button.Root>
		</div>
	);
}
