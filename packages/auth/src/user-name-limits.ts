/** Max length for each of first name and last name on the user profile. */
export const USER_NAME_PART_MAX_LENGTH = 100;

export function userNamePartTooLong(part: string): boolean {
	return part.length > USER_NAME_PART_MAX_LENGTH;
}

export function userNamePartMaxLengthMessage(
	partLabel: "First name" | "Last name" | "Name" = "Name",
	max = USER_NAME_PART_MAX_LENGTH,
): string {
	return `${partLabel} must be ${max} characters or fewer`;
}

/**
 * Profile stores first + last as a single `user.name` (`${first} ${last}`).
 * Validates each part the same way the profile form reads them back.
 */
export function userDisplayNamePartsTooLong(fullName: string): boolean {
	const parts = fullName.split(" ");
	const firstName = parts[0] || "";
	const lastName = parts.slice(1).join(" ");
	return userNamePartTooLong(firstName) || userNamePartTooLong(lastName);
}
