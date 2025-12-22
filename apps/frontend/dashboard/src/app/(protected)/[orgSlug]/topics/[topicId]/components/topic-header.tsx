"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { TopicDropdown } from "../../../contacts/components/topic-dropdown";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	autoEnroll?: "enrolled" | "unenrolled";
	visibility?: "private" | "public";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface TopicHeaderProps {
	topic: Topic | undefined;
	isLoading: boolean;
	isFailed: boolean;
	onDelete?: () => void;
	onEdit?: () => void;
	onToggleVisibility?: (
		topicId: string,
		currentValue: "private" | "public",
	) => void;
}

const getEnrollmentBadgeStyle = (autoEnroll?: "enrolled" | "unenrolled") => {
	if (autoEnroll === "enrolled") {
		return "text-success-base border-success-base/40 bg-success-base/5";
	}
	return "text-text-sub-600 border-stroke-soft-200 bg-bg-white-0";
};

const getVisibilityBadgeStyle = (visibility?: "private" | "public") => {
	if (visibility === "public") {
		return "text-primary-base border-primary-base/30 bg-primary-base/5";
	}
	return "text-text-sub-600 border-stroke-soft-200 bg-bg-white-0";
};

export const TopicHeader = ({
	topic,
	isLoading,
	isFailed: _isFailed,
	onDelete,
	onEdit,
	onToggleVisibility,
}: TopicHeaderProps) => {
	const { push } = useUserOrganization();
	const [copied, setCopied] = useState(false);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const enrollmentValue = topic?.autoEnroll || "unenrolled";
	const visibilityValue = topic?.visibility || "private";

	const handleCopyId = async () => {
		if (topic?.id) {
			try {
				await navigator.clipboard.writeText(topic.id);
				toast.success("Topic ID copied to clipboard");
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy ID");
			}
		}
	};

	const handleDelete = () => {
		onDelete?.();
	};

	const handleEdit = () => {
		onEdit?.();
	};

	if (!topic && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => push("/topics")} />
				<div className="flex items-center justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Topic{" "}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								---
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-error-base">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-xs">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h6 leading-8">
							Topic not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-10 pb-8">
			<AnimatedBackButton onClick={() => push("/topics")} />
			<div className="flex items-center justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-12 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-16 rounded-full" />
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Topic{" "}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								{topic?.createdAt ? formatRelativeTime(topic.createdAt) : "---"}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div
								className={cn(
									"flex items-center gap-1",
									visibilityValue === "public"
										? "text-primary-base"
										: "text-text-sub-600",
								)}
							>
								<Icon
									name={visibilityValue === "public" ? "globe" : "lock"}
									className="h-3.5 w-3.5"
								/>
								<p className="font-medium text-paragraph-xs capitalize">
									{visibilityValue}
								</p>
							</div>
						</div>
					)}
					{isLoading ? (
						<Skeleton className="mt-2 h-7 w-48 rounded-lg" />
					) : (
						<>
							<h1 className="mt-1 font-medium text-title-h6 leading-8">
								{topic?.name}
							</h1>
							{topic?.description && (
								<div className="max-w-xs">
									<p
										className={cn(
											"break-words text-text-sub-600 text-xs",
											!isDescriptionExpanded && "line-clamp-1",
										)}
									>
										{topic.description}
									</p>
									{topic.description.length > 20 && (
										<button
											type="button"
											onClick={() =>
												setIsDescriptionExpanded(!isDescriptionExpanded)
											}
											className="mt-0.5 text-primary-base text-xs transition-colors hover:text-primary-darker"
										>
											{isDescriptionExpanded ? "Show less" : "Read more"}
										</button>
									)}
								</div>
							)}
						</>
					)}
				</div>

				<div className="flex items-center gap-2">
					{/* Actions Menu */}
					{isLoading ? (
						<Skeleton className="h-9 w-9 rounded-lg" />
					) : topic ? (
						<TopicDropdown
							topicId={topic.id}
							topicName={topic.name}
							visibility={topic.visibility}
							onViewDetails={() => {}}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onToggleVisibility={onToggleVisibility}
							hideViewDetails
						/>
					) : null}
				</div>
			</div>

			<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-12">
				{/* Enrollment */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="users" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Enrollment
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-20 rounded-lg" />
					) : (
						<span
							className={cn(
								"inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-[11px] capitalize",
								getEnrollmentBadgeStyle(topic?.autoEnroll),
							)}
						>
							<Icon
								name={
									enrollmentValue === "enrolled" ? "user-plus" : "user-minus"
								}
								className="h-3 w-3"
							/>
							{enrollmentValue}
						</span>
					)}
				</div>

				{/* Visibility */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon
							name="eye-outline"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Visibility
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-20 rounded-lg" />
					) : (
						<span
							className={cn(
								"inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-[11px] capitalize",
								getVisibilityBadgeStyle(topic?.visibility),
							)}
						>
							<Icon
								name={visibilityValue === "public" ? "globe" : "lock"}
								className="h-3 w-3"
							/>
							{visibilityValue}
						</span>
					)}
				</div>

				{/* Created */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="calendar" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Created
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-24 rounded-lg" />
					) : (
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{topic?.createdAt ? formatRelativeTime(topic.createdAt) : "---"}
						</span>
					)}
				</div>

				{/* Topic ID */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="hash" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Topic ID
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-6 w-28 rounded-lg" />
					) : (
						<button
							className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
							type="button"
							onClick={handleCopyId}
						>
							<code className="rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
								{topic?.id}
							</code>
							<Icon
								name={copied ? "check" : "copy"}
								className={cn(
									"h-3 w-3 flex-shrink-0 transition-all",
									copied ? "text-success-base" : "text-text-sub-600",
								)}
							/>
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
