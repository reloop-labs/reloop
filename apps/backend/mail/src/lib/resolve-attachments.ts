import { type PinnedTransport, requestPinned } from "@reloop/webhook-delivery";
import { mailConfig } from "../mail.config";
import { MailErrors } from "./errors";

const UPLOAD_KEY_RE = /(?:^|\/)(uploads\/\d{4}\/\d{2}\/[A-Za-z0-9._-]+)$/;
/** Fallback only — callers must pass the org's plan limit explicitly. */
export const DEFAULT_MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export type SendAttachment = {
	content?: string | Buffer | import("stream").Readable;
	filename?: string;
	path?: string;
	content_type?: string;
	content_id?: string;
};

export type MaterializedAttachment = {
	filename?: string;
	content: string | Buffer | import("stream").Readable;
	contentType?: string;
	cid?: string;
	path?: undefined;
};

export type RemoteAttachmentStore = {
	get: (key: string) => Promise<Buffer>;
};

export type UploadServiceStoreOptions = {
	cookie?: string | null;
	apiKey?: string | null;
	internalSecret?: string | null;
	userId?: string | null;
	organizationId?: string | null;
	/** Per-plan cap (organization_plan.max_attachment_bytes). */
	maxBytes?: number;
	/** Test override. Production uses `${BASE_URL}/api/upload`. */
	baseUrl?: string;
	fetchImpl?: typeof fetch;
};

export function s3KeyFromAttachmentPath(path: string): string | null {
	const trimmed = path.trim().split("?")[0] ?? "";
	const withoutAppPrefix = trimmed.replace(/^\/app\//, "");
	const match = withoutAppPrefix.match(UPLOAD_KEY_RE);
	return match?.[1] ?? null;
}

function isHttpUrl(value: string): boolean {
	return /^https?:\/\//i.test(value.trim());
}

/** Public HTTPS hosts only — never fetch local MinIO / Docker URLs. */
export function isPublicAttachmentUrl(value: string): boolean {
	if (!isHttpUrl(value)) return false;
	try {
		const host = new URL(value).hostname.toLowerCase();
		if (
			host === "localhost" ||
			host === "127.0.0.1" ||
			host === "0.0.0.0" ||
			host === "::1" ||
			host.endsWith(".local") ||
			host.endsWith(".internal") ||
			host === "minio" ||
			host === "reloop-minio" ||
			host.endsWith(".localhost")
		) {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}

async function fetchBytes(
	url: string,
	fetchImpl: typeof fetch = fetch,
	headers?: HeadersInit,
	maxBytes: number = DEFAULT_MAX_ATTACHMENT_BYTES,
): Promise<Buffer> {
	const response = await fetchImpl(url, {
		redirect: "follow",
		headers: {
			"user-agent": "ReloopMail/1.0",
			...headers,
		},
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} fetching ${url}`);
	}
	const bytes = Buffer.from(await response.arrayBuffer());
	if (bytes.byteLength > maxBytes) {
		throw new Error(
			`Attachment exceeds ${maxBytes} bytes (${bytes.byteLength})`,
		);
	}
	return bytes;
}

export async function fetchPublicAttachment(
	url: string,
	transport: PinnedTransport = requestPinned,
	maxBytes: number = DEFAULT_MAX_ATTACHMENT_BYTES,
): Promise<Buffer> {
	if (!isPublicAttachmentUrl(url)) {
		throw new Error(`attachment URL is not a public http(s) address: ${url}`);
	}
	const response = await transport({
		url,
		method: "GET",
		allowHttp: true,
		maxBytes,
		headers: { "user-agent": "ReloopMail/1.0" },
	});
	if (response.status < 200 || response.status >= 300) {
		throw new Error(`HTTP ${response.status} fetching ${url}`);
	}
	return response.bodyBuffer;
}

export function createUploadServiceStore(
	opts: UploadServiceStoreOptions,
): RemoteAttachmentStore {
	const baseUrl = (
		opts.baseUrl ?? `${mailConfig.BASE_URL.replace(/\/+$/, "")}/api/upload`
	).replace(/\/+$/, "");
	const fetchImpl = opts.fetchImpl ?? fetch;
	const cookie = opts.cookie?.trim() || "";
	const apiKey = opts.apiKey?.trim() || "";
	const internalSecret = opts.internalSecret?.trim() || "";
	const userId = opts.userId?.trim() || "";
	const organizationId = opts.organizationId?.trim() || "";
	const hasInternalAuth = Boolean(internalSecret && userId && organizationId);
	const maxBytes = opts.maxBytes ?? DEFAULT_MAX_ATTACHMENT_BYTES;

	return {
		async get(key: string) {
			if (!cookie && !apiKey && !hasInternalAuth) {
				throw new Error(
					"Upload service request is missing the session cookie (or API key)",
				);
			}
			const url = `${baseUrl}/v1/files/content?path=${encodeURIComponent(key)}`;
			return fetchBytes(
				url,
				fetchImpl,
				{
					...(cookie ? { cookie } : {}),
					...(apiKey ? { "x-api-key": apiKey } : {}),
					...(hasInternalAuth
						? {
								"x-internal-secret": internalSecret,
								"x-user-id": userId,
								"x-organization-id": organizationId,
							}
						: {}),
				},
				maxBytes,
			);
		},
	};
}

async function loadPathBytes(
	path: string,
	store: RemoteAttachmentStore,
	transport: PinnedTransport,
	maxBytes: number = DEFAULT_MAX_ATTACHMENT_BYTES,
): Promise<Buffer> {
	const key = s3KeyFromAttachmentPath(path);
	if (key) {
		try {
			return await store.get(key);
		} catch (error) {
			if (isPublicAttachmentUrl(path)) {
				return fetchPublicAttachment(path, transport, maxBytes);
			}
			throw error;
		}
	}

	if (isPublicAttachmentUrl(path)) {
		return fetchPublicAttachment(path, transport, maxBytes);
	}

	throw new Error("attachment path must be an upload key or a public URL");
}

export async function materializeAttachments(
	attachments: SendAttachment[],
	store: RemoteAttachmentStore,
	transport: PinnedTransport = requestPinned,
	opts?: { maxBytes?: number; planId?: string },
): Promise<MaterializedAttachment[]> {
	const maxBytes = opts?.maxBytes ?? DEFAULT_MAX_ATTACHMENT_BYTES;
	const planId = opts?.planId ?? "unknown";
	return Promise.all(
		attachments.map(async (att) => {
			if (
				att.content !== undefined &&
				att.content !== null &&
				att.content !== ""
			) {
				const size = Buffer.isBuffer(att.content)
					? att.content.byteLength
					: typeof att.content === "string"
						? Buffer.byteLength(att.content, "utf8")
						: 0;
				if (size > maxBytes) {
					throw MailErrors.attachmentTooLarge({
						filename: att.filename ?? "(unnamed)",
						actualBytes: size,
						limitBytes: maxBytes,
						planId,
					});
				}
				return {
					filename: att.filename,
					content: att.content,
					contentType: att.content_type,
					cid: att.content_id,
				};
			}

			if (!att.path) {
				throw MailErrors.attachmentLoadFailed(
					att.filename ?? "(unnamed)",
					"attachment is missing both content and path",
				);
			}

			try {
				const content = await loadPathBytes(
					att.path,
					store,
					transport,
					maxBytes,
				);
				if (content.byteLength > maxBytes) {
					throw MailErrors.attachmentTooLarge({
						filename: att.filename ?? att.path,
						actualBytes: content.byteLength,
						limitBytes: maxBytes,
						planId,
					});
				}
				return {
					filename: att.filename,
					content,
					contentType: att.content_type,
					cid: att.content_id,
				};
			} catch (error) {
				// Preserve plan-limit 413s; wrap only fetch failures.
				if (
					error instanceof Error &&
					(error as { status?: number }).status === 413
				) {
					throw error;
				}
				const reason = error instanceof Error ? error.message : String(error);
				if (reason.startsWith("Attachment exceeds")) {
					throw MailErrors.attachmentTooLarge({
						filename: att.filename ?? att.path ?? "(unnamed)",
						actualBytes: maxBytes + 1,
						limitBytes: maxBytes,
						planId,
					});
				}
				throw MailErrors.attachmentLoadFailed(att.path, reason);
			}
		}),
	);
}
