import { Inspector } from "@react-email/editor/ui";
import {
	Box,
	Columns,
	FileText,
	Image as ImageIcon,
	Layout,
	MousePointer2,
	Quote,
	Rows,
	Type,
} from "lucide-react";

const getIcon = (type: string) => {
	switch (type.toLowerCase()) {
		case "text":
		case "paragraph":
		case "heading":
			return Type;
		case "image":
			return ImageIcon;
		case "button":
			return MousePointer2;
		case "section":
		case "layout":
			return Layout;
		case "container":
			return Box;
		case "blockquote":
			return Quote;
		case "column":
			return Columns;
		case "row":
			return Rows;
		case "body":
			return FileText;
		default:
			return Box;
	}
};

const BreadCrumb = () => {
	return (
		<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-weak-50 px-3 py-3 dark:bg-[#0a0a0a]">
			<ol className="flex list-none items-center gap-1 rounded-lg">
				<Inspector.Breadcrumb>
					{(segments) =>
						segments.map((segment, i) => {
							const type = segment.node?.nodeType ?? "Layout";
							const label = type;
							const Icon = getIcon(type);

							const isFirst = i === 0;
							const isLast = i === segments.length - 1;
							const showLabel = !isFirst || segments.length === 1;

							if (isLast) {
								return (
									<li key={i} className="flex items-center gap-1">
										{i !== 0 && (
											<span className="text-text-disabled-300 text-xs">/</span>
										)}
										<div className="flex items-center gap-1.5">
											<Icon
												className="h-3.5 w-3.5 text-text-strong-950"
												strokeWidth={2}
											/>
											{showLabel && (
												<span className="font-semibold text-text-strong-950 text-xs capitalize">
													{label}
												</span>
											)}
										</div>
									</li>
								);
							}
							return (
								<li key={i} className="flex items-center gap-1">
									{i !== 0 && (
										<span className="text-text-disabled-300 text-xs">/</span>
									)}
									<button
										type="button"
										className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-text-sub-600 text-xs capitalize transition-colors hover:text-text-strong-950"
										onClick={() => segment.focus()}
									>
										<Icon className="h-3.5 w-3.5" strokeWidth={2} />
										{showLabel && <span>{label}</span>}
									</button>
								</li>
							);
						})
					}
				</Inspector.Breadcrumb>
			</ol>
		</div>
	);
};

export default BreadCrumb;
