export type DomainResponse = {
	id: string;
	domain: string;
};

export type DomainListResponse = {
	domains?: Array<{
		id: string;
		domain: string;
	}>;
};
