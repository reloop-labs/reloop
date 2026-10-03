// @vitest-environment jsdom

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { EmailTheming } from "@react-email/editor/plugins";
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearImportedEmailCss } from "./apply-imported-email-css";
import { emailStarterKit } from "./email-starter-kit";
import { getRenderedEmailHtml } from "./get-rendered-email-html";
import { loadHtmlIntoEditor, restoreImportedEmailCssFromHtml } from "./load-html-into-editor";
import { sanitizePreviewHtml } from "./sanitize-preview-html";

const html = readFileSync(resolve(__dirname, "./fixtures/account-confirmation.html"), "utf8");
const minimalHtml = `<html><body style="background:#f4f1ed">
<table><tr><td style="padding:28px 14px">
<table style="max-width:620px"><tr><td>
<a href="https://example.com" style="display:block;background:#b91f2d;padding:14px 20px;text-align:center">Confirm Your Email</a>
</td></tr></table></td></tr></table></body></html>`;
const canvasCss = readFileSync(resolve(__dirname, "../components/canvas/email-canvas.css"), "utf8");
let editor: Editor;

afterEach(() => {
	editor?.destroy();
	clearImportedEmailCss();
	document.documentElement.classList.remove("dark");
	document.body.innerHTML = "";
	document.head.innerHTML = "";
	vi.useRealTimers();
});

it("preserves browser text defaults in a complete HTML document", async () => {
	const root = await importEmail(html);
	const paragraphs = Array.from(root.querySelectorAll("p"));
	const fallback = paragraphs.find(p => p.textContent?.startsWith("Button not working?"))!;
	expect(getComputedStyle(fallback).fontSize).toBe("16px");
	expect(getComputedStyle(fallback).lineHeight).toBe("normal");
	expect(getComputedStyle(root.querySelector("a.node-button")!).lineHeight).toBe("normal");
});

async function importEmail(source: string) {
	vi.useFakeTimers();
	const style = document.createElement("style");
	style.textContent = canvasCss;
	document.head.appendChild(style);
	const canvas = document.createElement("div");
	canvas.className = "template-editor-canvas";
	document.body.appendChild(canvas);
	editor = new Editor({ element: canvas, extensions: [emailStarterKit(), EmailTheming] });
	expect(loadHtmlIntoEditor(editor, source)).toBe(true);
	await vi.advanceTimersByTimeAsync(100);
	canvas.style.setProperty("--email-container-width", "620px");
	if (source === html) {
		const theme = readFileSync(resolve(process.cwd(), "../../../node_modules/@react-email/editor/dist/ui/themes/default.css"), "utf8");
		writeFileSync("/tmp/reloop-email-after.html", `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}*{box-sizing:border-box}</style><style>${theme}</style>${document.head.innerHTML}</head><body>${document.body.innerHTML}</body></html>`);
		writeFileSync("/tmp/reloop-email-original.html", html);
	}
	return editor.view.dom;
}

describe.each([["minimal", minimalHtml], ["account confirmation", html]])("imported email rendering: %s", (_name, source) => {
	it("keeps the page background in the editable canvas", async () => {
		const root = await importEmail(source);
		expect(getComputedStyle(root).backgroundColor).toBe("rgb(244, 241, 237)");
	});

	it("keeps the text centered inside a full-width CTA", async () => {
		const root = await importEmail(source);
		const button = root.querySelector<HTMLElement>("a.node-button")!;
		expect(button.textContent).toBe("Confirm Your Email");
		expect(getComputedStyle(button).textAlign).toBe("center");
	});

	it("keeps the outer email inset", async () => {
		const root = await importEmail(source);
		expect(getComputedStyle(root).paddingTop).toBe("28px");
		expect(getComputedStyle(root).paddingLeft).toBe("14px");
	});
});


it("preserves styles after restoring saved editor content in dark app mode", async () => {
	await importEmail(html);
	const saved = editor.getJSON();
	editor.destroy();
	clearImportedEmailCss();
	document.body.innerHTML = "";
	document.documentElement.classList.add("dark");
	const canvas = document.createElement("div");
	canvas.className = "template-editor-canvas";
	document.body.appendChild(canvas);
	editor = new Editor({element: canvas, content: saved, extensions: [emailStarterKit(), EmailTheming]});
	restoreImportedEmailCssFromHtml(html);
	const root = editor.view.dom;
	expect(getComputedStyle(root).backgroundColor).toBe("rgb(244, 241, 237)");
	expect(getComputedStyle(root).paddingTop).toBe("28px");
	expect(getComputedStyle(root.querySelector("a.node-button")!).textAlign).toBe("center");
});

it("preserves font family and baseline in compiled email output and preview", async () => {
	await importEmail(html);
	const renderedHtml = await getRenderedEmailHtml(editor);
	expect(renderedHtml).toMatch(/font-family:\s*Arial,\s*Helvetica,\s*sans-serif/i);

	const previewHtml = sanitizePreviewHtml(renderedHtml);
	expect(previewHtml).toMatch(/data-reloop-baseline/);
	expect(previewHtml).toMatch(/font-family:\s*inherit/);
});

it("preserves footer in multi-section email templates", async () => {
	const shopifyHtml = `<html><body style="background:#fdf3e9">
<table width="100%"><tbody>
<tr><td>
  <table style="max-width:560px;background:#fdf3e9"><tr><td>
    <h1>Welcome to Snack TBH!</h1>
    <a href="https://snacktbh.com" style="display:block;background:#000;color:#fff;padding:12px;text-align:center">Visit our store</a>
  </td></tr></table>
</td></tr>
<tr><td style="background:#000000">
  <table style="max-width:560px"><tr><td>
    <p style="color:#ffffff">SNACKTBH.COM</p>
    <p style="color:#ffffff">© 2021 TBH | ALL RIGHTS RESERVED</p>
  </td></tr></table>
</td></tr>
</tbody></table></body></html>`;

	const root = await importEmail(shopifyHtml);
	expect(root.textContent).toContain("Welcome to Snack TBH!");
	expect(root.textContent).toContain("SNACKTBH.COM");
	expect(root.textContent).toContain("ALL RIGHTS RESERVED");
});

it("renders saved template_content.json in editor with styled button and dark footer", async () => {
	const rawContent = JSON.parse(readFileSync("/Users/twinkal/.gemini/antigravity-ide/brain/da16b0bd-f7b6-4e73-bbef-c753f5254330/scratch/template_content.json", "utf8"));
	editor = new Editor({
		extensions: [emailStarterKit(), EmailTheming],
	});
	editor.commands.setContent({ type: "doc", content: rawContent });
	const html = editor.getHTML();
	expect(html).toContain("logo-tbh.png");
	expect(html).toContain("to be honest");
	expect(html).toContain("Welcome to Snack TBH!");
	expect(html).toContain("Visit our store");
	expect(html).toContain("logo-tbh-white.png");
	expect(html).toContain("TBH | An honest snacking company");

	// Footer table carries dark background
	expect(html).toContain("bgcolor=\"#000000\"");

	// Link preserves styling and classes
	expect(html).toContain("button__text");
	expect(html).toMatch(/padding:\s*20px\s*25px/);

	// Canvas CSS rules for button and footer
	expect(canvasCss).toContain("table.button");
	expect(canvasCss).toContain(".button__text");
	expect(canvasCss).toContain("table.row.footer");
	expect(canvasCss).toContain("background-color: #000000 !important;");
});
