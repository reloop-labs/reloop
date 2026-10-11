import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	siDiscord,
	siGithub,
	siGoogle,
	siGoogleads,
	siMedium,
	siSafari,
	siSpotify,
	siSubstack,
	siX,
	siYoutube,
} from "simple-icons";

// Named imports only: `import *` with a dynamic key ships all ~3k icons (~2 MB gz).
const ICONS: Record<string, { path: string; hex: string }> = {
	siDiscord,
	siGithub,
	siGoogle,
	siGoogleads,
	siMedium,
	siSafari,
	siSpotify,
	siSubstack,
	siX,
	siYoutube,
};

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
	const icon = ICONS[slug];

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
