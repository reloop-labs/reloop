import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { mailConfig } from "../mail.config";
import { MailErrors } from "./errors";

const UPLOAD_KEY_RE = /(?:^|\/)(uploads\/\d{4}\/\d{2}\/[A-Za-z0-9._-]+)$/;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

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

async function fetchBytes(
	url: string,
	fetchImpl: typeof fetch = fetch,
	headers?: HeadersInit,
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
	if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
		throw new Error(
			`Attachment exceeds ${MAX_ATTACHMENT_BYTES} bytes (${bytes.byteLength})`,
		);
	}
	return bytes;
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

	return {
		async get(key: string) {
			if (!cookie && !apiKey) {
				throw new Error(
					"Upload service request is missing the session cookie (or API key)",
				);
			}
			const url = `${baseUrl}/v1/files/content?path=${encodeURIComponent(key)}`;
			return fetchBytes(url, fetchImpl, {
				...(cookie ? { cookie } : {}),
				...(apiKey ? { "x-api-key": apiKey } : {}),
			});
		},
	};
}

async function loadPathBytes(
	path: string,
	store: RemoteAttachmentStore,
): Promise<Buffer> {
	if (existsSync(path)) {
		return readFile(path);
	}

	const key = s3KeyFromAttachmentPath(path);
	if (key) {
		try {
			return await store.get(key);
		} catch (error) {
			if (isHttpUrl(path)) {
				return fetchBytes(path);
			}
			throw error;
		}
	}

	if (isHttpUrl(path)) {
		return fetchBytes(path);
	}

	throw new Error(`no such file or directory, open '${path}'`);
}

export async function materializeAttachments(
	attachments: SendAttachment[],
	store: RemoteAttachmentStore,
): Promise<MaterializedAttachment[]> {
	return Promise.all(
		attachments.map(async (att) => {
			if (
				att.content !== undefined &&
				att.content !== null &&
				att.content !== ""
			) {
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
				const content = await loadPathBytes(att.path, store);
				return {
					filename: att.filename,
					content,
					contentType: att.content_type,
					cid: att.content_id,
				};
			} catch (error) {
				const reason = error instanceof Error ? error.message : String(error);
				throw MailErrors.attachmentLoadFailed(att.path, reason);
			}
		}),
	);
}
