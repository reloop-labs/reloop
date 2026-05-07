/**
 * Generates a deterministic Tailwind gradient class pair based on an email address.
 * The same email always produces the same color combination.
 */

const AVATAR_GRADIENTS = [
	"from-rose-500 to-pink-600",
	"from-pink-500 to-fuchsia-600",
	"from-fuchsia-500 to-purple-600",
	"from-purple-500 to-indigo-600",
	"from-indigo-500 to-blue-600",
	"from-blue-500 to-cyan-600",
	"from-cyan-500 to-teal-600",
	"from-teal-500 to-emerald-600",
	"from-emerald-500 to-green-600",
	"from-green-500 to-lime-600",
	"from-lime-500 to-yellow-600",
	"from-yellow-500 to-amber-600",
	"from-amber-500 to-orange-600",
	"from-orange-500 to-red-600",
	"from-red-500 to-rose-600",
	"from-sky-500 to-blue-600",
	"from-violet-500 to-purple-600",
	"from-slate-500 to-gray-600",
] as const;

/** Fast non-cryptographic string hash (djb2). */
function hashString(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return Math.abs(hash);
}

/**
 * Returns a stable `bg-gradient-to-br from-* to-*` Tailwind class string
 * determined solely by the provided email address.
 */
export function getAvatarGradient(email: string): string {
	const index = hashString(email) % AVATAR_GRADIENTS.length;
	return `bg-gradient-to-br ${AVATAR_GRADIENTS[index]}`;
}

/**
 * Returns the first character of a display name or email prefix, uppercased.
 */
export function getAvatarInitial(name: string | null, email: string): string {
	if (name && name.length > 0) return name.charAt(0).toUpperCase();
	const prefix = email.split("@")[0];
	return prefix ? prefix.charAt(0).toUpperCase() : "?";
}
