import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { siGo, siNodedotjs, siPhp, siPython } from "simple-icons";
import type { LanguageCode } from "./types";

const pills: { id: LanguageCode; label: string; iconPath: string }[] = [
	{
		id: "nodejs",
		label: "Node.js",
		iconPath: siNodedotjs.path,
	},
	{
		id: "python",
		label: "Python",
		iconPath: siPython.path,
	},
	{
		id: "go",
		label: "Go",
		iconPath: siGo.path,
	},
	{
		id: "php",
		label: "PHP",
		iconPath: siPhp.path,
	},
];

export function IntegrationLanguagePills({
	value,
	onChange,
}: {
	value: LanguageCode;
	onChange: (choice: LanguageCode) => void;
}) {
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
					</FancyButton.Root>
				) : (
					<Button.Root
						key={pill.id}
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => onChange(pill.id)}
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
					</Button.Root>
				);
			})}
		</div>
	);
}
