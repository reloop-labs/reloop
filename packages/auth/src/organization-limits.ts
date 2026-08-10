/** Max length for organization display names (create + update). */
export const ORGANIZATION_NAME_MAX_LENGTH = 100;

export function organizationNameTooLong(name: string): boolean {
	return name.length > ORGANIZATION_NAME_MAX_LENGTH;
}

export function organizationNameMaxLengthMessage(
	max = ORGANIZATION_NAME_MAX_LENGTH,
): string {
	return `Organization name must be ${max} characters or fewer`;
}
