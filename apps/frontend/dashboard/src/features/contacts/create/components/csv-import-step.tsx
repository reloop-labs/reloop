import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as FileFormatIcon from "@reloop/ui/file-format-icon";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { GroupSelect } from "#/features/contacts/components/groups/group-select";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import {
	buildContactsFromMapping,
	type ColumnMapping,
	type ColumnTarget,
	type ParsedCsvResult,
	parseCsvContent,
} from "../utils/csv-parser";

interface CsvImportStepProps {
	onBack: () => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Max Cap
const BATCH_SIZE = 5; // Concurrency limit for client-side API requests

export function CsvImportStep({ onBack }: CsvImportStepProps) {
	const navigate = useNavigate();
	const invalidate = useInvalidateContacts();

	const [file, setFile] = useState<File | null>(null);
	const [parsedResult, setParsedResult] = useState<ParsedCsvResult | null>(
		null,
	);
	const [mappings, setMappings] = useState<ColumnMapping[]>([]);
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
	const [isParsing, setIsParsing] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [processedCount, setProcessedCount] = useState(0);

	const processFile = (inputFile: File) => {
		if (inputFile.size > MAX_FILE_SIZE_BYTES) {
			toast.error("File size exceeds 5 MB limit for client-side import.");
			return;
		}

		setFile(inputFile);
		setIsParsing(true);

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const result = parseCsvContent(content);

				if (result.errors.length > 0) {
					toast.error(result.errors[0]);
					setParsedResult(null);
					setMappings([]);
				} else if (result.validCount === 0) {
					toast.error("No valid email addresses found in the CSV file.");
					setParsedResult(null);
					setMappings([]);
				} else {
					setParsedResult(result);
					setMappings(result.mappings);
					toast.success(
						`Parsed ${result.validCount} valid contact(s) from CSV.`,
					);
				}
			} catch (err) {
				console.error("Error reading CSV file:", err);
				toast.error("Failed to parse CSV file content.");
				setParsedResult(null);
				setMappings([]);
			} finally {
				setIsParsing(false);
			}
		};
		reader.onerror = () => {
			toast.error("Failed to read file.");
			setIsParsing(false);
		};
		reader.readAsText(inputFile);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: {
			"text/csv": [".csv"],
			"application/vnd.ms-excel": [".csv"],
		},
		maxFiles: 1,
		maxSize: MAX_FILE_SIZE_BYTES,
		onDrop: (acceptedFiles, fileRejections) => {
			if (fileRejections.length > 0) {
				const rejection = fileRejections[0];
				if (rejection.errors.some((err) => err.code === "file-too-large")) {
					toast.error("File size exceeds the 5 MB limit.");
				} else {
					toast.error("Please upload a valid CSV file.");
				}
				return;
			}
			if (acceptedFiles[0]) {
				processFile(acceptedFiles[0]);
			}
		},
	});

	const handleResetFile = () => {
		setFile(null);
		setParsedResult(null);
		setMappings([]);
		setProcessedCount(0);
	};

	const handleMappingChange = (csvHeader: string, newTarget: ColumnTarget) => {
		if (!parsedResult) return;

		const updatedMappings = mappings.map((m) =>
			m.csvHeader === csvHeader ? { ...m, target: newTarget } : m,
		);
		setMappings(updatedMappings);

		const updated = buildContactsFromMapping(
			parsedResult.headers,
			parsedResult.rawRows,
			updatedMappings,
		);

		setParsedResult({
			...parsedResult,
			contacts: updated.contacts,
			validCount: updated.validCount,
			invalidCount: updated.invalidCount,
			duplicateCount: updated.duplicateCount,
		});
	};

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

	const handleImport = async () => {
		if (!parsedResult || parsedResult.contacts.length === 0) return;

		setIsImporting(true);
		setProcessedCount(0);

		const totalToProcess = parsedResult.contacts.length;
		let successCount = 0;
		let skippedCount = 0;

		try {
			for (let i = 0; i < totalToProcess; i += BATCH_SIZE) {
				const batch = parsedResult.contacts.slice(i, i + BATCH_SIZE);

				await Promise.all(
					batch.map(async (contact) => {
						try {
							const response = await fetch("/api/contacts/create", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									email: contact.email,
									firstName: contact.firstName,
									lastName: contact.lastName,
									properties: contact.properties,
									groupIds: selectedGroupIds,
								}),
							});

							if (response.ok) {
								successCount++;
								if (selectedGroupIds.length > 0) {
									for (const groupId of selectedGroupIds) {
										await fetch(`/api/contacts/group/${groupId}`, {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ email: contact.email }),
										}).catch(() => {});
									}
								}
							} else if (response.status === 409) {
								skippedCount++;
							} else {
								skippedCount++;
							}
						} catch (error) {
							console.error(
								`Failed to create contact for ${contact.email}:`,
								error,
							);
							skippedCount++;
						}
					}),
				);

				setProcessedCount(Math.min(i + BATCH_SIZE, totalToProcess));
			}

			await invalidate();

			if (successCount > 0) {
				toast.success(
					`Successfully imported ${successCount} contact(s)${
						skippedCount > 0 ? ` (${skippedCount} skipped)` : ""
					}`,
				);
			} else {
				toast.info(
					`All ${totalToProcess} contacts were skipped or already exist.`,
				);
			}

			void navigate({ to: "/contacts" });
		} catch (err) {
			console.error("Batch import error:", err);
			toast.error("An error occurred during import processing.");
		} finally {
			setIsImporting(false);
		}
	};

	const progressPercent = parsedResult
		? Math.round((processedCount / parsedResult.contacts.length) * 100)
		: 0;

	return (
		<div className="w-full space-y-6 font-sans">
			{/* Main Card Container */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
				{/* Top Padded Content Area */}
				<div className="m-0.5 space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-4 pb-6">
					{/* Header */}
					<div>
						<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
							Import Contacts from CSV
						</h2>
						<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
							Upload a spreadsheet to bulk import contacts and custom
							properties.
						</p>
					</div>

					{/* Step 1: Upload State */}
					{!parsedResult && !isParsing && (
						<>
							<FileUpload.Root
								{...getRootProps()}
								className={cn(
									"flex cursor-pointer flex-col items-center justify-center gap-3.5 rounded-2xl border border-stroke-soft-200 border-dashed bg-bg-weak-50/30 p-8 text-center transition-all hover:border-stroke-soft-400 hover:bg-bg-weak-50/70",
									isDragActive && "border-text-strong-950 bg-bg-weak-50/80",
									file && "border-emerald-500 bg-emerald-50/20",
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
									<p className="text-text-sub-600 text-xs">
										CSV files up to 5 MB
									</p>
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
										. Any additional headers map to custom properties.
									</li>
								</ul>
							</div>
						</>
					)}

					{/* Loading State */}
					{isParsing && (
						<div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/30 p-10 text-center">
							<Spinner size={24} color="currentColor" />
							<p className="font-medium text-sm text-text-strong-950">
								Parsing CSV file...
							</p>
						</div>
					)}

					{/* Step 2: Parsed File Preview, Column Mapper & Group Selection */}
					{parsedResult && !isParsing && (
						<div className="space-y-5">
							{/* Selected File Card */}
							<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 px-4 py-3">
								<div className="flex items-center gap-3">
									<FileFormatIcon.Root
										format="CSV"
										color="green"
										size="small"
										className="h-8 w-8"
									/>
									<div>
										<p className="font-semibold text-sm text-text-strong-950">
											{file?.name}
										</p>
										<p className="text-text-sub-600 text-xs">
											{file ? (file.size / 1024).toFixed(1) : 0} KB •{" "}
											{parsedResult.totalRows} row(s) found
										</p>
									</div>
								</div>

								{!isImporting && (
									<button
										type="button"
										onClick={handleResetFile}
										className="inline-flex cursor-pointer items-center gap-1 font-medium text-text-sub-600 text-xs hover:text-text-strong-950"
									>
										<Icon name="cross" className="h-3.5 w-3.5" />
										Change file
									</button>
								)}
							</div>

							{/* Summary Stats Container */}
							<div className="grid grid-cols-2 divide-y divide-stroke-soft-200 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
								{/* Valid Contacts */}
								<div className="flex flex-col justify-center px-3.5 py-2.5">
									<p className="truncate whitespace-nowrap font-normal text-text-sub-600 text-xs">
										Valid contacts
									</p>
									<p className="mt-1 font-semibold text-text-strong-950 text-xl leading-none tracking-tight">
										{parsedResult.validCount}
									</p>
								</div>

								{/* Invalid Emails */}
								<div className="flex flex-col justify-center px-3.5 py-2.5">
									<p className="truncate whitespace-nowrap font-normal text-text-sub-600 text-xs">
										Invalid emails
									</p>
									<p className="mt-1 font-semibold text-text-strong-950 text-xl leading-none tracking-tight">
										{parsedResult.invalidCount}
									</p>
								</div>

								{/* Duplicates */}
								<div className="flex flex-col justify-center px-3.5 py-2.5">
									<p className="truncate whitespace-nowrap font-normal text-text-sub-600 text-xs">
										Duplicates
									</p>
									<p className="mt-1 font-semibold text-text-strong-950 text-xl leading-none tracking-tight">
										{parsedResult.duplicateCount}
									</p>
								</div>

								{/* Total Rows */}
								<div className="flex flex-col justify-center px-3.5 py-2.5">
									<p className="truncate whitespace-nowrap font-normal text-text-sub-600 text-xs">
										Total rows
									</p>
									<p className="mt-1 font-semibold text-text-strong-950 text-xl leading-none tracking-tight">
										{parsedResult.totalRows}
									</p>
								</div>
							</div>

							{/* Interactive Column Mapper Table */}
							<div className="space-y-2.5 pt-1">
								<div className="flex items-center justify-between">
									<p className="font-semibold text-text-strong-950 text-xs">
										Column Mapping
									</p>
									<p className="text-[11px] text-text-sub-600">
										CSV Header → Reloop Property
									</p>
								</div>

								<div className="divide-y divide-stroke-soft-200 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0">
									{mappings.map((item) => (
										<div
											key={item.csvHeader}
											className="grid grid-cols-12 items-center px-4 py-2.5 text-xs transition-colors hover:bg-bg-weak-50/40"
										>
											{/* Left Column (5/12): CSV Header Name */}
											<div className="col-span-5 flex min-w-0 items-center justify-start">
												<span className="inline-flex max-w-full items-center truncate rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1 font-medium font-mono text-[11px] text-text-strong-950">
													{item.csvHeader}
												</span>
											</div>

											{/* Center Column (2/12): Arrow (Centered vertically & horizontally) */}
											<div className="col-span-2 flex items-center justify-center">
												<Icon
													name="arrow-right"
													className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
												/>
											</div>

											{/* Right Column (5/12): Reloop Property Dropdown */}
											<div className="col-span-5 flex items-center justify-end">
												<select
													value={item.target}
													disabled={isImporting}
													onChange={(e) =>
														handleMappingChange(
															item.csvHeader,
															e.target.value as ColumnTarget,
														)
													}
													className="w-full cursor-pointer rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1.5 font-sans text-text-strong-950 text-xs outline-none transition-colors hover:border-stroke-soft-300 focus:border-stroke-strong-950 disabled:cursor-not-allowed disabled:opacity-50"
												>
													<option value="email">
														Email Address (Required)
													</option>
													<option value="firstName">First Name</option>
													<option value="lastName">Last Name</option>
													<option value={`property:${item.csvHeader}`}>
														Property: {item.csvHeader}
													</option>
													<option value="skip">Do Not Import (Skip)</option>
												</select>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Optional Group Assignment */}
							<div className="space-y-1.5 pt-1">
								<GroupSelect
									selectedGroupIds={selectedGroupIds}
									onChange={setSelectedGroupIds}
									disabled={isImporting}
									open={true}
								/>
							</div>

							{/* Importing Progress Indicator */}
							{isImporting && (
								<div className="space-y-2 pt-2">
									<div className="flex items-center justify-between text-xs">
										<span className="font-medium text-text-strong-950">
											Importing contacts...
										</span>
										<span className="font-mono text-text-sub-600">
											{processedCount} / {parsedResult.contacts.length} (
											{progressPercent}%)
										</span>
									</div>
									<div className="h-2 w-full overflow-hidden rounded-full bg-bg-weak-50">
										<div
											className="h-full bg-emerald-500 transition-all duration-200 ease-out"
											style={{ width: `${progressPercent}%` }}
										/>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Bottom Footer / Action Bar */}
				<div className="flex items-center justify-between px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={onBack}
						disabled={isImporting || isParsing}
					>
						Back
					</Button.Root>

					<FancyButton.Root
						type="button"
						variant="primary"
						size="small"
						disabled={
							!parsedResult ||
							parsedResult.contacts.length === 0 ||
							isImporting ||
							isParsing
						}
						onClick={handleImport}
					>
						{isImporting ? (
							<>
								<Spinner size={14} color="currentColor" />
								Importing ({processedCount}/{parsedResult?.contacts.length || 0}
								)
							</>
						) : (
							`Import ${parsedResult ? parsedResult.validCount : 0} Contact${
								parsedResult?.validCount !== 1 ? "s" : ""
							}`
						)}
					</FancyButton.Root>
				</div>
			</div>
		</div>
	);
}
