import "server-only";

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { BlogPostDefinition } from "../types";

/**
 * Tiny blurred previews for blog covers. `next/image` only derives a
 * `blurDataURL` for static imports; covers come from frontmatter strings, so
 * we build one per file (16px wide, ~200 bytes) and cache it by mtime.
 */
const cache = new Map<string, { mtimeMs: number; dataUrl: string }>();

async function blurDataUrlFor(publicPath: string): Promise<string | undefined> {
	if (!publicPath.startsWith("/")) return undefined;

	const filePath = path.join(process.cwd(), "public", publicPath.slice(1));

	try {
		const { mtimeMs } = await stat(filePath);
		const cached = cache.get(filePath);
		if (cached && cached.mtimeMs === mtimeMs) return cached.dataUrl;

		const buffer = await sharp(await readFile(filePath))
			.resize(16)
			.webp({ quality: 60 })
			.toBuffer();
		const dataUrl = `data:image/webp;base64,${buffer.toString("base64")}`;

		cache.set(filePath, { mtimeMs, dataUrl });
		return dataUrl;
	} catch {
		// Missing or unreadable image: render without a placeholder.
		return undefined;
	}
}

export async function withBlurPlaceholders<T extends BlogPostDefinition>(
	posts: T[],
): Promise<T[]> {
	return Promise.all(
		posts.map(async (post) =>
			post.image
				? { ...post, imageBlurDataURL: await blurDataUrlFor(post.image) }
				: post,
		),
	);
}

export async function withBlurPlaceholder<T extends BlogPostDefinition>(
	post: T,
): Promise<T> {
	const [result] = await withBlurPlaceholders([post]);
	return result ?? post;
}
