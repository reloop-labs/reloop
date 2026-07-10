"use client";

export type SignupInviteStatus = {
	required: boolean;
};

export type SignupInviteValidation = {
	valid: boolean;
	required: boolean;
	email: string | null;
	code: string | null;
	expiresAt?: string;
	message?: string;
};

export async function fetchSignupInviteStatus(): Promise<SignupInviteStatus> {
	const res = await fetch("/api/auth/v1/signup-invite/status", {
		credentials: "include",
	});
	if (!res.ok) {
		return { required: false };
	}
	return res.json();
}

export async function validateSignupInviteCode(
	code: string,
): Promise<SignupInviteValidation> {
	const res = await fetch(
		`/api/auth/v1/signup-invite/validate?code=${encodeURIComponent(code)}`,
		{ credentials: "include" },
	);
	const data = (await res.json()) as SignupInviteValidation;
	return data;
}
