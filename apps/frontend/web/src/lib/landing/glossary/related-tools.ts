/**
 * Glossary term → the free tool that checks it. Links definition pages
 * (informational searches) to tool pages (where clicks convert).
 */
const TOOL_BY_TERM: Record<string, string> = {
	authentication: "/tools/auth-checker",
	bimi: "/tools/bimi-checker",
	blocklist: "/tools/blocklist-checker",
	bounce: "/tools/email-validator",
	"bounce-rate": "/tools/email-validator",
	"catch-all": "/tools/email-validator",
	"content-filtering": "/tools/email-spam-words-checker",
	deliverability: "/tools/deliverability-tester",
	dkim: "/tools/auth-checker",
	dmarc: "/tools/auth-checker",
	dns: "/tools/dns-lookup",
	"domain-reputation": "/tools/domain-reputation-checker",
	"email-validation": "/tools/email-validator",
	"hard-bounce": "/tools/email-validator",
	"inbox-placement": "/tools/deliverability-tester",
	"ip-reputation": "/tools/blocklist-checker",
	"ip-warming": "/tools/domain-warmup-checker",
	"list-hygiene": "/tools/temp-email-checker",
	"mx-record": "/tools/dns-lookup",
	rbl: "/tools/blocklist-checker",
	reputation: "/tools/domain-reputation-checker",
	"return-path": "/tools/auth-checker",
	"reverse-dns": "/tools/dns-lookup",
	"seed-list": "/tools/deliverability-tester",
	"soft-bounce": "/tools/email-validator",
	"spam-trap": "/tools/blocklist-checker",
	spf: "/tools/auth-checker",
};

export function relatedToolPath(slug: string): string | undefined {
	return TOOL_BY_TERM[slug];
}
