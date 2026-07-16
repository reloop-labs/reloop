import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as simpleIcons from "simple-icons";

const FALLBACK_MAP: Record<string, string> = {
	siLinkedin: "linkedin",
	siGoogle: "globe",
	siGithub: "github",
	siX: "twitter",
};

const MONOCHROME_SLUGS = [
	"siGithub",
	"siX",
	"siMedium",
	"siSlack",
	"siLinkedin",
];

export function SimpleIcon({
	slug,
	className,
}: {
	slug: string;
	className?: string;
}) {
	const icon = (
		simpleIcons as Record<string, { path: string; hex: string } | undefined>
	)[slug];

	if (!icon) {
		const fallbackName = FALLBACK_MAP[slug];
		if (fallbackName) {
			return (
				<Icon
					name={fallbackName}
					className={cn(className, "text-text-sub-600")}
				/>
			);
		}
		return null;
	}

	const isMonochrome = MONOCHROME_SLUGS.includes(slug);

	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			className={cn(className, isMonochrome ? "text-text-sub-600" : "")}
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			style={!isMonochrome ? { color: `#${icon.hex}` } : undefined}
			aria-hidden="true"
		>
			<path d={icon.path} />
		</svg>
	);
}
