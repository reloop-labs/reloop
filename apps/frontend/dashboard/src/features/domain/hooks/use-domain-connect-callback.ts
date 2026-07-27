"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface DomainConnectCallbackOptions {
	onSuccess?: () => void;
}

export type DomainConnectCallback = {
	status: string;
	error: string | null;
	nextSearch: string;
};

export function consumeDomainConnectCallback(
	search: string | URLSearchParams,
): DomainConnectCallback | null {
	const params =
		typeof search === "string" ? new URLSearchParams(search) : search;
	const status = params.get("dc_status");
	if (!status) return null;

	const error = params.get("dc_error");
	const nextParams = new URLSearchParams(params.toString());
	nextParams.delete("dc_status");
	nextParams.delete("dc_error");

	return {
		status,
		error,
		nextSearch: nextParams.toString(),
	};
}

/**
 * Handles the query parameters returned by Domain Connect providers.
 *
 * The provider redirects back to the current dashboard surface with
 * `dc_status` and an optional `dc_error`. Consume the callback once, notify the
 * user, and remove only those callback parameters while retaining all other
 * URL state.
 */
export function useDomainConnectCallback({
	onSuccess,
}: DomainConnectCallbackOptions = {}) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const onSuccessRef = useRef(onSuccess);

	useEffect(() => {
		onSuccessRef.current = onSuccess;
	}, [onSuccess]);

	useEffect(() => {
		const callback = consumeDomainConnectCallback(searchParams);
		if (!callback) return;

		switch (callback.status) {
			case "success":
				toast.success(
					"DNS records configured successfully! Verification started.",
				);
				onSuccessRef.current?.();
				break;
			case "cancelled":
				toast.info(
					"Auto-configuration was cancelled. You can try again or configure manually.",
				);
				break;
			case "error":
				toast.error(callback.error || "Auto-configuration failed");
				break;
		}

		router.replace(
			callback.nextSearch ? `${pathname}?${callback.nextSearch}` : pathname,
			{ scroll: false },
		);
	}, [pathname, router, searchParams]);
}
