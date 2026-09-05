export type BannableUser = {
	banned?: boolean | null;
	banExpires?: Date | string | null;
};

export function isUserBanned(
	user: BannableUser | null | undefined,
	nowMs: number = Date.now(),
): boolean {
	if (!user?.banned) return false;
	if (user.banExpires == null) return true;
	const ms =
		user.banExpires instanceof Date
			? user.banExpires.getTime()
			: typeof user.banExpires === "number"
				? user.banExpires
				: Date.parse(String(user.banExpires));
	if (Number.isNaN(ms)) return true;
	return ms > nowMs;
}
