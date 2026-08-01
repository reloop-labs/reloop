import {
	createGlossaryTermOgImage,
	glossaryOgContentType,
	glossaryOgSize,
} from "@reloop/web/lib/landing/glossary/og-image";
import { term } from "@reloop/web/lib/landing/glossary/open-rate";

export const alt = `${term.title} | Email Glossary | Reloop`;
export const size = glossaryOgSize;
export const contentType = glossaryOgContentType;

export default async function OpenGraphImage() {
	return createGlossaryTermOgImage(term);
}
