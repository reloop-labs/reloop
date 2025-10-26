"use client";
import { isValidEmail } from "@fe/dashboard/utils/audience";
import type { AudienceGroup } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import * as FileFormatIcon from "@reloop/ui/file-format-icon";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import * as Table from "@reloop/ui/table";
import * as Tooltip from "@reloop/ui/tooltip";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

interface BulkImportAudience {
	email: string;
	firstName?: string;
	lastName?: string;
	status?: "subscribed" | "unsubscribed";
}

interface BulkImportError {
	email: string;
	error: string;
}

interface BulkImportResult {
	successful: number;
	failed: number;
	errors: BulkImportError[];
}

const BulkImportPage = () => {
	const { groupId, orgSlug } = useParams();
	const router = useRouter();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();

	const [csvData, setCsvData] = useState<BulkImportAudience[]>([]);
	const [importResult, setImportResult] = useState<BulkImportResult | null>(
		null,
	);
	const [isValidating, setIsValidating] = useState(false);

	const {
		data: groupData,
		error: groupError,
		isLoading: groupLoading,
	} = useSWR<AudienceGroup>(`/api/audience/v1/groups/get/${groupId}`, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const parseCSV = (csvText: string): BulkImportAudience[] => {
		const lines = csvText.split("\n").filter((line) => line.trim());
		if (lines.length === 0) return [];

		const headers =
			lines[0]?.split(",").map((h) => h.trim().toLowerCase()) || [];
		const data: BulkImportAudience[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i]?.split(",").map((v) => v.trim()) || [];
			const row: Record<string, string> = {};

			headers.forEach((header, index) => {
				const value = values[index] || "";
				if (value) {
					row[header] = value;
				}
			});

			// Map common column names
			const audience: BulkImportAudience = {
				email: row.email || row.e_mail || row.email_address || "",
				firstName:
					row.firstname || row.first_name || row.first || row.fname || "",
				lastName: row.lastname || row.last_name || row.last || row.lname || "",
				status: row.status === "unsubscribed" ? "unsubscribed" : "subscribed",
			};

			// Only add if email is present
			if (audience.email) {
				data.push(audience);
			}
		}

		return data;
	};

	const validateAudiences = (
		audiences: BulkImportAudience[],
	): BulkImportError[] => {
		const errors: BulkImportError[] = [];
		const seenEmails = new Set<string>();

		audiences.forEach((audience, index) => {
			// Check for duplicate emails in the import
			if (seenEmails.has(audience.email)) {
				errors.push({
					email: audience.email,
					error: "Duplicate email in import file",
				});
				return;
			}
			seenEmails.add(audience.email);

			// Validate email
			if (!isValidEmail(audience.email)) {
				errors.push({
					email: audience.email,
					error: "Invalid email format",
				});
			}

			// Check required fields
			if (!audience.email.trim()) {
				errors.push({
					email: `Row ${index + 2}`,
					error: "Email is required",
				});
			}
		});

		return errors;
	};

	const handleFileUpload = useCallback((files: File[]) => {
		const file = files[0];
		if (!file) return;

		if (!file.name.toLowerCase().endsWith(".csv")) {
			toast.error("Please select a CSV file");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const csvText = e.target?.result as string;
			const parsed = parseCSV(csvText);

			if (parsed.length === 0) {
				toast.error("No valid data found in CSV file");
				return;
			}

			if (parsed.length > 1000) {
				toast.error(
					"CSV file contains more than 1000 rows. Please split into smaller files.",
				);
				return;
			}

			setCsvData(parsed);
			setImportResult(null);
		};
		reader.readAsText(file);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: handleFileUpload,
		accept: {
			"text/csv": [".csv"],
		},
		multiple: false,
		maxFiles: 1,
	});

	const handleValidate = async () => {
		if (csvData.length === 0) {
			toast.error("Please upload a CSV file first");
			return;
		}

		setIsValidating(true);
		const errors = validateAudiences(csvData);

		setImportResult({
			successful: csvData.length - errors.length,
			failed: errors.length,
			errors,
		});
		setIsValidating(false);
	};

	const handleImport = async () => {
		if (csvData.length === 0) {
			toast.error("Please upload a CSV file first");
			return;
		}

		try {
			changeStatus("loading");
			const response = await axios.post(
				"/api/audience/v1/bulk-import",
				{
					audienceGroupId: groupId,
					audiences: csvData,
				},
				{ headers: { credentials: "include" } },
			);

			const result: BulkImportResult = response.data;
			setImportResult(result);

			if (result.successful > 0) {
				await mutate(`/api/audience/v1/list?audienceGroupId=${groupId}`);
				toast.success(`Successfully imported ${result.successful} audiences`);
			}

			if (result.failed > 0) {
				toast.error(`${result.failed} audiences failed to import`);
			}
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to import audiences"
				: "Failed to import audiences";
			toast.error(errorMessage);
		}
	};

	const downloadExampleCSV = () => {
		const exampleData = [
			["email", "firstName", "lastName", "status"],
			["john@example.com", "John", "Doe", "subscribed"],
			["jane@example.com", "Jane", "Smith", "subscribed"],
			["bob@example.com", "Bob", "Johnson", "unsubscribed"],
		];

		const csvContent = exampleData.map((row) => row.join(",")).join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "audience-import-example.csv";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const handleBack = () => {
		router.push(`/${orgSlug}/audience/${groupId}`);
	};

	if (groupLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (groupError || !groupData) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 p-8">
				<Icon name="alert-circle" className="h-12 w-12 text-red-500" />
				<h2 className="font-semibold text-xl">Failed to load audience group</h2>
				<p className="text-center text-text-sub-600">
					Unable to load the audience group. Please try again.
				</p>
				<Button.Root onClick={handleBack} variant="neutral" mode="stroke">
					<Icon name="arrow-left" className="h-4 w-4" />
					Back to Audience Group
				</Button.Root>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8">
			<Button.Root
				onClick={handleBack}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
			<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
				<div>
					<h1 className="font-medium text-title-h5 leading-8">
						Bulk Import Audience
					</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Import up to 1000 audiences to "{groupData.name}" from a CSV file
					</p>
				</div>

				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={downloadExampleCSV}
				>
					<Icon name="file-download" className="h-4 w-4" />
					Download Example
				</Button.Root>
			</div>
			<div className="my-6 gap-3">
				<div className="flex items-center gap-2">
					<h2 className="font-semibold text-lg">CSV File</h2>
					<Tooltip.Provider delayDuration={0}>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<button
									type="button"
									className="inline-flex items-center justify-center"
								>
									<Icon
										name="info-outline"
										className="h-3.5 w-3.5 text-text-sub-600"
									/>
								</button>
							</Tooltip.Trigger>
							<Tooltip.Content size="medium" variant="light" side="top">
								<div className="space-y-3">
									<p className="font-medium">CSV Format Requirements</p>
									<p className="text-sm">
										Use proper CSV format for best results
									</p>
									<div className="text-sm">
										<p className="mb-2 font-medium">Required columns:</p>
										<ul className="list-disc space-y-1 pl-4">
											<li>email (required)</li>
											<li>firstName (optional)</li>
											<li>lastName (optional)</li>
											<li>status (subscribed/unsubscribed)</li>
										</ul>
									</div>
								</div>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
				<p className="text-paragraph-sm text-text-sub-600">
					Upload a CSV file with audience data (email, firstName, lastName,
					status)
				</p>
			</div>
			<div className="flex gap-6">
				<div className="w-full space-y-3">
					<div>
						<div className="w-full max-w-[500px]">
							<FileUpload.Root
								{...getRootProps()}
								className={`transition-colors duration-200 ${
									isDragActive
										? "border-blue-400 bg-blue-50"
										: "border-stroke-sub-300"
								}`}
							>
								<input {...getInputProps()} />
								<FileUpload.Icon>
									<FileFormatIcon.Root format="CSV" color="green" />
								</FileUpload.Icon>
								<div className="space-y-2">
									<div className="font-medium text-sm text-text-strong-950">
										{isDragActive
											? "Drop the CSV file here..."
											: "Choose a CSV file or drag & drop it here."}
									</div>
									<div className="text-text-sub-600 text-xs">
										CSV format only, up to 1000 rows.
									</div>
								</div>
							</FileUpload.Root>
						</div>
					</div>

					{/* Preview Data */}
					{csvData.length > 0 && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg">
									Preview ({csvData.length} audiences)
								</h3>
								<div className="flex gap-3">
									<Button.Root
										variant="neutral"
										mode="stroke"
										size="small"
										onClick={handleValidate}
										disabled={isValidating}
									>
										{isValidating ? (
											<>
												<Spinner color="current" />
												Validating...
											</>
										) : (
											<>
												<Icon name="check-circle" className="h-4 w-4" />
												Validate
											</>
										)}
									</Button.Root>
									<Button.Root
										variant="primary"
										size="small"
										onClick={handleImport}
										disabled={status === "loading"}
									>
										{status === "loading" ? (
											<>
												<Spinner color="white" />
												Importing...
											</>
										) : (
											<>
												<Icon name="upload" className="h-4 w-4" />
												Import All
											</>
										)}
									</Button.Root>
								</div>
							</div>

							<div className="max-h-96 overflow-auto rounded-lg border border-stroke-soft-200">
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Email</Table.Head>
											<Table.Head>Name</Table.Head>
											<Table.Head>Status</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{csvData.slice(0, 20).map((audience, index) => (
											<Table.Row key={index}>
												<Table.Cell className="font-medium">
													{audience.email}
												</Table.Cell>
												<Table.Cell>
													{audience.firstName || audience.lastName
														? `${audience.firstName || ""} ${audience.lastName || ""}`.trim()
														: "—"}
												</Table.Cell>
												<Table.Cell>
													<span
														className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-xs ${
															audience.status === "subscribed"
																? "bg-green-100 text-green-800"
																: "bg-gray-100 text-gray-800"
														}`}
													>
														<Icon
															name={
																audience.status === "subscribed"
																	? "check-circle"
																	: "minus-circle"
															}
															className="h-3 w-3"
														/>
														{audience.status === "subscribed"
															? "Subscribed"
															: "Unsubscribed"}
													</span>
												</Table.Cell>
											</Table.Row>
										))}
										{csvData.length > 20 && (
											<Table.Row>
												<Table.Cell
													colSpan={3}
													className="text-center text-sm text-text-sub-600"
												>
													... and {csvData.length - 20} more
												</Table.Cell>
											</Table.Row>
										)}
									</Table.Body>
								</Table.Root>
							</div>
						</div>
					)}

					{/* Import Results */}
					{importResult && (
						<div className="space-y-4">
							<h3 className="font-semibold text-lg">Import Results</h3>
							<div className="rounded-lg border border-stroke-soft-200 p-6">
								<div className="mb-6 grid grid-cols-3 gap-6">
									<div className="text-center">
										<div className="font-bold text-3xl text-green-600">
											{importResult.successful}
										</div>
										<div className="text-sm text-text-sub-600">Successful</div>
									</div>
									<div className="text-center">
										<div className="font-bold text-3xl text-red-600">
											{importResult.failed}
										</div>
										<div className="text-sm text-text-sub-600">Failed</div>
									</div>
									<div className="text-center">
										<div className="font-bold text-3xl text-blue-600">
											{importResult.successful + importResult.failed}
										</div>
										<div className="text-sm text-text-sub-600">Total</div>
									</div>
								</div>

								{importResult.errors.length > 0 && (
									<div>
										<h4 className="mb-4 font-medium text-lg">Errors:</h4>
										<div className="max-h-48 space-y-2 overflow-auto">
											{importResult.errors.map((error, index) => (
												<div
													key={index}
													className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700"
												>
													<Icon name="alert-circle" className="h-4 w-4" />
													<span className="font-medium">{error.email}:</span>
													<span>{error.error}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default BulkImportPage;
