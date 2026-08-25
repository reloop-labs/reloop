import { UploadErrors } from "@be/upload/error/upload.error-response";
import { parseUploadObjectKey } from "@be/upload/lib/parse-upload-key";
import { storage } from "@be/upload/lib/storage";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export type FileContentLookup = {
	findByPath: (
		key: string,
	) => Promise<{ path: string; mimeType: string } | null>;
	download: (key: string) => Promise<Buffer>;
};

export async function getFileContentByPath(
	rawPath: string,
	deps: FileContentLookup,
): Promise<{ bytes: Buffer; mimeType: string }> {
	const key = parseUploadObjectKey(rawPath);
	if (!key) {
		throw UploadErrors.fileNotFound(rawPath);
	}

	const record = await deps.findByPath(key);
	if (!record) {
		throw UploadErrors.fileNotFound(key);
	}

	const bytes = await deps.download(record.path);
	return { bytes, mimeType: record.mimeType };
}

async function findLiveUploadByPath(key: string, userId?: string) {
	const rows = await db
		.select({
			path: schema.upload.path,
			mimeType: schema.upload.mimeType,
		})
		.from(schema.upload)
		.where(
			and(
				eq(schema.upload.path, key),
				...(userId ? [eq(schema.upload.userId, userId)] : []),
				isNull(schema.upload.deletedAt),
			),
		)
		.limit(1);
	return rows[0] ?? null;
}

export async function getFileContentHandler(
	rawPath: string,
	userId: string,
	opts?: { anyUser?: boolean },
) {
	return getFileContentByPath(rawPath, {
		findByPath: async (key) => {
			const owned = await findLiveUploadByPath(key, userId);
			if (owned || !opts?.anyUser) return owned;
			return findLiveUploadByPath(key);
		},
		download: (key) => storage.download(key),
	});
}
