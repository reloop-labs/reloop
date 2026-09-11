// @vitest-environment jsdom

import { mergeAttributes, Node } from "@tiptap/core";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { Editor } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "../../utils/email-starter-kit";

describe("Email Section Selection", () => {
	const ImageNode = Node.create({
		name: "image",
		group: "block",
		atom: true,
		draggable: true,
		addAttributes() {
			return {
				src: { default: "" },
				alt: { default: "" },
				width: { default: "auto" },
				height: { default: "auto" },
				alignment: { default: "center" },
				href: { default: null },
				style: { default: null },
			};
		},
		parseHTML() {
			return [{ tag: "img[src]" }];
		},
		renderHTML({ HTMLAttributes }) {
			return ["img", mergeAttributes(HTMLAttributes)];
		},
	});

	it("establishes a NodeSelection on the section when clicked directly on section background/padding", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<section data-type="section" class="node-section" style="padding: 24px;"><p>Welcome text</p></section>`,
		});

		let sectionPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "section") {
				sectionPos = pos;
			}
		});

		expect(sectionPos).toBeGreaterThanOrEqual(0);

		const sectionEl = editor.view.dom.querySelector("section")!;
		expect(sectionEl).toBeTruthy();

		// Simulate clicking directly on the section padding/background
		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: sectionEl });

		const handled = editor.view.someProp("handleClick", (f) =>
			f(editor.view, sectionPos + 1, clickEvent),
		);

		expect(handled).toBe(true);
		expect(editor.state.selection instanceof NodeSelection).toBe(true);
		expect((editor.state.selection as NodeSelection).node.type.name).toBe(
			"section",
		);

		editor.destroy();
	});

	it("does not intercept clicks on child text so normal text editing cursor is preserved", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<section data-type="section" class="node-section"><p>Clickable text here</p></section>`,
		});

		const pEl = editor.view.dom.querySelector("p")!;
		expect(pEl).toBeTruthy();

		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: pEl });

		// emailSectionSelection should return false for text elements
		const handled = editor.view.someProp("handleClick", (f) =>
			f(editor.view, 2, clickEvent),
		);

		expect(Boolean(handled)).toBe(false);

		editor.destroy();
	});

	it("does not intercept clicks on child images so emailImageSelection can select the image", () => {
		const editor = new Editor({
			extensions: [emailStarterKit(), ImageNode],
			content: `<section data-type="section" class="node-section"><img src="https://example.com/photo.png" /></section>`,
		});

		const imgEl = editor.view.dom.querySelector("img")!;
		expect(imgEl).toBeTruthy();

		let imgPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "image") imgPos = pos;
		});

		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: imgEl });

		const handled = editor.view.someProp("handleClick", (f) =>
			f(editor.view, imgPos, clickEvent),
		);

		expect(handled).toBe(true);
		expect(editor.state.selection instanceof NodeSelection).toBe(true);
		expect((editor.state.selection as NodeSelection).node.type.name).toBe(
			"image",
		);

		editor.destroy();
	});

	it("does not intercept clicks on child buttons so emailButtonSelection can select the button", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<section data-type="section" class="node-section"><a data-id="react-email-button" class="node-button" href="https://example.com">Click Me</a></section>`,
		});

		const buttonEl = editor.view.dom.querySelector("a.node-button")!;
		expect(buttonEl).toBeTruthy();

		let buttonPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "button") buttonPos = pos;
		});

		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: buttonEl });

		const handled = editor.view.someProp("handleClick", (f) =>
			f(editor.view, buttonPos, clickEvent),
		);

		expect(handled).toBe(true);
		expect(editor.state.selection instanceof NodeSelection).toBe(true);
		expect((editor.state.selection as NodeSelection).node.type.name).toBe(
			"button",
		);

		editor.destroy();
	});

	it("allows subsequent click on an already selected section to place text cursor", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<section data-type="section" class="node-section"><p>Inner content</p></section>`,
		});

		let sectionPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "section") sectionPos = pos;
		});

		// First select the section
		const nodeSel = NodeSelection.create(editor.state.doc, sectionPos);
		editor.view.dispatch(editor.state.tr.setSelection(nodeSel));
		expect(editor.state.selection instanceof NodeSelection).toBe(true);

		// Subsequent click on the section should return false to allow placing cursor
		const sectionEl = editor.view.dom.querySelector("section")!;
		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: sectionEl });

		const handled = editor.view.someProp("handleClick", (f) =>
			f(editor.view, sectionPos + 1, clickEvent),
		);

		expect(Boolean(handled)).toBe(false);

		editor.destroy();
	});

	it("decorates active text block with email-selected-text-node class during text selection", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: "<h1>ALMOST THERE</h1><p>Welcome to our platform</p>",
		});

		// Find the heading node position
		let h1Pos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "heading") h1Pos = pos;
		});
		expect(h1Pos).toBeGreaterThanOrEqual(0);

		// Select text within the heading (like the user selecting "ALMOST THERE")
		const textSel = TextSelection.create(
			editor.state.doc,
			h1Pos + 1,
			h1Pos + 12,
		);
		editor.view.dispatch(editor.state.tr.setSelection(textSel));

		// Verify that decoration produces the class
		const decos = editor.view.someProp("decorations", (f) => f(editor.state));
		expect(decos).toBeTruthy();
		const found = decos?.find();
		expect(found?.length).toBeGreaterThanOrEqual(1);
		expect(found?.[0]?.type?.attrs?.class).toBe("email-selected-text-node");

		// Also check DOM rendering
		const h1El = editor.view.dom.querySelector("h1");
		expect(h1El?.classList.contains("email-selected-text-node")).toBe(true);

		editor.destroy();
	});

	it("does not decorate text blocks when selection is inside a button", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content:
				'<a data-id="react-email-button" class="node-button" href="https://example.com">Confirm Email</a>',
		});

		let buttonPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "button") buttonPos = pos;
		});

		// Select text inside button
		const textSel = TextSelection.create(
			editor.state.doc,
			buttonPos + 1,
			buttonPos + 5,
		);
		editor.view.dispatch(editor.state.tr.setSelection(textSel));

		const decos = editor.view.someProp("decorations", (f) => f(editor.state));
		const found = decos?.find();
		expect(found?.length ?? 0).toBe(0);

		editor.destroy();
	});
});
