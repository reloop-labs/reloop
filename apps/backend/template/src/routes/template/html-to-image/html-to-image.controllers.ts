import {
	contentTypeFor,
	parseHtmlToImageRequest,
} from "@be/template/utils/html-document";
import { renderHtmlToImage } from "@be/template/utils/html-to-image";

export async function htmlToImage(params: {
	html: string;
	width?: number;
	format?: string;
	quality?: number;
	scale?: number;
}) {
	const request = parseHtmlToImageRequest(params);
	const bytes = await renderHtmlToImage(request);

	return {
		bytes,
		contentType: contentTypeFor(request.format),
		format: request.format,
		width: request.width,
	};
}
