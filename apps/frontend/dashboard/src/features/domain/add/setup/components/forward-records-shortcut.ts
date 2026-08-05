/** Tracks F→R sequence for "Forward records" without clobbering bare R (receiving). */
let forwardFPressedAt = 0;

const SEQUENCE_MS = 900;

export function noteForwardFKey() {
	forwardFPressedAt = Date.now();
}

/** True if F was pressed within the sequence window (R should open Forward, not toggle receiving). */
export function isForwardRecordsSequence(): boolean {
	return Date.now() - forwardFPressedAt < SEQUENCE_MS;
}
