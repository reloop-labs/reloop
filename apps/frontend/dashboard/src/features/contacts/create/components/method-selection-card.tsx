"use client";

import { cn } from "@reloop/ui/cn";
import * as FileFormatIcon from "@reloop/ui/file-format-icon";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import { Code2, FileText } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ContactsApiDetails } from "#/components/api-details/contacts";
import type { CreateContactStep } from "../types";
import { ManualContactsModal } from "./manual-contacts-modal";

interface MethodSelectionCardProps {
	onSelectMethod: (method: CreateContactStep) => void;
	onFileSelect?: (file: File) => void;
	onSelectGroupModal?: () => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Max Cap

export function MethodSelectionCard({
	onSelectMethod,
	onFileSelect,
}: MethodSelectionCardProps) {
	const [isManualModalOpen, setIsManualModalOpen] = useState(false);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: {
			"text/csv": [".csv"],
			"application/vnd.ms-excel": [".csv"],
		},
		maxFiles: 1,
		maxSize: MAX_FILE_SIZE_BYTES,
		onDrop: (acceptedFiles, fileRejections) => {
			const rejection = fileRejections[0];
			if (rejection) {
				if (rejection.errors.some((err) => err.code === "file-too-large")) {
					toast.error("File size exceeds the 5 MB limit.");
				} else {
					toast.error("Please upload a valid CSV file.");
				}
				return;
			}
			if (acceptedFiles[0]) {
				if (onFileSelect) {
					onFileSelect(acceptedFiles[0]);
				} else {
					onSelectMethod("csv-import");
				}
			}
		},
	});

	const handleDownloadSample = () => {
		const sampleCsvContent =
			"email,first_name,last_name,company,role\nalice@example.com,Alice,Smith,Acme Corp,Marketing Lead\nbob@example.com,Bob,Jones,Global Tech,Engineer\ncharlie@example.com,Charlie,Brown,Design Co,Product Designer\n";
		const blob = new Blob([sampleCsvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "sample_contacts.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="mx-auto w-full max-w-xl space-y-6 font-sans">
			{/* Header */}
			<div>
				<div className="mb-1 font-normal text-text-sub-600 text-xs">
					Step 1 of 3
				</div>
				<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
					Import Contacts from CSV
				</h2>
			</div>

			{/* Upload Box */}
			<FileUpload.Root
				{...getRootProps()}
				className={cn(
					"flex cursor-pointer flex-col items-center justify-center gap-3.5 rounded-2xl border border-stroke-soft-200 border-dashed bg-bg-weak-50/30 p-8 text-center transition-all hover:border-stroke-soft-400 hover:bg-bg-weak-50/70",
					isDragActive && "border-text-strong-950 bg-bg-weak-50/80",
				)}
			>
				<input {...getInputProps()} />

				<FileFormatIcon.Root
					format="CSV"
					color="green"
					size="small"
					className="h-10 w-10"
				/>

				<div className="space-y-1">
					<p className="font-normal text-sm text-text-strong-950">
						<span className="font-medium underline underline-offset-2">
							Choose a file
						</span>{" "}
						or drag & drop it here.
					</p>
					<p className="text-text-sub-600 text-xs">CSV files up to 5 MB</p>
				</div>
			</FileUpload.Root>

			{/* File Requirements Box */}
			<div className="space-y-2 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/30 p-3.5 text-text-sub-600 text-xs">
				<div className="flex items-center justify-between">
					<p className="font-medium text-text-strong-950">
						CSV File Requirements:
					</p>
					<button
						type="button"
						onClick={handleDownloadSample}
						className="inline-flex cursor-pointer items-center gap-1 font-medium text-text-sub-600 text-xs underline underline-offset-2 transition-colors hover:text-text-strong-950"
					>
						<Icon name="file-download" className="h-3.5 w-3.5" />
						Download sample
					</button>
				</div>
				<ul className="list-inside list-disc space-y-0.5 leading-relaxed">
					<li>
						Must contain an{" "}
						<code className="rounded border border-stroke-soft-200 bg-bg-white-0 px-1 py-0.5 font-mono text-[11px] text-text-strong-950">
							email
						</code>{" "}
						column header.
					</li>
					<li>
						Optional headers:{" "}
						<code className="rounded border border-stroke-soft-200 bg-bg-white-0 px-1 py-0.5 font-mono text-[11px] text-text-strong-950">
							first_name
						</code>
						,{" "}
						<code className="rounded border border-stroke-soft-200 bg-bg-white-0 px-1 py-0.5 font-mono text-[11px] text-text-strong-950">
							last_name
						</code>
						. Map extra columns to Reloop properties after upload.
					</li>
				</ul>
			</div>

			{/* Alternative Methods Section */}
			<div className="space-y-3 pt-2">
				<div className="font-medium text-text-sub-600 text-xs sm:text-sm">
					Or start a different way
				</div>

				<div className="space-y-1">
					{/* Option 1: Add manually or copy paste */}
					<button
						type="button"
						onClick={() => setIsManualModalOpen(true)}
						className="group flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-left font-medium text-text-strong-950 text-xs transition-colors hover:text-black sm:text-sm dark:hover:text-white"
					>
						<FileText className="h-4 w-4 text-text-sub-600 transition-colors group-hover:text-text-strong-950" />
						<span>Add manually or copy paste</span>
					</button>

					{/* Option 2: Sync via SDK or REST API */}
					<ContactsApiDetails
						renderTrigger={({ open }) => (
							<button
								type="button"
								onClick={open}
								className="group flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-left font-medium text-text-strong-950 text-xs transition-colors hover:text-black sm:text-sm dark:hover:text-white"
							>
								<Code2 className="h-4 w-4 text-text-sub-600 transition-colors group-hover:text-text-strong-950" />
								<span>Sync via SDK or REST API</span>
							</button>
						)}
					/>
				</div>
			</div>

			<ManualContactsModal
				open={isManualModalOpen}
				onOpenChange={setIsManualModalOpen}
			/>
		</div>
	);
}
