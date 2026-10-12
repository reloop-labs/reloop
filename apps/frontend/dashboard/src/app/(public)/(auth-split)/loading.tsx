import { AuthSessionLoader } from "#/features/auth/auth-session-loader";

/** Keeps the loader inside the form column so the shared left panel stays put. */
export default function AuthSplitLoading() {
	return <AuthSessionLoader />;
}
