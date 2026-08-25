const UPLOAD_KEY_RE = /(?:^|\/)(uploads\/\d{4}\/\d{2}\/[A-Za-z0-9._-]+)$/;

/** Storage key used by the upload service (`uploads/YYYY/MM/<id>.<ext>`). */
export function parseUploadObjectKey(path: string): string | null {
	const trimmed = path.trim().split("?")[0] ?? "";
	const withoutAppPrefix = trimmed.replace(/^\/app\//, "");
	const match = withoutAppPrefix.match(UPLOAD_KEY_RE);
	return match?.[1] ?? null;
}
