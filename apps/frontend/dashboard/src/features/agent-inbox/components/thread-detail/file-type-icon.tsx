import { cn } from "@reloop/ui/cn";
import { FileText, Image as ImageIcon } from "lucide-react";
import { extensionOf } from "./attachment-file-kind";

export function FileTypeIcon({
	filename,
	className,
}: {
	filename: string;
	className?: string;
}) {
	const extension = extensionOf(filename);

	switch (extension) {
		case "pdf":
			return (
				<svg
					viewBox="0 0 16 16"
					className={cn("h-4 w-4 shrink-0", className)}
					aria-hidden
				>
					<title>PDF</title>
					<path
						fill="#F43F5E"
						d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5zM5.5 9.5c.4 0 .7.1.9.3.3.2.4.5.4.9 0 .3-.1.6-.3.8-.2.2-.5.3-.9.3H4.8v1.2H3.7V9.5h1.8zm0 1.5c.15 0 .25-.04.32-.1.07-.07.1-.16.1-.28 0-.12-.03-.2-.1-.27-.07-.06-.17-.1-.32-.1H4.8v.75h.7zm3.2-1.5c.5 0 .9.12 1.15.35.26.23.4.56.4.98 0 .43-.13.77-.4 1-.26.24-.65.36-1.15.36H7.5V9.5h1.2zm0 2.1c.22 0 .4-.05.52-.16.12-.1.18-.27.18-.48 0-.2-.06-.36-.18-.47-.12-.1-.3-.16-.52-.16H8.6v1.27h.1zm3.3-2.1v.85h1.4v.7h-1.4v1.55h-1.1V9.5h2.5z"
					/>
				</svg>
			);
		case "doc":
		case "docx":
			return (
				<svg
					viewBox="0 0 16 16"
					className={cn("h-4 w-4 shrink-0", className)}
					aria-hidden
				>
					<title>Word</title>
					<path
						fill="#3B82F6"
						d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5zM4.2 9.2l1.1 4.3h1.1l.85-3.2.85 3.2h1.1l1.1-4.3h-1.15l-.6 2.7-.75-2.7H7.1l-.75 2.7-.6-2.7H4.2z"
					/>
				</svg>
			);
		case "xls":
		case "xlsx":
		case "csv":
			return (
				<svg
					viewBox="0 0 16 16"
					className={cn("h-4 w-4 shrink-0", className)}
					aria-hidden
				>
					<title>Spreadsheet</title>
					<path
						fill="#188038"
						d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5zM4.2 9h2.1l.85 1.55L8 9h2.1l-1.5 2.2 1.55 2.3H8.05L7.15 12.1 6.2 13.5H4.05l1.6-2.3z"
					/>
				</svg>
			);
		case "fig":
		case "figma":
			return (
				<svg
					viewBox="0 0 16 16"
					className={cn("h-4 w-4 shrink-0", className)}
					aria-hidden
				>
					<title>Figma</title>
					<path
						fill="#F97316"
						d="M5.5 1A2.5 2.5 0 0 0 3 3.5v1A2.5 2.5 0 0 0 5.5 7H8V1H5.5zm2.5 6H5.5A2.5 2.5 0 0 0 3 9.5v0A2.5 2.5 0 0 0 5.5 12H8V7zm0 5H5.5A2.5 2.5 0 0 0 3 14.5 2.5 2.5 0 0 0 5.5 17H8v-5zm0-5h2.5A2.5 2.5 0 0 1 13 9.5 2.5 2.5 0 0 1 10.5 7H8v0z"
						transform="scale(0.85) translate(1, -0.5)"
					/>
					<circle cx="11" cy="9.5" r="2.5" fill="#A855F7" />
				</svg>
			);
		case "jpg":
		case "jpeg":
		case "png":
		case "gif":
		case "webp":
		case "svg":
			return (
				<ImageIcon
					className={cn("h-4 w-4 shrink-0 text-[#8B5CF6]", className)}
				/>
			);
		default:
			return (
				<FileText
					className={cn("h-4 w-4 shrink-0 text-[#8B5CF6]", className)}
				/>
			);
	}
}
