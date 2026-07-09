"use client";

import { Icon } from "@reloop/ui/icon";

interface AttachmentItem {
	id?: string;
	name: string;
	size: string;
	contentType?: string;
	inboundEmailId?: string;
	messageId?: string;
}

interface MessageAttachmentsProps {
	attachments: AttachmentItem[];
	messageId?: string;
	onDownload?: (attachment: AttachmentItem) => void;
}

export const MessageAttachments = ({
	attachments,
	messageId,
	onDownload,
}: MessageAttachmentsProps) => {
	if (attachments.length === 0) return null;

	const handleDownload = async (file: AttachmentItem) => {
		if (onDownload) {
			onDownload(file);
			return;
		}

		const msgId = messageId || file.messageId || file.inboundEmailId;
		if (!msgId || !file.id) {
			return;
		}

		const url = `/api/inbox/v1/messages/${msgId}/attachments/${file.id}`;
		const res = await fetch(url);
		if (!res.ok) return;

		const meta = (await res.json()) as {
			filename: string;
			storagePath: string;
			contentType: string;
		};

		// Prefer opening storage path if it's a full URL; otherwise trigger download via blob of metadata link
		if (meta.storagePath?.startsWith("http")) {
			const a = document.createElement("a");
			a.href = meta.storagePath;
			a.download = meta.filename || file.name;
			a.target = "_blank";
			a.rel = "noopener noreferrer";
			a.click();
			return;
		}

		const a = document.createElement("a");
		a.href = url;
		a.download = meta.filename || file.name;
		a.click();
	};

	return (
		<div className="border-mail-border border-t border-mail-border/10 py-4">
			<h3 className="mb-3 font-medium text-mail-muted text-xs">Attachments</h3>
			<ul className="flex flex-col gap-2">
				{attachments.map((file) => (
					<li key={file.id || file.name}>
						<button
							type="button"
							onClick={() => void handleDownload(file)}
							className="flex w-full items-center gap-3 rounded-lg border border-mail-border border-mail-border/10 px-3 py-2 text-left transition-colors hover:bg-offset-light"
						>
							<Icon name="file" className="h-4 w-4 shrink-0 text-mail-muted" />
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-mail-foreground text-mail-muted text-xs">
									{file.name}
								</p>
								<p className="text-[11px] text-mail-muted">{file.size}</p>
							</div>
							<Icon name="file-download" className="h-4 w-4 text-mail-muted" />
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};
