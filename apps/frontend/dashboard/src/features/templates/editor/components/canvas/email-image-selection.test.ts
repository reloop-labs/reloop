// @vitest-environment jsdom

import { mergeAttributes, Node } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { Editor } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "../../utils/email-starter-kit";
import {
	numericPxFromCss,
	setInlineCssDeclaration,
} from "../../utils/resolve-inspector-text-style";

describe("Email Image Selection & Attributes", () => {
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
				alignment: {
					default: "center",
					parseHTML: (element) =>
						element.getAttribute("alignment") ||
						element.getAttribute("align") ||
						"center",
				},
				href: { default: null },
				style: {
					default: null,
					parseHTML: (element) => element.getAttribute("style"),
				},
			};
		},
		parseHTML() {
			return [{ tag: "img[src]" }];
		},
		renderHTML({ HTMLAttributes }) {
			return ["img", mergeAttributes(HTMLAttributes)];
		},
	});

	it("creates a NodeSelection on the image node and updates resize attributes", () => {
		const editor = new Editor({
			extensions: [emailStarterKit(), ImageNode],
			content: `<img src="https://example.com/logo.png" width="400" height="auto" alignment="center" />`,
		});

		let imgPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "image") {
				imgPos = pos;
			}
		});

		expect(imgPos).toBeGreaterThanOrEqual(0);

		// Establish NodeSelection
		const nodeSel = NodeSelection.create(editor.state.doc, imgPos);
		editor.view.dispatch(editor.state.tr.setSelection(nodeSel));

		expect(editor.state.selection instanceof NodeSelection).toBe(true);
		expect((editor.state.selection as NodeSelection).node.type.name).toBe(
			"image",
		);
		expect((editor.state.selection as NodeSelection).node.attrs.src).toBe(
			"https://example.com/logo.png",
		);
		expect((editor.state.selection as NodeSelection).node.attrs.width).toBe(
			400,
		);

		// Simulate drag-to-resize committing width: 608
		editor.chain().focus().updateAttributes("image", { width: 608 }).run();
		expect((editor.state.selection as NodeSelection).node.attrs.width).toBe(
			608,
		);

		// Simulate replace image updating src
		editor
			.chain()
			.focus()
			.updateAttributes("image", {
				src: "https://example.com/new-image.png",
			})
			.run();
		expect((editor.state.selection as NodeSelection).node.attrs.src).toBe(
			"https://example.com/new-image.png",
		);

		// Simulate adding link
		editor
			.chain()
			.focus()
			.updateAttributes("image", { href: "https://reloop.sh" })
			.run();
		expect((editor.state.selection as NodeSelection).node.attrs.href).toBe(
			"https://reloop.sh",
		);

		editor.destroy();
	});

	it("correctly identifies and selects the second (big) image when multiple images exist", () => {
		const editor = new Editor({
			extensions: [emailStarterKit(), ImageNode],
			content: `
				<p><img src="https://example.com/small-logo.png" width="48" height="48" /></p>
				<p>Some text</p>
				<p><img src="https://example.com/big-hero.png" width="600" height="400" /></p>
			`,
		});

		const images: Array<{ pos: number; src: string }> = [];
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "image") {
				images.push({ pos, src: node.attrs.src });
			}
		});

		expect(images.length).toBe(2);
		expect(images[0]?.src).toBe("https://example.com/small-logo.png");
		expect(images[1]?.src).toBe("https://example.com/big-hero.png");

		// Select the second (big) image
		const bigImgPos = images[1]!.pos;
		const nodeSel = NodeSelection.create(editor.state.doc, bigImgPos);
		editor.view.dispatch(editor.state.tr.setSelection(nodeSel));

		expect(editor.state.selection instanceof NodeSelection).toBe(true);
		expect((editor.state.selection as NodeSelection).node.attrs.src).toBe(
			"https://example.com/big-hero.png",
		);

		// Now simulate clicking the DOM element of the second image
		const imgElements = editor.view.dom.querySelectorAll("img");
		expect(imgElements.length).toBe(2);

		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: imgElements[1] });
		const handled = editor.view.someProp("handleClick", (f) =>
			f(editor.view, bigImgPos, clickEvent),
		);

		expect(handled).toBe(true);
		expect(editor.state.selection instanceof NodeSelection).toBe(true);
		expect((editor.state.selection as NodeSelection).node.attrs.src).toBe(
			"https://example.com/big-hero.png",
		);

		editor.destroy();
	});

	it("correctly selects the big image inside a table row without jumping to the logo", () => {
		const editor = new Editor({
			extensions: [emailStarterKit(), ImageNode],
			content: `
				<table>
					<tr>
						<td><img src="https://example.com/small-logo.png" width="48" height="48" /></td>
					</tr>
					<tr>
						<td><img src="https://example.com/big-hero.png" width="600" height="400" /></td>
					</tr>
				</table>
			`,
		});

		const imgElements = editor.view.dom.querySelectorAll("img");
		expect(imgElements.length).toBe(2);

		// Test handleClick on the second (big) image
		const heroImgEl = imgElements[1];
		let heroPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "image" && node.attrs.src.includes("big-hero")) {
				heroPos = pos;
			}
		});

		expect(heroPos).toBeGreaterThan(0);

		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: heroImgEl });
		const handled = editor.view.someProp("handleClick", (f) =>
			f(editor.view, heroPos, clickEvent),
		);

		expect(handled).toBe(true);
		expect(editor.state.selection instanceof NodeSelection).toBe(true);
		expect((editor.state.selection as NodeSelection).node.attrs.src).toBe(
			"https://example.com/big-hero.png",
		);

		editor.destroy();
	});

	it("updates both width attribute AND inline style when resizing so the image never snaps back", () => {
		const editor = new Editor({
			extensions: [emailStarterKit(), ImageNode],
			content: `<img src="https://example.com/big-hero.png" width="608" style="width: 608px; max-width: 100%;" />`,
		});

		let imgPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "image") imgPos = pos;
		});

		const node = editor.state.doc.nodeAt(imgPos)!;
		expect(node.attrs.width).toBe(608);
		expect(node.attrs.style).toContain("width: 608px");

		// Simulate drag-to-resize committing both width and synchronized style
		const currentStyle = (node.attrs.style as string) || "";
		const nextWidth = 450;
		const nextStyle = setInlineCssDeclaration(
			currentStyle,
			"width",
			`${nextWidth}px`,
		);

		editor
			.chain()
			.setNodeSelection(imgPos)
			.updateAttributes("image", {
				width: nextWidth,
				style: nextStyle,
			})
			.run();

		const updatedNode = editor.state.doc.nodeAt(imgPos)!;
		expect(updatedNode.attrs.width).toBe(450);
		expect(updatedNode.attrs.style).toContain("width: 450px");
		expect(updatedNode.attrs.style).toContain("max-width: 100%");

		const domImg = editor.view.dom.querySelector("img")!;
		expect(domImg.getAttribute("width")).toBe("450");
		expect(domImg.getAttribute("style")).toContain("width: 450px");

		// Verify numericPxFromCss reads accurate dimensions
		expect(numericPxFromCss(updatedNode.attrs.style, "width")).toBe(450);

		editor.destroy();
	});

	it("setInlineCssDeclaration correctly updates and removes CSS properties", () => {
		let style = "width: 608px; max-width: 100%; height: auto;";
		style = setInlineCssDeclaration(style, "width", "400px");
		expect(style).toContain("width: 400px");
		expect(style).toContain("max-width: 100%");

		style = setInlineCssDeclaration(style, "height", "");
		expect(style).not.toContain("height");

		style = setInlineCssDeclaration(style, "maxWidth", "100%");
		expect(style).toContain("max-width: 100%");
	});
});
