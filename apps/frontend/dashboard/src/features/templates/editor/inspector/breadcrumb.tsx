import { Inspector } from "@react-email/editor/ui";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

const getIconName = (type: string): string => {
	switch (type.toLowerCase()) {
		case "text":
		case "paragraph":
		case "heading":
			return "type";
		case "image":
			return "image-upload";
		case "button":
			return "send";
		case "section":
		case "layout":
			return "layout";
		case "container":
			return "box";
		case "blockquote":
			return "comment-text";
		case "column":
		case "row":
			return "layout-grid";
		case "body":
			return "file-text";
		case "variable":
			return "brackets";
		default:
			return "box";
	}
};

const BreadCrumb = () => {
	return (
		<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-weak-50 px-3 py-3 dark:border-stroke-soft-100/50">
			<ol className="flex list-none items-center gap-1 rounded-lg">
				<Inspector.Breadcrumb>
					{(segments) =>
						segments.map((segment, i) => {
							const type = segment.node?.nodeType ?? "Layout";
							const label = type;
							const iconName = getIconName(type);

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
												name={iconName}
												className="h-3.5 w-3.5 text-text-strong-950"
											/>
											{showLabel && (
												<span className="font-semibold text-label-xs text-text-strong-950 capitalize">
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
									<Button.Root
										type="button"
										variant="neutral"
										mode="ghost"
										size="xxsmall"
										className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-label-xs text-text-sub-600 capitalize outline-none ring-0 transition-colors hover:text-text-strong-950"
										onClick={() => segment.focus()}
									>
										<Icon name={iconName} className="h-3.5 w-3.5" />
										{showLabel && <span>{label}</span>}
									</Button.Root>
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
