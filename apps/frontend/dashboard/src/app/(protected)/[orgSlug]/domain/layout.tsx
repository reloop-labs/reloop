"use client";
import { useLayout } from "@dashboard/providers/layout-provider";
import { Icon } from "@reloop/ui/icon";

const DomainLayout = ({ children }: { children: React.ReactNode }) => {
	const { layoutMode } = useLayout();

	if (layoutMode === "sidebar") {
		return (
			<div>
				<div className="flex h-12 items-center justify-between border-stroke-soft-100 border-b px-2">
					<div className="flex items-center gap-2">
						<Icon name="globe" className="h-4 w-4" />
						<p className="font-medium text-sm">Domain</p>
						<a
							href="https://reloop.com/docs/domain"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="info-outline" className="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
				<div>
					<div>{children}</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="w-full flex-1">{children}</div>
		</div>
	);
};

export default DomainLayout;
