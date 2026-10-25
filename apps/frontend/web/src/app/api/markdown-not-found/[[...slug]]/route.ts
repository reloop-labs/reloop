import { markdownNotFound } from "@reloop/web/lib/markdown-not-found";
import type { NextRequest } from "next/server";

/** Target of the `fallback` rewrite for unmatched paths requested as Markdown. */
export async function GET(
	_request: NextRequest,
	props: { params: Promise<{ slug?: string[] }> },
) {
	const { slug = [] } = await props.params;
	return markdownNotFound(`/${slug.join("/")}`);
}
