import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { useHotkeys } from "react-hotkeys-hook";
import { siGo, siNodedotjs, siPhp, siPython } from "simple-icons";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { LanguageCode } from "./types";

const pills: {
	id: LanguageCode;
	label: string;
	iconPath: string;
	/** Single-key shortcut; hint only when Space is long-pressed. */
	shortcut: string;
}[] = [
	{
		id: "nodejs",
		label: "Node.js",
		iconPath: siNodedotjs.path,
		shortcut: "N",
	},
	{
		id: "python",
		label: "Python",
		iconPath: siPython.path,
		shortcut: "P",
	},
	{
		id: "go",
		label: "Go",
		iconPath: siGo.path,
		shortcut: "G",
	},
	{
		id: "php",
		label: "PHP",
		iconPath: siPhp.path,
		// H — P is used by Python
		shortcut: "H",
	},
];

const shortcutKbdOnBlue =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export function IntegrationLanguagePills({
	value,
	onChange,
}: {
	value: LanguageCode;
	onChange: (choice: LanguageCode) => void;
}) {
	// Language pills: N / P / G / H — hints reveal on long-press Space.
	useHotkeys(
		"n",
		(e) => {
			e.preventDefault();
			onChange("nodejs");
		},
		{ enableOnFormTags: false, preventDefault: true },
		[onChange],
	);
	useHotkeys(
		"p",
		(e) => {
			e.preventDefault();
			onChange("python");
		},
		{ enableOnFormTags: false, preventDefault: true },
		[onChange],
	);
	useHotkeys(
		"g",
		(e) => {
			e.preventDefault();
			onChange("go");
		},
		{ enableOnFormTags: false, preventDefault: true },
		[onChange],
	);
	useHotkeys(
		"h",
		(e) => {
			e.preventDefault();
			onChange("php");
		},
		{ enableOnFormTags: false, preventDefault: true },
		[onChange],
	);

	return (
		<div className="flex flex-wrap gap-2">
			{pills.map((pill) => {
				const isSelected = value === pill.id;
				return isSelected ? (
					<FancyButton.Root
						key={pill.id}
						type="button"
						variant="blue"
						size="xsmall"
						onClick={() => onChange(pill.id)}
						aria-keyshortcuts={pill.shortcut.toLowerCase()}
						className="gap-1.5 rounded-xl"
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							width={13}
							height={13}
							aria-hidden
							className="shrink-0 text-white"
							fill="currentColor"
						>
							<path d={pill.iconPath} />
						</svg>
						{pill.label}
						<ShortcutHint className={shortcutKbdOnBlue}>
							{pill.shortcut}
						</ShortcutHint>
					</FancyButton.Root>
				) : (
					<Button.Root
						key={pill.id}
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => onChange(pill.id)}
						aria-keyshortcuts={pill.shortcut.toLowerCase()}
						className="gap-1.5 rounded-xl"
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							width={13}
							height={13}
							aria-hidden
							className="shrink-0 text-text-strong-950 dark:text-white"
							fill="currentColor"
						>
							<path d={pill.iconPath} />
						</svg>
						{pill.label}
						<ShortcutHint>{pill.shortcut}</ShortcutHint>
					</Button.Root>
				);
			})}
		</div>
	);
}
