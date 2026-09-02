// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { getLockedSourceHtml } from "./get-rendered-email-html";

describe("getLockedSourceHtml", () => {
	afterEach(() => {
		useEditorStore.setState({ htmlLocked: false, codeHtml: "" });
	});

	it("returns pasted source HTML when the code editor is locked", () => {
		useEditorStore.setState({
			htmlLocked: true,
			codeHtml: "<table align='center'><tr><td>Hello</td></tr></table>",
		});

		expect(getLockedSourceHtml()).toContain("Hello");
	});

	it("returns null when HTML is not locked", () => {
		useEditorStore.setState({
			htmlLocked: false,
			codeHtml: "<p>Composed</p>",
		});

		expect(getLockedSourceHtml()).toBeNull();
	});
});
