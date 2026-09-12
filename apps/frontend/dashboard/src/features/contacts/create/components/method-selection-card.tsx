"use client";

import {
	ArrowDownToLine,
	Code2,
	FileText,
	Sparkles,
	Upload,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import type { CreateContactStep } from "../types";

interface MethodSelectionCardProps {
	onSelectMethod: (method: CreateContactStep) => void;
	onFileSelect?: (file: File) => void;
	onSelectGroupModal?: () => void;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function MethodSelectionCard({
	onSelectMethod,
	onFileSelect,
}: MethodSelectionCardProps) {
	const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
		accept: {
			"text/csv": [".csv"],
			"application/vnd.ms-excel": [".csv", ".xls"],
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
				".xlsx",
			],
			"text/plain": [".txt"],
		},
		noClick: false,
		maxFiles: 1,
		maxSize: MAX_FILE_SIZE_BYTES,
		onDrop: (acceptedFiles, fileRejections) => {
			const rejection = fileRejections[0];
			if (rejection) {
				if (rejection.errors.some((err) => err.code === "file-too-large")) {
					toast.error("File size exceeds the 25 MB limit.");
				} else {
					toast.error("Please upload a valid CSV or spreadsheet file.");
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

	return (
		<div className="w-full max-w-xl mx-auto font-sans">
			{/* Top Step Counter */}
			<div className="mb-2 text-xs sm:text-sm font-normal text-text-sub-600">
				Step 1 of 3
			</div>

			{/* Main Title & Subtitle */}
			<div className="mb-6 space-y-1.5">
				<h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-text-strong-950">
					Start from a document
				</h1>
				<p className="text-xs sm:text-sm text-text-sub-600 leading-relaxed max-w-md">
					Upload a spreadsheet, CSV, or contact list you&apos;ve used before.
					We&apos;ll scan it and fill in what we find
				</p>
			</div>

			{/* Dashed Dropzone Box */}
			<div
				{...getRootProps()}
				className={`group relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer ${
					isDragActive
						? "border-text-strong-950 bg-bg-weak-50/80 dark:border-white"
						: "border-stroke-soft-300 dark:border-stroke-soft-200/40 bg-bg-weak-50/20 hover:border-stroke-soft-400 hover:bg-bg-weak-50/50"
				}`}
			>
				<input {...getInputProps()} />

				{/* Upload Icon in Rounded Square */}
				<div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-xs transition-transform group-hover:scale-105 group-hover:text-text-strong-950">
					<Upload className="h-4 w-4 stroke-[2]" />
				</div>

				{/* Drop Prompt */}
				<div className="font-semibold text-sm sm:text-base text-text-strong-950">
					Drop your files here
				</div>

				{/* Formats Info */}
				<p className="mt-1 text-xs text-text-sub-600">
					Supports CSV, XLS, XLSX. Max file size 25MB
				</p>

				{/* Choose Files Button */}
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						open();
					}}
					className="mt-4 inline-flex items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-2 font-medium text-xs text-text-strong-950 shadow-2xs transition-colors hover:bg-bg-weak-50"
				>
					Choose files
				</button>
			</div>

			{/* Alternative Methods Section */}
			<div className="mt-8 space-y-3">
				<div className="text-xs sm:text-sm font-medium text-text-sub-600">
					Or start a different way
				</div>

				<div className="space-y-1">
					{/* Option 1: Import from another app */}
					<button
						type="button"
						onClick={() => onSelectMethod("csv-import")}
						className="group flex w-full items-center gap-3 rounded-lg py-2 text-left font-medium text-xs sm:text-sm text-text-strong-950 transition-colors hover:text-black dark:hover:text-white cursor-pointer"
					>
						<ArrowDownToLine className="h-4 w-4 text-text-sub-600 transition-colors group-hover:text-text-strong-950" />
						<span>Import contacts from another app</span>
					</button>

					{/* Option 2: Add manually or copy paste */}
					<button
						type="button"
						onClick={() => onSelectMethod("single-contact")}
						className="group flex w-full items-center gap-3 rounded-lg py-2 text-left font-medium text-xs sm:text-sm text-text-strong-950 transition-colors hover:text-black dark:hover:text-white cursor-pointer"
					>
						<FileText className="h-4 w-4 text-text-sub-600 transition-colors group-hover:text-text-strong-950" />
						<span>Add manually or copy paste</span>
					</button>

					{/* Option 3: Sync via SDK */}
					<button
						type="button"
						onClick={() => onSelectMethod("api-sync")}
						className="group flex w-full items-center gap-3 rounded-lg py-2 text-left font-medium text-xs sm:text-sm text-text-strong-950 transition-colors hover:text-black dark:hover:text-white cursor-pointer"
					>
						<Code2 className="h-4 w-4 text-text-sub-600 transition-colors group-hover:text-text-strong-950" />
						<span>Sync via SDK or REST API</span>
					</button>

					{/* Option 4: AI Import */}
					<button
						type="button"
						onClick={() => onSelectMethod("ai-import")}
						className="group flex w-full items-center gap-3 rounded-lg py-2 text-left font-medium text-xs sm:text-sm text-text-strong-950 transition-colors hover:text-black dark:hover:text-white cursor-pointer"
					>
						<Sparkles className="h-4 w-4 text-text-sub-600 transition-colors group-hover:text-text-strong-950" />
						<span>Import contacts using AI assistant</span>
					</button>
				</div>
			</div>
		</div>
	);
}
