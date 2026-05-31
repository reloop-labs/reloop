import { ClickedStep } from "./clicked";
import { DeliveredStep } from "./delivered";
import { OpenedStep } from "./opened";
import { SentStep } from "./sent";
import { FailedStep } from "./failed";

export const TIMELINE_COMPONENTS = [
	SentStep,
	DeliveredStep,
	OpenedStep,
	ClickedStep,
];

export { SentStep, DeliveredStep, OpenedStep, ClickedStep, FailedStep };

