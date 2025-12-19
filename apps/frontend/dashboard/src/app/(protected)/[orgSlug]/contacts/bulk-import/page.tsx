"use client";
import { isValidEmail } from "@fe/dashboard/utils/audience";
import * as Button from "@reloop/ui/button";
import * as FileFormatIcon from "@reloop/ui/file-format-icon";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface BulkImportContact {
	email: string;
	firstName?: string;
	lastName?: string;
}

interface BulkImportResult {
	created: number;
	skipped: number;
	errors: Array<{ email: string; reason: string }>;
}

const BulkImportPage = () => {
	const { orgSlug } = useParams();
	const router = useRouter();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();

	const [csvData, setCsvData] = useState<BulkImportContact[]>([]);
	const [importResult, setImportResult] = useState<BulkImportResult | null>(
		null,
	);
	const [validationErrors, setValidationErrors] = useState<
		Array<{ email: string; error: string }>
	>([]);

	const parseCSV = (csvText: string): BulkImportContact[] => {
		const lines = csvText.split("\n").filter((line) => line.trim());
		if (lines.length === 0) return [];

		const headers =
			lines[0]
				?.split(",")
				.map((h) => h.trim().toLowerCase().replace(/"/g, "")) || [];
		const data: BulkImportContact[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values =
				lines[i]?.split(",").map((v) => v.trim().replace(/"/g, "")) || [];
			const row: Record<string, string> = {};

			headers.forEach((header, index) => {
				const value = values[index] || "";
				if (value) row[header] = value;
			});

			const contact: BulkImportContact = {
				email: row.email || row.e_mail || row.email_address || "",
				firstName:
					row.firstname || row.first_name || row.first || row.fname || "",
				lastName: row.lastname || row.last_name || row.last || row.lname || "",
			};

			if (contact.email) data.push(contact);
		}

		return data;
	};

	const validateContacts = (contacts: BulkImportContact[]) => {
		const errors: Array<{ email: string; error: string }> = [];
		const seenEmails = new Set<string>();

		contacts.forEach((contact) => {
			if (seenEmails.has(contact.email)) {
				errors.push({ email: contact.email, error: "Duplicate email" });
				return;
			}
			seenEmails.add(contact.email);
			if (!isValidEmail(contact.email)) {
				errors.push({ email: contact.email, error: "Invalid email format" });
			}
		});

		return errors;
	};

	const handleFileUpload = useCallback(
		(files: File[]) => {
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
					toast.error("CSV file contains more than 1000 rows");
					return;
				}

				setCsvData(parsed);
				setImportResult(null);
				setValidationErrors(validateContacts(parsed));
			};
			reader.readAsText(file);
		},
		[parseCSV, validateContacts],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: handleFileUpload,
		accept: { "text/csv": [".csv"] },
		multiple: false,
		maxFiles: 1,
	});

	const handleImport = async () => {
		if (csvData.length === 0) {
			toast.error("Please upload a CSV file first");
			return;
		}

		try {
			changeStatus("loading");

			const response = await axios.post(
				"/api/contacts/v1/contacts/bulk-import",
				{ contacts: csvData },
				{ withCredentials: true },
			);
			const result: BulkImportResult = response.data;

			setImportResult(result);

			if (result.created > 0) {
				await mutate(
					(key: string) =>
						typeof key === "string" &&
						key.includes("/api/contacts/v1/contacts/list"),
				);
				toast.success(`Successfully imported ${result.created} contacts`);
			}
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to import"
				: "Failed to import";
			toast.error(errorMessage);
		} finally {
			changeStatus("idle");
		}
	};

	const handleBack = () => {
		router.push(`/${orgSlug}/contacts`);
	};

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
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
						Bulk Import Contacts
					</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Import up to 1000 contacts from a CSV file
					</p>
				</div>
			</div>

			<div className="my-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-lg">CSV File</h2>
						<p className="text-paragraph-sm text-text-sub-600">
							Upload a CSV file with contact data (email, firstName, lastName)
						</p>
					</div>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => {
							const sampleCSV = `email,firstName,lastName
john.doe@example.com,John,Doe
jane.smith@example.com,Jane,Smith
bob.wilson@example.com,Bob,Wilson`;
							const blob = new Blob([sampleCSV], {
								type: "text/csv;charset=utf-8;",
							});
							const link = document.createElement("a");
							link.href = URL.createObjectURL(blob);
							link.download = "contacts_sample.csv";
							link.click();
							URL.revokeObjectURL(link.href);
						}}
					>
						<Icon name="file-download" className="h-4 w-4" />
						Download Sample
					</Button.Root>
				</div>
			</div>

			<div className="space-y-3">
				<div
					{...getRootProps()}
					className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-stroke-sub-100 border-dashed p-8 transition-colors duration-200 ${
						isDragActive
							? "border-blue-400 bg-blue-50"
							: "border-stroke-sub-300 hover:border-stroke-sub-400"
					}`}
				>
					<input {...getInputProps()} />
					<FileFormatIcon.Root format="CSV" color="green" />
					<div className="space-y-2 text-center">
						<div className="font-medium text-sm text-text-strong-950">
							{isDragActive
								? "Drop the CSV file here..."
								: "Choose a CSV file or drag & drop it here."}
						</div>
						<div className="text-text-sub-600 text-xs">
							CSV format only, up to 1000 rows.
						</div>
					</div>
				</div>

				{csvData.length > 0 && !importResult && (
					<div className="mt-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-lg">
								Preview ({csvData.length} contacts)
							</h3>
							<Button.Root
								variant="neutral"
								size="small"
								onClick={handleImport}
								disabled={status === "loading"}
							>
								{status === "loading" ? (
									<>
										<Spinner color="currentColor" />
										Importing...
									</>
								) : (
									<>
										<Icon name="file-upload" className="h-4 w-4" />
										Import All
									</>
								)}
							</Button.Root>
						</div>

						{validationErrors.length > 0 && (
							<div className="rounded-lg border border-red-200 bg-red-50 p-4">
								<div className="mb-2 flex items-center gap-2">
									<Icon name="alert-circle" className="h-4 w-4 text-red-600" />
									<span className="font-medium text-red-800">
										{validationErrors.length} validation errors
									</span>
								</div>
							</div>
						)}

						<div className="max-h-64 overflow-auto rounded-lg border border-stroke-soft-200">
							{csvData.slice(0, 10).map((contact, i) => (
								<div
									key={i}
									className="flex items-center justify-between border-stroke-soft-200 border-b p-3 last:border-b-0"
								>
									<span className="font-medium text-sm">{contact.email}</span>
									<span className="text-sm text-text-sub-600">
										{contact.firstName || contact.lastName
											? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
											: "—"}
									</span>
								</div>
							))}
							{csvData.length > 10 && (
								<div className="p-3 text-center text-sm text-text-sub-600">
									... and {csvData.length - 10} more
								</div>
							)}
						</div>
					</div>
				)}

				{importResult && (
					<div className="mt-6 space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Icon
									name="check-circle"
									className="h-5 w-5 text-success-base"
								/>
								<h3 className="font-semibold text-lg">Import Complete</h3>
							</div>
							<Button.Root onClick={handleBack} variant="neutral" size="small">
								Continue
								<Button.Icon>
									<Icon name="chevron-right" className="h-4 w-4" />
								</Button.Icon>
							</Button.Root>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="rounded-xl border border-stroke-soft-200 p-6">
								<div className="mb-2 flex items-center gap-2">
									<Icon
										name="check-circle"
										className="h-4 w-4 text-success-base"
									/>
									<span className="font-medium text-sm text-success-base">
										Created
									</span>
								</div>
								<div className="font-bold text-2xl text-success-base">
									{importResult.created}
								</div>
							</div>
							<div className="rounded-xl border border-stroke-soft-200 p-6">
								<div className="mb-2 flex items-center gap-2">
									<Icon
										name="minus-circle"
										className="h-4 w-4 text-text-sub-600"
									/>
									<span className="font-medium text-sm text-text-sub-600">
										Skipped
									</span>
								</div>
								<div className="font-bold text-2xl text-text-sub-600">
									{importResult.skipped}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default BulkImportPage;
