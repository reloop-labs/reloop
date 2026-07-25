import { pageMetadata } from "#/app/_lib/page-metadata";
import { ThemePage } from "./client";

export const metadata = pageMetadata(
	"Theme · Reloop",
	"Customize your dashboard appearance with light, dark, or system theme.",
);

export default function ThemeRoute() {
	return <ThemePage />;
}
