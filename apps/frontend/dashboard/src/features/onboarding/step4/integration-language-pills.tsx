import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import type React from "react";
import { siGo, siNodedotjs, siPhp, siPython } from "simple-icons";
import type { IntegrationChoice } from "./types";

const SparkleIcon = ({ className }: { className?: string }) => (
	<svg
		viewBox="0 0 16 16"
		className={className ?? "size-3.5 shrink-0"}
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M8 1s-.75 3.25-2.5 4.5S1 8 1 8s3.25.75 4.5 2.5S8 15 8 15s.75-3.25 2.5-4.5S15 8 15 8s-3.25-.75-4.5-2.5S8 1 8 1Z" />
	</svg>
);

type PillItem =
	| {
			id: "ai";
			label: string;
			iconSvg: (isSelected: boolean) => React.ReactNode;
	  }
	| {
			id: Exclude<IntegrationChoice, "ai">;
			label: string;
			iconPath: string;
	  };

const pills: PillItem[] = [
	{
		id: "ai",
		label: "AI",
		iconSvg: (isSelected: boolean) => (
			<SparkleIcon
				className={`size-3.5 shrink-0 ${
					isSelected
						? "text-white fill-white"
						: "text-text-strong-950 dark:text-white"
				}`}
			/>
		),
	},
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
	value: IntegrationChoice;
	onChange: (choice: IntegrationChoice) => void;
}) {
	return (
		<div className="flex flex-wrap gap-2 pt-1">
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
						{"iconSvg" in pill ? (
							pill.iconSvg(true)
						) : (
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
						)}
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
						{"iconSvg" in pill ? (
							pill.iconSvg(false)
						) : (
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
						)}
						{pill.label}
					</Button.Root>
				);
			})}
		</div>
	);
}

