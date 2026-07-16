import { ClickedStep } from "./clicked";
import { DeliveredStep } from "./delivered";
import { FailedStep } from "./failed";
import { OpenedStep } from "./opened";
import { SentStep } from "./sent";

export const TIMELINE_COMPONENTS = [
	SentStep,
	DeliveredStep,
	OpenedStep,
	ClickedStep,
];

export { SentStep, DeliveredStep, OpenedStep, ClickedStep, FailedStep };
