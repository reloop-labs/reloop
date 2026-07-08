"use client";

import { Icon } from "@reloop/ui/icon";

interface MessageAttachmentsProps {
	attachments: any[];
	onDownload: (name: string) => void;
}

/**
 * List of file attachment pills shown below the email body.
 */
export const MessageAttachments = ({
	attachments,
	onDownload,
}: MessageAttachmentsProps) => {
	if (attachments.length === 0) return null;

	return (
		<div className="border-mail-border border-t py-4 border-mail-border/10">
			<h3 className="mb-3 font-medium text-mail-muted text-xs">
				Attachments
			</h3>
			<ul className="flex flex-col gap-2">
				{attachments.map((file: any) => (
					<li key={file.name}>
						<button
							type="button"
							onClick={() => onDownload(file.name)}
							className="flex w-full items-center gap-3 rounded-lg border border-mail-border px-3 py-2 text-left transition-colors hover:bg-offset-light border-mail-border/10"
						>
							<Icon
								name="file"
								className="h-4 w-4 shrink-0 text-mail-muted"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-mail-foreground text-xs text-mail-muted">
									{file.name}
								</p>
								<p className="text-[11px] text-mail-muted">{file.size}</p>
							</div>
							<Icon
								name="file-download"
								className="h-4 w-4 text-mail-muted"
							/>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};
