export const getDomainSubString = (domain: string) => {
	if (domain.split(".").length >= 3) {
		const subDomain = domain.split(".").slice(0, -2).join(".");
		return `inbound.email.${subDomain}`;
	}
	return "inbound.email";
};

export const getCustomReturnPathSubString = (
	domain: string,
	customReturnPath = "inbound.email",
) => {
	if (domain.split(".").length >= 3) {
		const subDomain = domain.split(".").slice(0, -2).join(".");
		return `${customReturnPath}.${subDomain}`;
	}
	return customReturnPath;
};

export const getDomainHost = (domain: string) => {
	if (domain.split(".").length >= 3) {
		return domain.split(".").slice(-2).join(".");
	}
	return domain;
};
