"use client";

import { Loader } from "@dot-loaders/react";
import { authClient } from "@reloop/auth/client";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { useRouter } from "next/navigation";
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";

type AdminUser = {
	id: string;
	name: string;
	email: string;
	role?: string | null;
	image?: string | null;
};

type PlatformAdminContextValue = {
	user: AdminUser | null;
	isLoading: boolean;
	isAdmin: boolean;
	isImpersonating: boolean;
};

const PlatformAdminContext = createContext<PlatformAdminContextValue>({
	user: null,
	isLoading: true,
	isAdmin: false,
	isImpersonating: false,
});

export function usePlatformAdmin() {
	return useContext(PlatformAdminContext);
}

export function PlatformAdminProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const hasRedirected = useRef(false);

	const user = (session?.user as AdminUser | undefined) ?? null;
	const isAdmin = user?.role === PLATFORM_ADMIN_ROLE;
	const isImpersonating = Boolean(
		(session as { session?: { impersonatedBy?: string } } | null)?.session
			?.impersonatedBy,
	);
	const isReady = !isPending && session !== undefined && isAdmin;

	useEffect(() => {
		if (isPending) return;
		if (session === null) {
			if (!hasRedirected.current) {
				hasRedirected.current = true;
				router.replace("/login");
			}
			return;
		}
		if (user && user.role !== PLATFORM_ADMIN_ROLE) {
			if (!hasRedirected.current) {
				hasRedirected.current = true;
				router.replace("/forbidden");
			}
		}
	}, [isPending, session, user, router]);

	const value = useMemo(
		() => ({
			user: isAdmin ? user : null,
			isLoading: !isReady,
			isAdmin,
			isImpersonating,
		}),
		[user, isReady, isAdmin, isImpersonating],
	);

	// Always render {children} so Next.js can validate route segments for
	// instant navigation. Gate access with an overlay instead of omitting children.
	return (
		<PlatformAdminContext.Provider value={value}>
			{!isReady ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-white-0">
					<Loader loader="pulse" />
				</div>
			) : null}
			{children}
		</PlatformAdminContext.Provider>
	);
}
