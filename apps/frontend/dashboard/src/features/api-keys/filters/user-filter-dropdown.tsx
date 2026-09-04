import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as React from "react";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import type { CreatedByUser } from "../types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./base-ui-select";

function UserAvatar({
	name,
	email,
	image,
}: {
	name: string | null | undefined;
	email: string | null | undefined;
	image?: string | null;
}) {
	const rawName = name?.trim() ? name.trim() : null;
	const rawEmail = email?.trim() ? email.trim() : null;
	const safeEmail = rawEmail || "unknown@reloop.sh";
	const hasImage = Boolean(image && image.trim().length > 0);
	const [imgError, setImgError] = React.useState(false);
	React.useEffect(() => {
		setImgError(false);
	}, [image]);
	const showImage = hasImage && !imgError;

	return (
		<Avatar.Root size="16" color="blue" className="shrink-0">
			{showImage ? (
				<Avatar.Image
					src={image ?? undefined}
					alt={rawName || "User"}
					onError={() => setImgError(true)}
				/>
			) : (
				<Avatar.Image asChild>
					<div
						className={cn(
							"flex h-full w-full items-center justify-center rounded-full font-medium text-[6px] text-white uppercase tracking-wide",
							getAvatarGradient(safeEmail),
						)}
					>
						{getAvatarInitial(rawName, safeEmail)}
					</div>
				</Avatar.Image>
			)}
		</Avatar.Root>
	);
}

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
				{/* Leading icon must live inside SelectValue so alignItemWithTrigger
				    matches ItemText (icon + label) to Value (icon + label). */}
				<SelectValue placeholder="All Users">
					{selectedCreator ? (
						<UserAvatar
							name={selectedCreator.name}
							email={selectedCreator.email}
							image={selectedCreator.image}
						/>
					) : (
						<Icon name="user" className="h-4 w-4 shrink-0 text-text-sub-600" />
					)}
					<span className="min-w-0 truncate">{displayLabel}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-48">
				<SelectItem value="all">
					<Icon name="user" className="h-4 w-4 shrink-0 text-text-sub-600" />
					<span className="min-w-0 truncate">All Users</span>
				</SelectItem>
				{availableCreators.map((creator) => {
					const label =
						creator.name ||
						(creator.email ? creator.email.split("@")[0] : "Unknown");
					return (
						<SelectItem key={creator.id} value={creator.id}>
							<UserAvatar
								name={creator.name}
								email={creator.email}
								image={creator.image}
							/>
							<span className="min-w-0 truncate">{label}</span>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
