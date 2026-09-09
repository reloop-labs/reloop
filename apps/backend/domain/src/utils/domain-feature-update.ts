export type DomainFeatureFlags = {
	sending: boolean;
	receiving: boolean;
	clickTracking: boolean;
	openTracking: boolean;
};

export type DomainFeatureUpdate = {
	sending?: boolean;
	receiving?: boolean;
	clickTracking?: boolean;
	openTracking?: boolean;
};

function nextFlag(update: boolean | undefined, current: boolean): boolean {
	return update !== undefined ? update : current;
}

export function resolveDomainFeatureFlags(
	current: DomainFeatureFlags,
	update: DomainFeatureUpdate,
): DomainFeatureFlags {
	return {
		sending: nextFlag(update.sending, current.sending),
		receiving: nextFlag(update.receiving, current.receiving),
		clickTracking: nextFlag(update.clickTracking, current.clickTracking),
		openTracking: nextFlag(update.openTracking, current.openTracking),
	};
}

/**
 * Full-domain re-verify (status → verifying) only when a feature is newly
 * turned on. Disabling sending/receiving/tracking must not flip domain status.
 */
export function shouldReverifyDomainAfterFeatureUpdate({
	previousStatus,
	previous,
	next,
}: {
	previousStatus: string;
	previous: DomainFeatureFlags;
	next: DomainFeatureFlags;
}): boolean {
	if (previousStatus === "pending") return false;

	const sendingTurnedOn = next.sending && !previous.sending;
	const receivingTurnedOn = next.receiving && !previous.receiving;
	const trackingTurnedOn =
		(next.clickTracking && !previous.clickTracking) ||
		(next.openTracking && !previous.openTracking);

	return sendingTurnedOn || receivingTurnedOn || trackingTurnedOn;
}

export function sendingTurnedOff(
	previous: DomainFeatureFlags,
	next: DomainFeatureFlags,
): boolean {
	return previous.sending && !next.sending;
}

export function receivingTurnedOff(
	previous: DomainFeatureFlags,
	next: DomainFeatureFlags,
): boolean {
	return previous.receiving && !next.receiving;
}

export function trackingTurnedOff(
	previous: DomainFeatureFlags,
	next: DomainFeatureFlags,
): boolean {
	const wasOn = previous.clickTracking || previous.openTracking;
	const isOn = next.clickTracking || next.openTracking;
	return wasOn && !isOn;
}
