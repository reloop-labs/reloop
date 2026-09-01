"use client";

import {
	useChannelsQuery,
	useGroupsQuery,
} from "#/features/contacts/hooks/use-contacts-query";
import type { AudienceTargetType } from "../../campaign-types";
import { useCampaignEditorStore } from "../campaign-editor-store";
import { CampaignFieldRow } from "./campaign-field-row";

export const CampaignAudienceField = () => {
	const audienceType = useCampaignEditorStore((s) => s.audienceType);
	const audienceTargetId = useCampaignEditorStore((s) => s.audienceTargetId);
	const setAudience = useCampaignEditorStore((s) => s.setAudience);

	const groupsQuery = useGroupsQuery({
		page: 1,
		limit: 50,
		search: "",
	});
	const channelsQuery = useChannelsQuery();
	const groups = groupsQuery.data?.groups || [];
	const channels = channelsQuery.data?.channels || [];

	return (
		<CampaignFieldRow
			id="campaign-send-details-audience"
			label="To"
			infoTooltip={{
				title: "Target Audience",
				description:
					"Select the target audience, contact group, or channel to receive this campaign.",
			}}
		>
			<div className="flex w-full items-center gap-2 text-label-sm">
				<select
					value={audienceType}
					onChange={(e) => {
						const val = e.target.value as AudienceTargetType;
						if (val === "all") {
							setAudience("all", "", "All Contacts");
						} else if (val === "group") {
							const firstGroup = groups[0];
							setAudience(
								"group",
								firstGroup?.id || "",
								firstGroup?.name || "Group",
							);
						} else if (val === "channel") {
							const firstChannel = channels[0];
							setAudience(
								"channel",
								firstChannel?.id || "",
								firstChannel?.name || "Channel",
							);
						}
					}}
					className="rounded-md border border-stroke-soft-200 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 outline-none dark:border-stroke-soft-100/40 dark:bg-bg-soft-200 text-xs"
				>
					<option value="all">All Contacts</option>
					<option value="group">Contact Group</option>
					<option value="channel">Channel</option>
				</select>

				{audienceType === "group" && groups.length > 0 && (
					<select
						value={audienceTargetId}
						onChange={(e) => {
							const sel = groups.find((g) => g.id === e.target.value);
							setAudience("group", e.target.value, sel?.name || "Group");
						}}
						className="rounded-md border border-stroke-soft-200 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 outline-none dark:border-stroke-soft-100/40 dark:bg-bg-soft-200 text-xs"
					>
						{groups.map((g) => (
							<option key={g.id} value={g.id}>
								{g.name}
							</option>
						))}
					</select>
				)}

				{audienceType === "channel" && channels.length > 0 && (
					<select
						value={audienceTargetId}
						onChange={(e) => {
							const sel = channels.find((c) => c.id === e.target.value);
							setAudience("channel", e.target.value, sel?.name || "Channel");
						}}
						className="rounded-md border border-stroke-soft-200 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 outline-none dark:border-stroke-soft-100/40 dark:bg-bg-soft-200 text-xs"
					>
						{channels.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				)}
			</div>
		</CampaignFieldRow>
	);
};
