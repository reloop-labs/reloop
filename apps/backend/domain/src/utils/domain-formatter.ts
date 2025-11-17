export const getDomainSubString = (domain: string) => {
	if (domain.split(".").length >= 3) {
		const subDomain = domain.split(".").slice(0, -2).join(".");
		return `send.${subDomain}`;
	}
	return "send";
};

export const getDomainHost = (domain: string) => {
	if (domain.split(".").length >= 3) {
		return domain.split(".").slice(-2).join(".");
	}
	return domain;
};
