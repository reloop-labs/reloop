import { parseAsString, useQueryState } from "nuqs";
import { SidebarPreview } from "../sidebar-preview";
import { CreateOrgStep } from "./create-org-step";

export function StepOne() {
	const [name] = useQueryState("name", parseAsString.withDefault(""));
	const [logoUrl] = useQueryState("logoUrl", parseAsString.withDefault(""));

	return (
		<>
			<div className="px-5 pt-8 sm:px-8 lg:px-12">
				<div className="font-medium text-text-soft-400 text-xs">
					Step 1 of 2
				</div>
			</div>

			<div className="grid w-full grid-cols-1 lg:grid-cols-2">
				<div className="flex min-w-0 flex-col gap-4 px-5 pt-2 pb-8 sm:px-8 sm:pb-10 lg:px-12">
					<CreateOrgStep />
				</div>
				<div className="relative hidden min-w-0 overflow-hidden border-stroke-soft-100 border-l lg:block dark:border-stroke-soft-100/40">
					<SidebarPreview name={name} logo={logoUrl || null} />
				</div>
			</div>
		</>
	);
}
