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
		<div className="border-stroke-inbox border-t px-5 py-4 dark:border-stroke-soft-100/10">
			<h3 className="mb-3 font-medium text-text-sub-600 text-xs">
				Attachments
			</h3>
			<ul className="flex flex-col gap-2">
				{attachments.map((file: any) => (
					<li key={file.name}>
						<button
							type="button"
							onClick={() => onDownload(file.name)}
							className="flex w-full items-center gap-3 rounded-lg border border-stroke-inbox px-3 py-2 text-left transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/10"
						>
							<Icon
								name="file"
								className="h-4 w-4 shrink-0 text-text-sub-600"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-text-strong-950 text-xs dark:text-neutral-300">
									{file.name}
								</p>
								<p className="text-[11px] text-text-soft-400">{file.size}</p>
							</div>
							<Icon
								name="file-download"
								className="h-4 w-4 text-text-soft-400"
							/>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};
