// @vitest-environment jsdom

import fs from "node:fs";
import path from "node:path";
import { EmailTheming } from "@react-email/editor/plugins";
import { Editor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import Placeholder from "@tiptap/extension-placeholder";
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { emailStarterKit } from "../../utils/email-starter-kit";

describe("email-canvas alignment", () => {
	it("centers empty collaborative editor paragraph under header", () => {
		const cssPath = path.resolve(__dirname, "./email-canvas.css");
		const cssContent = fs.readFileSync(cssPath, "utf-8");
		const styleEl = document.createElement("style");
		styleEl.textContent = cssContent;
		document.head.appendChild(styleEl);

		const el = document.createElement("div");
		document.body.appendChild(el);

		const ydoc = new Y.Doc();

		const editor = new Editor({
			element: el,
			extensions: [
				emailStarterKit(),
				EmailTheming,
				Placeholder.configure({
					placeholder: "Press / for commands...",
					showOnlyWhenEditable: true,
					includeChildren: true,
					// biome-ignore lint/suspicious/noExplicitAny: tiptap package type variance
				}) as any,
				Collaboration.configure({
					document: ydoc,
					field: "email-content",
				}),
			],
		});

		const pNode = el.querySelector(".node-paragraph") as HTMLElement;
		const computed = window.getComputedStyle(pNode);
		expect(computed.getPropertyValue("max-width")).toBe(
			"var(--email-container-width, 600px)",
		);
		expect(computed.getPropertyValue("margin-left")).toBe("auto");
		expect(computed.getPropertyValue("margin-right")).toBe("auto");

		editor.destroy();
		el.remove();
	});

	it("centers container node when present", () => {
		const el = document.createElement("div");
		document.body.appendChild(el);

		const editor = new Editor({
			element: el,
			content: {
				type: "doc",
				content: [
					{
						type: "container",
						content: [{ type: "paragraph" }],
					},
				],
			},
			extensions: [
				emailStarterKit(),
				EmailTheming,
				Placeholder.configure({
					placeholder: "Press / for commands...",
					showOnlyWhenEditable: true,
					includeChildren: true,
					// biome-ignore lint/suspicious/noExplicitAny: tiptap package type variance
				}) as any,
			],
		});

		const containerNode = el.querySelector(".node-container") as HTMLElement;
		const computed = window.getComputedStyle(containerNode);
		expect(computed.getPropertyValue("max-width")).toBe(
			"var(--email-container-width, 600px)",
		);
		expect(computed.getPropertyValue("margin-left")).toBe("auto");
		expect(computed.getPropertyValue("margin-right")).toBe("auto");

		editor.destroy();
		el.remove();
	});
});
