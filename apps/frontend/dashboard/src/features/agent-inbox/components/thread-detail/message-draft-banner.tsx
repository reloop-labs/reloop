import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";

interface MessageDraftBannerProps {
	messageAt: string;
}

/**
 * Amber warning banner shown on approval-pending messages.
 */
export const MessageDraftBanner = ({ messageAt }: MessageDraftBannerProps) => {
	const timeLabel = dayjs(messageAt).isSame(dayjs(), "day")
		? `Today, ${dayjs(messageAt).format("h:mm A")}`
		: dayjs(messageAt).format("MMM D, h:mm A");

	return (
		<div className="mb-1 flex w-full items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-medium text-amber-700 text-xs dark:text-amber-400">
			<Icon name="clock" className="h-3.5 w-3.5 shrink-0" />
			<span>
				Agent drafted a reply at{" "}
				<span className="font-semibold">{timeLabel}</span>
				<span className="mx-1.5 opacity-50">·</span>
				held for your approval before sending
			</span>
		</div>
	);
};
