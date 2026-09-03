// @vitest-environment jsdom

import { Editor } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { findSuggestionMatch } from "@tiptap/suggestion";
import { describe, expect, it } from "vitest";
import {
	createSlashCommandPlugin,
	emailTextBubbleShouldShow,
	emailTextBubbleTrigger,
} from "./email-slash-command-plugin";
import { emailStarterKit } from "./email-starter-kit";

describe("slash trigger", () => {
	it("does not open after punctuation with TipTap's default prefixes", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: "<p>shipped work./</p>",
		});
		editor.commands.focus("end");
		const result = findSuggestionMatch({
			char: "/",
			allowSpaces: false,
			allowToIncludeChar: false,
			allowedPrefixes: [" "],
			startOfLine: false,
			$position: editor.state.selection.$from,
		});
		editor.destroy();
		expect(result).toBeNull();
	});

	it("opens after / inside a table cell when prefixes are unrestricted", () => {
		const pluginKey = new PluginKey("slash-command-test");
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content:
				'<div data-type="container"><table><tr><td><p>shipped work.</p></td></tr></table></div>',
		});
		editor.commands.focus("end");
		editor.registerPlugin(
			createSlashCommandPlugin({
				editor,
				pluginKey,
				items: [{ title: "Text", command: () => undefined }] as never,
			}),
		);
		editor.commands.insertContent("/");
		expect(pluginKey.getState(editor.state)?.active).toBe(true);
		editor.destroy();
	});
});

describe("emailTextBubbleShouldShow", () => {
	it("shows the full formatting bubble when a link is active with no selection", () => {
		expect(
			emailTextBubbleShouldShow({
				isActive: (name) => name === "link",
				selectionSize: 0,
			}),
		).toBe(true);
	});

	it("shows the full bubble for a normal text selection", () => {
		expect(
			emailTextBubbleShouldShow({
				isActive: () => false,
				selectionSize: 12,
			}),
		).toBe(true);
	});

	it("hides the text bubble on images and buttons", () => {
		expect(
			emailTextBubbleShouldShow({
				isActive: (name) => name === "image",
				selectionSize: 4,
			}),
		).toBe(false);
		expect(
			emailTextBubbleShouldShow({
				isActive: () => false,
				selectionSize: 4,
				selectedNodeName: "button",
			}),
		).toBe(false);
	});

	it("does not show the bubble when the editor canvas is unmounted", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: "<p>Hello</p>",
		});
		editor.view.dom.remove();
		expect(emailTextBubbleTrigger({ editor, state: editor.state })).toBe(false);
		editor.destroy();
	});
});
