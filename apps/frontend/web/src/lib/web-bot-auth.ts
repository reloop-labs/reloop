import { createHash, createPrivateKey, sign } from "node:crypto";

/**
 * Web Bot Auth key directory (draft-meunier-http-message-signatures-directory).
 * `WEB_BOT_AUTH_PRIVATE_JWK` holds the Ed25519 private JWK as JSON, including
 * `nbf`/`exp` (Unix seconds). The public half is published; the private `d`
 * signs the directory response so verifiers can prove we own the key.
 */
type PrivateJwk = {
	kty: "OKP";
	crv: "Ed25519";
	x: string;
	d: string;
	nbf: number;
	exp: number;
};

export const DIRECTORY_CONTENT_TYPE =
	"application/http-message-signatures-directory+json";

function loadKey(): PrivateJwk | null {
	const raw = process.env.WEB_BOT_AUTH_PRIVATE_JWK;
	if (!raw) return null;
	const jwk = JSON.parse(raw) as PrivateJwk;
	if (jwk.kty !== "OKP" || jwk.crv !== "Ed25519" || !jwk.x || !jwk.d) {
		throw new Error("WEB_BOT_AUTH_PRIVATE_JWK must be an Ed25519 private JWK");
	}
	return jwk;
}

/** RFC 7638 JWK thumbprint: base64url SHA-256 of the required members in lexical order. */
function thumbprint(jwk: Pick<PrivateJwk, "crv" | "kty" | "x">): string {
	const canonical = JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x });
	return createHash("sha256").update(canonical).digest("base64url");
}

export function directoryResponse(request: Request): Response {
	const key = loadKey();
	if (!key) return new Response("Not found", { status: 404 });

	const kid = thumbprint(key);
	const body = JSON.stringify({
		keys: [
			{ kty: key.kty, crv: key.crv, x: key.x, kid, nbf: key.nbf, exp: key.exp },
		],
	});

	// RFC 9421 response signature covering the request authority.
	const created = Math.floor(Date.now() / 1000);
	const params = `("@authority";req);created=${created};expires=${created + 300};keyid="${kid}";alg="ed25519";tag="http-message-signatures-directory"`;
	const base = `"@authority";req: ${new URL(request.url).host}\n"@signature-params": ${params}`;
	const signature = sign(
		null,
		Buffer.from(base),
		createPrivateKey({ key: key, format: "jwk" }),
	).toString("base64");

	return new Response(body, {
		headers: {
			"Content-Type": DIRECTORY_CONTENT_TYPE,
			"Cache-Control": "public, max-age=86400",
			"Signature-Input": `sig1=${params}`,
			Signature: `sig1=:${signature}:`,
		},
	});
}
