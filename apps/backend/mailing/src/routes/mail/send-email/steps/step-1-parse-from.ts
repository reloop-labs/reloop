/**
 * Step 1: Parse and validate the 'from' email address format.
 */
export function parseFromAddress_step1(from: string) {
	const fromParts = from.split("@");
	if (fromParts.length < 2) {
		throw new Error("Invalid 'from' email address format");
	}
	const domainName = fromParts[1];
	if (!domainName) {
		throw new Error("Invalid 'from' email address format");
	}
	return { domainName };
}
