import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type ContactsExportFilters = {
	search?: string;
	status?: string;
	channelId?: string;
	groupId?: string;
};

type ExportStatus = "idle" | "exporting" | "success" | "error";

function filenameFromDisposition(
	header: string | null,
	fallback: string,
): string {
	if (!header) return fallback;
	const match = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(header);
	if (match?.[1]) {
		try {
			return decodeURIComponent(match[1].replace(/"/g, "").trim());
		} catch {
			return match[1].replace(/"/g, "").trim();
		}
	}
	return fallback;
}

/**
 * Single-flight CSV export against `GET /api/contacts/export`,
 * plus an emailed copy via `POST /api/contacts/export/email`.
 *
 * Why this exists: the old flow fetched `/list?limit=10000` as JSON and
 * built the CSV in memory — silently capped at 100 rows server-side, crashed
 * on large audiences, and every retry hammered the list API. The export
 * endpoint streams CSV server-side (rate-limited + single-flight per org);
 * this hook adds the client half of the anti-hammer flow:
 * - ignores repeat clicks while an export is running
 * - streams the body with progress + cancel support
 * - surfaces 429/404/413 with actionable messages
 * - fires a best-effort email copy (7-day signed link) alongside the download
 */
export function useContactsExport() {
	const [status, setStatus] = useState<ExportStatus>("idle");
	const [progress, setProgress] = useState(0);
	const [total, setTotal] = useState<number | null>(null);
	const [rowsExported, setRowsExported] = useState(0);
	const [exportError, setExportError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const exportingRef = useRef(false);

	const cancel = useCallback(() => {
		abortRef.current?.abort();
	}, []);

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	const startExport = useCallback(
		async (
			filters: ContactsExportFilters = {},
			opts: { silent?: boolean } = {},
		) => {
			if (exportingRef.current) {
				if (!opts.silent) toast.info("Export already in progress");
				return false;
			}
			exportingRef.current = true;
			const aborter = new AbortController();
			abortRef.current = aborter;
			setStatus("exporting");
			setProgress(0);
			setTotal(null);
			setRowsExported(0);
			setExportError(null);
			const toastId = opts.silent ? null : toast.loading("Preparing export…");

			try {
				const params = new URLSearchParams();
				if (filters.search) params.set("search", filters.search);
				if (filters.status) params.set("status", filters.status);
				if (filters.channelId) params.set("channelId", filters.channelId);
				if (filters.groupId) params.set("groupId", filters.groupId);

				const qs = params.toString();
				const response = await fetch(
					`/api/contacts/export${qs ? `?${qs}` : ""}`,
					{ credentials: "include", signal: aborter.signal },
				);

				if (response.status === 429) {
					const body = await response.json().catch(() => null);
					const fix =
						typeof body?.fix === "string" && body.fix.length > 0
							? body.fix
							: "Wait a bit before retrying.";
					throw new Error(`Export throttled. ${fix}`);
				}
				if (response.status === 404) {
					throw new Error("No contacts to export");
				}
				if (response.status === 413) {
					throw new Error(
						"Export too large — narrow filters and export in smaller batches.",
					);
				}
				if (!response.ok || !response.body) {
					throw new Error(`Export failed (${response.status})`);
				}

				const expected = Number(response.headers.get("X-Total-Count") || "0");
				const knownTotal =
					Number.isFinite(expected) && expected > 0 ? expected : null;
				if (knownTotal !== null) {
					setTotal(knownTotal);
					if (!opts.silent && toastId) {
						toast.loading(
							`Exporting ${knownTotal.toLocaleString()} contacts…`,
							{ id: toastId },
						);
					}
				}

				const reader = response.body.getReader();
				const chunks: BlobPart[] = [];
				const decoder = new TextDecoder();
				let newlineCount = 0;

				for (;;) {
					const { done, value } = await reader.read();
					if (done) break;
					if (value) {
						chunks.push(value);
						// Count CSV rows exactly: every row (incl. header) ends with \n.
						const text = decoder.decode(value, { stream: true });
						for (let i = 0; i < text.length; i++) {
							if (text[i] === "\n") newlineCount += 1;
						}
						const rows = Math.max(0, newlineCount - 1);
						setRowsExported(rows);
						if (knownTotal !== null && knownTotal > 0) {
							setProgress(Math.min(0.999, rows / knownTotal));
						}
					}
				}

				const blob = new Blob(chunks, { type: "text/csv;charset=utf-8;" });
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = filenameFromDisposition(
					response.headers.get("Content-Disposition"),
					`contacts_${new Date().toISOString().split("T")[0]}.csv`,
				);
				document.body.appendChild(link);
				link.click();
				link.remove();
				setTimeout(() => URL.revokeObjectURL(url), 30_000);

				setProgress(1);
				if (knownTotal !== null) setRowsExported(knownTotal);
				setStatus("success");
				if (!opts.silent && toastId) {
					toast.success("Contacts exported successfully", { id: toastId });
				}
				return true;
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					setStatus("idle");
					if (!opts.silent && toastId) {
						toast.dismiss(toastId);
						toast.info("Export cancelled");
					}
					return false;
				}
				const message =
					error instanceof Error ? error.message : "Failed to export contacts";
				setExportError(message);
				setStatus("error");
				if (!opts.silent && toastId) {
					toast.error(message, { id: toastId });
				}
				return false;
			} finally {
				exportingRef.current = false;
				if (abortRef.current === aborter) {
					abortRef.current = null;
				}
			}
		},
		[],
	);

	const isExporting = status === "exporting";

	/**
	 * Best-effort emailed copy of the same export. The server returns 202
	 * and sends a 7-day signed download link to the user's account email.
	 * Never throws — failures surface as toasts so the instant download
	 * stays the primary result.
	 */
	const requestEmailCopy = useCallback(
		async (filters: ContactsExportFilters = {}) => {
			try {
				const response = await fetch("/api/contacts/export/email", {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...(filters.search ? { search: filters.search } : {}),
						...(filters.status ? { status: filters.status } : {}),
						...(filters.channelId ? { channelId: filters.channelId } : {}),
						...(filters.groupId ? { groupId: filters.groupId } : {}),
					}),
				});
				if (response.status === 202) {
					const data = (await response.json()) as { recipient?: string };
					toast.success(
						data.recipient
							? `We'll also email a download link to ${data.recipient}`
							: "We'll also email you a download link",
					);
					return;
				}
				if (response.status === 429) {
					toast.info("Email copy throttled — your instant download continues");
					return;
				}
				if (response.status === 404) {
					return;
				}
				const body = await response.json().catch(() => null);
				const message = typeof body?.message === "string" ? body.message : null;
				toast.warning(
					message ?? "Couldn't queue the email copy — download continues",
				);
			} catch {
				toast.warning("Couldn't queue the email copy — download continues");
			}
		},
		[],
	);

	return {
		startExport,
		requestEmailCopy,
		cancel,
		isExporting,
		status,
		progress,
		total,
		rowsExported,
		exportError,
	};
}
