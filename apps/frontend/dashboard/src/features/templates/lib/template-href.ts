/** Template IDs are `tmpl_…`; slugs can't contain `_`, so the two never collide. */
export function isTemplateId(value: string): boolean {
	return value.startsWith("tmpl_");
}

/** Editor URL for a template: readable slug when known, ID otherwise (the editor redirects). */
export function templateHref(template: { id: string; slug?: string | null }) {
	return `/templates/${template.slug || template.id}`;
}
