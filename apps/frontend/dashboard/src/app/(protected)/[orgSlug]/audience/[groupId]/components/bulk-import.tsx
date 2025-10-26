"use client";
import { isValidEmail } from "@fe/dashboard/utils/audience";
import * as Button from "@reloop/ui/button";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Table from "@reloop/ui/table";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

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

interface BulkImportProps {
	groupId: string;
	groupName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const BulkImport = ({
	groupId,
	groupName,
	open,
	onOpenChange,
}: BulkImportProps) => {
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const [csvData, setCsvData] = useState<BulkImportAudience[]>([]);
	const [importResult, setImportResult] = useState<BulkImportResult | null>(
		null,
	);
	const [isValidating, setIsValidating] = useState(false);

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

	const handleCancel = () => {
		setCsvData([]);
		setImportResult(null);
		onOpenChange(false);
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

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-4xl">
				<Modal.Header>
					<Modal.Title>Bulk Import Audience to "{groupName}"</Modal.Title>
					<Modal.Description>
						Import up to 1000 audiences from a CSV file. Download the example
						template to see the required format.
					</Modal.Description>
				</Modal.Header>

				<div className="space-y-6">
					{/* File Upload */}
					<div>
						<Label.Root className="mb-2 block font-medium text-gray-700 text-sm">
							CSV File
							<Label.Asterisk />
						</Label.Root>
						<div className="flex items-center gap-4">
							<div className="w-full max-w-[400px]">
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
										<Icon name="upload-cloud" className="h-6 w-6" />
									</FileUpload.Icon>
									<div className="space-y-1.5">
										<div className="text-label-sm text-text-strong-950">
											{isDragActive
												? "Drop the CSV file here..."
												: "Choose a CSV file or drag & drop it here."}
										</div>
										<div className="text-paragraph-xs text-text-sub-600">
											CSV format only, up to 1000 rows.
										</div>
									</div>
									<FileUpload.Button>Browse File</FileUpload.Button>
								</FileUpload.Root>
							</div>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={downloadExampleCSV}
							>
								<Icon name="download" className="h-4 w-4" />
								Download Example
							</Button.Root>
						</div>
						<p className="mt-2 text-sm text-text-sub-600">
							CSV should include columns: email, firstName, lastName, status
						</p>
					</div>

					{/* Preview Data */}
					{csvData.length > 0 && (
						<div>
							<div className="mb-4 flex items-center justify-between">
								<h3 className="font-medium text-lg">
									Preview ({csvData.length} audiences)
								</h3>
								<div className="flex gap-2">
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
										variant="neutral"
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

							<div className="max-h-64 overflow-auto rounded-lg border border-stroke-soft-200">
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Email</Table.Head>
											<Table.Head>Name</Table.Head>
											<Table.Head>Status</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{csvData.slice(0, 10).map((audience, index) => (
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
										{csvData.length > 10 && (
											<Table.Row>
												<Table.Cell
													colSpan={3}
													className="text-center text-sm text-text-sub-600"
												>
													... and {csvData.length - 10} more
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
						<div className="rounded-lg border border-stroke-soft-200 p-4">
							<h3 className="mb-4 font-medium text-lg">Import Results</h3>
							<div className="mb-4 grid grid-cols-3 gap-4">
								<div className="text-center">
									<div className="font-bold text-2xl text-green-600">
										{importResult.successful}
									</div>
									<div className="text-sm text-text-sub-600">Successful</div>
								</div>
								<div className="text-center">
									<div className="font-bold text-2xl text-red-600">
										{importResult.failed}
									</div>
									<div className="text-sm text-text-sub-600">Failed</div>
								</div>
								<div className="text-center">
									<div className="font-bold text-2xl text-blue-600">
										{importResult.successful + importResult.failed}
									</div>
									<div className="text-sm text-text-sub-600">Total</div>
								</div>
							</div>

							{importResult.errors.length > 0 && (
								<div>
									<h4 className="mb-2 font-medium">Errors:</h4>
									<div className="max-h-32 space-y-1 overflow-auto">
										{importResult.errors.map((error, index) => (
											<div
												key={index}
												className="flex items-center gap-2 text-red-600 text-sm"
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
					)}
				</div>

				<Modal.Footer className="flex gap-2">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						onClick={handleCancel}
						disabled={status === "loading"}
					>
						{importResult ? "Close" : "Cancel"}
					</Button.Root>
					{!importResult && csvData.length > 0 && (
						<Button.Root
							type="button"
							variant="neutral"
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
					)}
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
