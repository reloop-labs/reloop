import { Inspector } from "@react-email/editor/ui";
import {
	Box,
	Columns,
	FileText,
	Image as ImageIcon,
	Layout,
	MousePointer2,
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
		<ol className="m-0 mb-4 flex list-none items-center gap-1 p-0">
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
										<span className="text-(--re-text-muted) text-sm">/</span>
									)}
									<div className="flex items-center gap-1.5 py-0.5">
										<Icon className="h-4 w-4 text-text-sub-600" />
										{showLabel && (
											<span className="p-0 text-sm font-bold capitalize">
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
									<span className="text-(--re-text-muted) text-sm">/</span>
								)}
								<button
									type="button"
									className="flex cursor-pointer items-center gap-1.5 text-(--re-text-muted) text-sm capitalize"
									onClick={() => segment.focus()}
								>
									<Icon className="h-4 w-4" />
									{showLabel && <span>{label}</span>}
								</button>
							</li>
						);
					})
				}
			</Inspector.Breadcrumb>
		</ol>
	);
};

export default BreadCrumb;
