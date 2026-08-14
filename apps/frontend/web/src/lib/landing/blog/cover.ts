import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

const MIME_BY_EXT: Record<string, string> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
};

export type BlogCoverFile = {
	data: Buffer;
	contentType: string;
	byteLength: number;
};

function publicFileCandidates(publicPath: string) {
	const relative = publicPath.replace(/^\//, "");

	return [
		path.join(process.cwd(), "public", relative),
		path.join(process.cwd(), "apps/frontend/web/public", relative),
	];
}

export function blogCoverContentType(publicPath: string) {
	const ext = path.extname(publicPath).toLowerCase();
	return MIME_BY_EXT[ext] ?? null;
}

async function resolvePublicFilePath(publicPath: string) {
	for (const filePath of publicFileCandidates(publicPath)) {
		try {
			await access(filePath);
			return filePath;
		} catch {
			// try the next layout (local app cwd vs monorepo cwd)
		}
	}

	return null;
}

export async function readBlogCoverFile(
	publicPath: string,
): Promise<BlogCoverFile | null> {
	if (!publicPath.startsWith("/")) {
		return null;
	}

	const contentType = blogCoverContentType(publicPath);
	if (!contentType) {
		return null;
	}

	const filePath = await resolvePublicFilePath(publicPath);
	if (!filePath) {
		return null;
	}

	const data = await readFile(filePath);

	return {
		data,
		contentType,
		byteLength: data.byteLength,
	};
}

export async function statBlogCoverFile(publicPath: string) {
	const contentType = blogCoverContentType(publicPath);
	if (!contentType) {
		return null;
	}

	const filePath = await resolvePublicFilePath(publicPath);
	if (!filePath) {
		return null;
	}

	const info = await stat(filePath);

	return {
		contentType,
		byteLength: info.size,
	};
}
