import * as Modal from "@reloop/ui/modal";

/**
 * Temporary placeholder (YouTube IFrame API sample) until the real
 * Reloop video is uploaded. Replace with the production video ID when ready.
 */
export const PLACEHOLDER_YOUTUBE_VIDEO_ID = "M7lc1UVf-VE";

interface VideoGuideModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** YouTube video ID (the part after v=). */
	youtubeVideoId?: string;
}

export function VideoGuideModal({
	open,
	onOpenChange,
	youtubeVideoId = PLACEHOLDER_YOUTUBE_VIDEO_ID,
}: VideoGuideModalProps) {
	const embedSrc = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="max-w-[720px] overflow-hidden p-0"
				showClose={false}
			>
				{/* Visually hidden for a11y — Radix requires a dialog title. */}
				<Modal.Title className="sr-only">Video guide</Modal.Title>
				{/* Unmount the iframe when closed so playback stops. */}
				{open ? (
					<div className="relative aspect-video w-full bg-black">
						<iframe
							src={embedSrc}
							title="Video guide"
							className="absolute inset-0 h-full w-full border-0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowFullScreen
						/>
					</div>
				) : null}
			</Modal.Content>
		</Modal.Root>
	);
}
