export const getDomainSubString = (domain: string) => {
	if (domain.split(".").length >= 3) {
		const subDomain = domain.split(".").slice(0, -2).join(".");
		return `${subDomain}`;
	}
	return "@";
};

export const getCustomReturnPathSubString = (
	domain: string,
	customPath: string,
) => {
	if (domain.split(".").length >= 3) {
		const subDomain = domain.split(".").slice(0, -2).join(".");
		return `${customPath}.${subDomain}`;
	}
	return customPath;
};

export const getDomainHost = (domain: string) => {
	if (domain.split(".").length >= 3) {
		return domain.split(".").slice(-2).join(".");
	}
	return domain;
};

/**
 * DNS "Name" for the receiving MX so mail to `user@{domain}` is delivered.
 * Apex domains use `@`; subdomain products (e.g. mail.example.com) use the
 * relative host label (mail).
 */
export const getReceivingMxName = (domain: string) => {
	if (domain.split(".").length >= 3) {
		return getDomainSubString(domain);
	}
	return "@";
};
