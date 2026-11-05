import { EDITOR_THEMES, getEmailTheming } from "@react-email/editor/plugins";
import type { Editor } from "@tiptap/core";

type StyleInput = {
	prop?: string;
	classReference?: string;
	value?: unknown;
};
type StyleGroup = { classReference?: string; inputs?: StyleInput[] };

function findIn(
	groups: readonly StyleGroup[],
	classReference: string,
	prop: string,
): unknown {
	for (const group of groups) {
		for (const input of group.inputs ?? []) {
			const ref = input.classReference ?? group.classReference;
			if (ref !== classReference || input.prop !== prop) continue;
			if (
				input.value !== undefined &&
				input.value !== null &&
				input.value !== ""
			)
				return input.value;
		}
	}
	return undefined;
}

/**
 * Global (Page style) value that actually renders: the template's saved
 * styles, then the active theme. Unlike react-email's `findStyleValue`, it
 * never falls back to generic control defaults (8px radius, 1px border,
 * 400px height) that neither the canvas nor the sent email use.
 */
export function getGlobalStyleValue(
	editor: Editor | null | undefined,
	classReference: string,
	prop: string,
): unknown {
	if (!editor) return undefined;
	const theming = getEmailTheming(editor as never) as {
		styles?: StyleGroup[];
		theme?: string;
	} | null;
	// `theming.styles` is the saved styles merged over the theme.
	const merged = findIn(theming?.styles ?? [], classReference, prop);
	if (merged !== undefined) return merged;
	const themeGroups = (EDITOR_THEMES as Record<string, StyleGroup[]>)[
		theming?.theme ?? "basic"
	];
	return findIn(themeGroups ?? [], classReference, prop);
}

/** True when the template itself (not the theme) sets this value. */
export function hasSavedGlobalStyle(
	editor: Editor | null | undefined,
	classReference: string,
	prop: string,
): boolean {
	if (!editor) return false;
	// Read the document itself: getEmailTheming fills in theme defaults.
	let saved: StyleGroup[] = [];
	editor.state.doc.descendants((node) => {
		if (node.type.name !== "globalContent") return true;
		const styles = (node.attrs?.data as { styles?: unknown } | undefined)
			?.styles;
		if (Array.isArray(styles)) saved = styles as StyleGroup[];
		return false;
	});
	return findIn(saved, classReference, prop) !== undefined;
}

/**
 * Templates that never chose a body alignment inherit the theme's `left`,
 * yet the canvas always showed them centered, so the sent email did not
 * match what was designed. Pin those to `center`, the layout people saw.
 * Returns true when the document was changed.
 */
export function pinUnsetContainerAlignment(
	editor: Editor | null | undefined,
): boolean {
	if (!editor || hasSavedGlobalStyle(editor, "container", "align"))
		return false;
	const theming = getEmailTheming(editor as never) as {
		styles?: StyleGroup[];
		theme?: string;
	} | null;
	const styles = [...(theming?.styles ?? [])] as Array<
		StyleGroup & { id?: string }
	>;
	const index = styles.findIndex(
		(group) => group.id === "container" || group.classReference === "container",
	);
	const pinAlign = (inputs: StyleInput[] = []) => {
		const rest = inputs.filter((input) => input.prop !== "align");
		return [
			{
				...(inputs.find((input) => input.prop === "align") ?? {}),
				label: "Align",
				type: "select",
				prop: "align",
				classReference: "container",
				value: "center",
			},
			...rest,
		];
	};
	if (index >= 0) {
		const group = styles[index] as StyleGroup;
		styles[index] = { ...group, inputs: pinAlign(group.inputs) };
	} else {
		const themeGroup = (
			(EDITOR_THEMES as Record<string, Array<StyleGroup & { id?: string }>>)[
				theming?.theme ?? "basic"
			] ?? []
		).find((group) => group.id === "container");
		if (!themeGroup) return false;
		styles.push({ ...themeGroup, inputs: pinAlign(themeGroup.inputs) });
	}
	return editor.commands.setGlobalContent("styles", styles);
}
