"use client";

import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useRef, useState } from "react";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

interface WorkspaceSlugInputProps {
	initialSlug: string;
	onSlugChange: (slug: string, status: SlugStatus) => void;
	currentOrgSlug: string;
}

export const WorkspaceSlugInput = ({
	initialSlug,
	onSlugChange,
	currentOrgSlug,
}: WorkspaceSlugInputProps) => {
	const [slug, setSlug] = useState(initialSlug);
	const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
	const slugCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const handleSlugChange = async (newSlug: string) => {
		const normalizedSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
		setSlug(normalizedSlug);

		// Clear any pending timeout
		if (slugCheckTimeoutRef.current) {
			clearTimeout(slugCheckTimeoutRef.current);
		}

		if (!normalizedSlug || normalizedSlug.length < 2) {
			setSlugStatus("idle");
			onSlugChange(normalizedSlug, "idle");
			return;
		}

		// If slug is the same as current organization slug, it's available
		if (normalizedSlug === currentOrgSlug) {
			setSlugStatus("available");
			onSlugChange(normalizedSlug, "available");
			return;
		}

		setSlugStatus("checking");
		onSlugChange(normalizedSlug, "checking");

		slugCheckTimeoutRef.current = setTimeout(async () => {
			try {
				const { data } = await authClient.organization.checkSlug({
					slug: normalizedSlug,
				});
				const status = data?.status ? "available" : "taken";
				setSlugStatus(status);
				onSlugChange(normalizedSlug, status);
			} catch {
				setSlugStatus("error");
				onSlugChange(normalizedSlug, "error");
			}
		}, 500);
	};

	return (
		<div>
			<Label.Root htmlFor="slug">Workspace Slug</Label.Root>
			<Input.Root
				size="small"
				className="mt-1 w-full"
				hasError={slugStatus === "taken"}
				hassuccess={slugStatus === "available"}
			>
				<Input.Wrapper className="gap-0">
					<Input.InlineAffix>reloop.sh/dashboard/</Input.InlineAffix>
					<Input.Input
						id="slug"
						type="text"
						placeholder="organization-slug"
						value={slug}
						onChange={(e) => handleSlugChange(e.target.value)}
					/>
					{slugStatus === "checking" && (
						<Input.InlineAffix>
							<Spinner size={16} color="var(--text-strong-950)" />
						</Input.InlineAffix>
					)}
					{slugStatus === "available" && (
						<Input.InlineAffix>
							<Icon name="check-circle" className="h-4 w-4 text-green-500" />
						</Input.InlineAffix>
					)}
					{slugStatus === "taken" && (
						<Input.InlineAffix>
							<Icon name="x-circle" className="h-4 w-4 text-red-500" />
						</Input.InlineAffix>
					)}
				</Input.Wrapper>
			</Input.Root>
			{slugStatus === "taken" ? (
				<p className="mt-1 text-paragraph-xs text-red-500">
					This workspace handle is already taken
				</p>
			) : (
				<p className="mt-1 font-medium text-paragraph-xs text-text-sub-600">
					Used in your workspace URL. Only lowercase letters, numbers and
					hyphens.
				</p>
			)}
		</div>
	);
};
