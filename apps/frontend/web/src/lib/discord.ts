import { cacheLife } from "next/cache";

export const discordGuildId = "1390212514658123836";

export type DiscordWidget = {
	name: string;
	inviteUrl: string | null;
	onlineCount: number;
	members: { id: string; username: string; avatarUrl: string }[];
};

type WidgetResponse = {
	name?: string;
	instant_invite?: string | null;
	presence_count?: number;
	members?: { id: string; username: string; avatar_url: string }[];
};

export async function getDiscordWidget(): Promise<DiscordWidget | null> {
	"use cache";
	cacheLife("minutes");
	try {
		const response = await fetch(
			`https://discord.com/api/guilds/${discordGuildId}/widget.json`,
		);
		if (!response.ok) return null;
		const data = (await response.json()) as WidgetResponse;
		return {
			name: data.name ?? "Reloop",
			inviteUrl: data.instant_invite ?? null,
			onlineCount: data.presence_count ?? 0,
			members: (data.members ?? []).slice(0, 8).map((member) => ({
				id: member.id,
				username: member.username,
				avatarUrl: member.avatar_url,
			})),
		};
	} catch {
		return null;
	}
}
