import { Inspector } from "@react-email/editor/ui";

export const EmailInspector = () => {
	return (
		<aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto p-3 text-xs">
			<Inspector.Root>
				<nav>
					<ol className="m-0 mb-4 flex list-none items-center gap-1 p-0">
						<Inspector.Breadcrumb>
							{(segments) =>
								segments.map((segment, i) => {
									const label = segment.node?.nodeType ?? "Layout";
									if (i === segments.length - 1) {
										return (
											<li key={i} className="flex items-center gap-1">
												{i !== 0 && (
													<span className="text-(--re-text-muted)">/</span>
												)}
												<span className="p-0 text-(--re-text) text-xs capitalize">
													{label}
												</span>
											</li>
										);
									}
									return (
										<li key={i} className="flex items-center gap-1">
											{i !== 0 && (
												<span className="text-(--re-text-muted)">/</span>
											)}
											<button
												type="button"
												className="cursor-pointer border-0 bg-transparent p-0 text-(--re-text-muted) text-xs capitalize hover:text-(--re-text)"
												onClick={() => segment.focus()}
											>
												{label}
											</button>
										</li>
									);
								})
							}
						</Inspector.Breadcrumb>
					</ol>
				</nav>
				<Inspector.Document />
			</Inspector.Root>
		</aside>
	);
};
