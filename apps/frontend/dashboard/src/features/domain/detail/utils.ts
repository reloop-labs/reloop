export {
	DNS_SETUP_HUB_URL,
	DOMAIN_LEARN_DOCS_URL,
	type InferredDnsProvider,
	inferDnsProvider,
} from "../dns-provider";

export const getStatusBadgeStyles = (status: string) => {
	switch (status.toLowerCase()) {
		case "active":
			return "border border-success-base text-success-base bg-success-light/20";
		case "suspended":
		case "failed":
			return "border border-error-base text-error-base bg-error-light/20";
		case "verifying":
			return "border border-warning-base text-warning-base bg-warning-light/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	}
};
