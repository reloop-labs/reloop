import { ImageResponse } from "next/og";
import { DomainWarmupCard, loadFonts, size } from "../domain-age/og/og-card";

export { contentType, size } from "../domain-age/og/og-card";
export const alt = "Free Domain Warmup Checker | Reloop";

export default async function OpenGraphImage() {
	return new ImageResponse(<DomainWarmupCard />, {
		...size,
		fonts: await loadFonts(),
	});
}
