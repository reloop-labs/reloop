import {
	compareOgContentType,
	compareOgSize,
	createCompareOgImage,
} from "../components/compare-og-image";

export const alt = "Reloop vs Loops";
export const size = compareOgSize;
export const contentType = compareOgContentType;

export default function OpenGraphImage() {
	return createCompareOgImage("/compare/loops");
}
