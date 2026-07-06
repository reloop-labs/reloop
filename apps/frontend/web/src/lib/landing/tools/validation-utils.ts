export type CheckStatus = "pass" | "fail" | "warn" | "unknown";

export type ValidationCheck = {
	label: string;
	status: CheckStatus;
	detail: string;
};

export type EmailValidationResult = {
	email: string;
	valid: boolean;
	summary: string;
	checks: ValidationCheck[];
};

const DISPOSABLE_DOMAINS = new Set([
	"mailinator.com",
	"guerrillamail.com",
	"tempmail.com",
	"throwaway.email",
	"yopmail.com",
]);

const ROLE_LOCAL_PARTS = new Set([
	"admin",
	"info",
	"support",
	"sales",
	"noreply",
	"no-reply",
	"postmaster",
]);

const COMMON_TYPOS: Record<string, string> = {
	"gmial.com": "gmail.com",
	"gmal.com": "gmail.com",
	"gnail.com": "gmail.com",
	"hotmial.com": "hotmail.com",
	"outlok.com": "outlook.com",
	"yahooo.com": "yahoo.com",
};

const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

async function lookupMx(domain: string): Promise<boolean | null> {
	try {
		const res = await fetch(
			`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
		);
		const data = (await res.json()) as { Answer?: unknown[]; Status?: number };
		if (data.Status === 3) return false;
		return Array.isArray(data.Answer) && data.Answer.length > 0;
	} catch {
		return null;
	}
}

export async function validateEmailAddress(
	raw: string,
): Promise<EmailValidationResult> {
	const email = raw.trim().toLowerCase();
	const checks: ValidationCheck[] = [];

	if (!email) {
		return {
			email: raw,
			valid: false,
			summary: "Enter an email address to validate.",
			checks: [],
		};
	}

	const atIndex = email.lastIndexOf("@");
	if (atIndex <= 0 || atIndex === email.length - 1) {
		checks.push({
			label: "Format",
			status: "fail",
			detail: "Missing or invalid @ symbol.",
		});
		return {
			email,
			valid: false,
			summary: "Invalid email format.",
			checks,
		};
	}

	const local = email.slice(0, atIndex);
	const domain = email.slice(atIndex + 1);

	if (EMAIL_REGEX.test(email)) {
		checks.push({
			label: "Format",
			status: "pass",
			detail: "RFC 5322 syntax looks correct.",
		});
	} else {
		checks.push({
			label: "Format",
			status: "fail",
			detail: "Does not match standard email format.",
		});
	}

	if (domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".")) {
		checks.push({
			label: "Domain",
			status: "pass",
			detail: domain,
		});
	} else {
		checks.push({
			label: "Domain",
			status: "fail",
			detail: "Domain is missing or malformed.",
		});
	}

	const typoFix = COMMON_TYPOS[domain];
	if (typoFix) {
		checks.push({
			label: "Typo check",
			status: "warn",
			detail: `Did you mean ${local}@${typoFix}?`,
		});
	} else {
		checks.push({
			label: "Typo check",
			status: "pass",
			detail: "No common domain typos detected.",
		});
	}

	if (DISPOSABLE_DOMAINS.has(domain)) {
		checks.push({
			label: "Disposable",
			status: "warn",
			detail: "This looks like a disposable email provider.",
		});
	} else {
		checks.push({
			label: "Disposable",
			status: "pass",
			detail: "Not a known disposable domain.",
		});
	}

	if (ROLE_LOCAL_PARTS.has(local)) {
		checks.push({
			label: "Role address",
			status: "warn",
			detail: "Role-based addresses often have lower engagement.",
		});
	} else {
		checks.push({
			label: "Role address",
			status: "pass",
			detail: "Personal or custom local part.",
		});
	}

	const mxExists = await lookupMx(domain);
	if (mxExists === true) {
		checks.push({
			label: "MX records",
			status: "pass",
			detail: "Domain accepts mail (MX found).",
		});
	} else if (mxExists === false) {
		checks.push({
			label: "MX records",
			status: "fail",
			detail: "No MX records found for this domain.",
		});
	} else {
		checks.push({
			label: "MX records",
			status: "unknown",
			detail: "Could not verify MX (try again or use Reloop API).",
		});
	}

	const hasFail = checks.some((c) => c.status === "fail");
	const valid = !hasFail && checks.some((c) => c.label === "Format" && c.status === "pass");

	return {
		email,
		valid,
		summary: valid
			? "This address looks deliverable."
			: hasFail
				? "This address has issues that may cause bounces."
				: "Review warnings before sending.",
		checks,
	};
}

export async function lookupTxtRecords(name: string): Promise<string[]> {
	try {
		const res = await fetch(
			`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`,
		);
		const data = (await res.json()) as {
			Answer?: { data?: string }[];
		};
		if (!data.Answer) return [];
		return data.Answer.map((a) => (a.data ?? "").replace(/^"|"$/g, "").replace(/"\s+"/g, ""));
	} catch {
		return [];
	}
}

export type AuthRecordResult = {
	label: string;
	status: CheckStatus;
	record?: string;
	detail: string;
};

export async function checkDomainAuth(domain: string): Promise<AuthRecordResult[]> {
	const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0] ?? "";
	if (!clean || !clean.includes(".")) {
		return [
			{
				label: "Domain",
				status: "fail",
				detail: "Enter a valid domain like yourdomain.com",
			},
		];
	}

	const [spfRecords, dmarcRecords] = await Promise.all([
		lookupTxtRecords(clean),
		lookupTxtRecords(`_dmarc.${clean}`),
	]);

	const spf = spfRecords.find((r) => r.startsWith("v=spf1"));
	const dmarc = dmarcRecords.find((r) => r.startsWith("v=DMARC1"));

	const results: AuthRecordResult[] = [];

	results.push(
		spf
			? {
					label: "SPF",
					status: "pass",
					record: spf,
					detail: "SPF record found.",
				}
			: {
					label: "SPF",
					status: "fail",
					record: undefined,
					detail: "No SPF TXT record found.",
				},
	);

	results.push({
		label: "DKIM",
		status: "unknown",
		detail:
			"DKIM uses selector-specific records. Add your domain in Reloop for exact DKIM values.",
	});

	results.push(
		dmarc
			? {
					label: "DMARC",
					status: "pass",
					record: dmarc,
					detail: "DMARC policy record found.",
				}
			: {
					label: "DMARC",
					status: "warn",
					record: undefined,
					detail: "No _dmarc TXT record found.",
				},
	);

	return results;
}
