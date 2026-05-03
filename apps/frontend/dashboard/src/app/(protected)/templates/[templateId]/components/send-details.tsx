"use client";

import { cn } from "@reloop/ui/cn";
import { useEditorStore } from "./use-editor-store";

interface FieldRowProps {
	label: string;
	children: React.ReactNode;
	hideBorder?: boolean;
}

const FieldRow = ({ label, children, hideBorder }: FieldRowProps) => {
	return (
		<div
			className={cn(
				"flex items-center border-stroke-soft-200 border-b py-3",
				hideBorder && "border-b-0",
			)}
		>
			<label
				htmlFor={label}
				className="w-20 shrink-0 text-sm text-text-sub-600"
			>
				{label}
			</label>
			<div className="flex flex-1 items-center">{children}</div>
		</div>
	);
};

export const SendDetails = () => {
	const senderName = useEditorStore((s) => s.senderName);
	const setSenderName = useEditorStore((s) => s.setSenderName);
	const fromEmail = useEditorStore((s) => s.fromEmail);
	const setFromEmail = useEditorStore((s) => s.setFromEmail);
	const replyTo = useEditorStore((s) => s.replyTo);
	const setReplyTo = useEditorStore((s) => s.setReplyTo);
	const previewText = useEditorStore((s) => s.previewText);
	const setPreviewText = useEditorStore((s) => s.setPreviewText);
	const subject = useEditorStore((s) => s.subject);
	const setSubject = useEditorStore((s) => s.setSubject);

	return (
		<div className="mx-auto w-full max-w-[600px]">
			{/* From Row */}
			<FieldRow label="From">
				<div className="flex flex-1 items-center gap-1 text-sm text-text-sub-600">
					<input
						value={fromEmail}
						onChange={(e) => setFromEmail(e.target.value)}
						placeholder="Acme<acme@example.com>"
						className="flex-1 bg-transparent outline-none placeholder:text-text-soft-400"
					/>
				</div>
			</FieldRow>

			{/* Reply-To Row */}
			<FieldRow label="Reply-To">
				<input
					value={replyTo}
					onChange={(e) => setReplyTo(e.target.value)}
					placeholder="replyto"
					className="flex-1 bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</FieldRow>

			{/* Preview Row */}
			<FieldRow label="Preview">
				<input
					value={previewText}
					onChange={(e) => setPreviewText(e.target.value)}
					placeholder="dvdvdsvs"
					className="flex-1 bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</FieldRow>

			{/* Subject Row (No label) */}
			<div className="flex items-center border-stroke-soft-200 border-b py-3">
				<input
					value={subject}
					onChange={(e) => setSubject(e.target.value)}
					placeholder="Subject"
					className="flex-1 bg-transparent font-medium text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
			</div>
		</div>
	);
};
