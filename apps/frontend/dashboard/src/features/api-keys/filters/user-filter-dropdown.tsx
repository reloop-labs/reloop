import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import type { CreatedByUser } from "../types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./base-ui-select";

export function ApiKeyUserFilterDropdown({
	value,
	onChange,
	availableCreators,
}: {
	value: string | null;
	onChange: (value: string | null) => void;
	availableCreators: CreatedByUser[];
}) {
	const selectedCreator = availableCreators.find((c) => c.id === value);
	const displayLabel = selectedCreator
		? selectedCreator.name ||
			(selectedCreator.email ? selectedCreator.email.split("@")[0] : "Unknown")
		: "All Users";

	return (
		<Select
			value={value === null ? "all" : value}
			onValueChange={(val) => onChange(val === "all" ? null : (val as string))}
		>
			<SelectTrigger className="w-48">
				<div className="flex min-w-0 items-center gap-2 overflow-hidden">
					{selectedCreator ? (
						<Avatar.Root size="16" color="blue" className="shrink-0">
							{selectedCreator.image ? (
								<Avatar.Image
									src={selectedCreator.image}
									alt={selectedCreator.name || "User"}
								/>
							) : (
								<Avatar.Image asChild>
									<div
										className={cn(
											"flex h-full w-full items-center justify-center rounded-full font-medium text-[6px] text-white uppercase tracking-wide",
											getAvatarGradient(
												selectedCreator.email || "unknown@reloop.sh",
											),
										)}
									>
										{getAvatarInitial(
											selectedCreator.name,
											selectedCreator.email || "unknown@reloop.sh",
										)}
									</div>
								</Avatar.Image>
							)}
						</Avatar.Root>
					) : (
						<Icon name="user" className="h-4 w-4 shrink-0 text-text-sub-600" />
					)}
					<SelectValue placeholder="All Users">{displayLabel}</SelectValue>
				</div>
			</SelectTrigger>
			<SelectContent
				alignItemWithTrigger={true}
				alignOffset={-14}
				className="w-48"
			>
				<SelectItem value="all">
					<div className="flex min-w-0 items-center gap-2">
						<Icon name="user" className="h-4 w-4 shrink-0 text-text-sub-600" />
						<span className="truncate">All Users</span>
					</div>
				</SelectItem>
				{availableCreators.map((creator) => {
					const label =
						creator.name ||
						(creator.email ? creator.email.split("@")[0] : "Unknown");
					return (
						<SelectItem key={creator.id} value={creator.id}>
							<div className="flex min-w-0 items-center gap-2">
								<Avatar.Root size="16" color="blue" className="shrink-0">
									{creator.image ? (
										<Avatar.Image
											src={creator.image}
											alt={creator.name || "User"}
										/>
									) : (
										<Avatar.Image asChild>
											<div
												className={cn(
													"flex h-full w-full items-center justify-center rounded-full font-medium text-[6px] text-white uppercase tracking-wide",
													getAvatarGradient(
														creator.email || "unknown@reloop.sh",
													),
												)}
											>
												{getAvatarInitial(
													creator.name,
													creator.email || "unknown@reloop.sh",
												)}
											</div>
										</Avatar.Image>
									)}
								</Avatar.Root>
								<span className="truncate">{label}</span>
							</div>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
