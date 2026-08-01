import { term } from "@reloop/web/lib/landing/glossary/soft-bounce";
import {
	createGlossaryTermOgImage,
	glossaryOgContentType,
	glossaryOgSize,
} from "@reloop/web/lib/landing/glossary/og-image";

export const alt = `${term.title} | Email Glossary | Reloop`;
export const size = glossaryOgSize;
export const contentType = glossaryOgContentType;

export default async function OpenGraphImage() {
	return createGlossaryTermOgImage(term);
}
