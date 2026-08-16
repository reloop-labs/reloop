import { describe, expect, test } from "vitest";
import {
	buildHealthCards,
	formatMetricPercent,
	rateBounce,
	rateComplaint,
	rateDeliverability,
	rateOpen,
	rateUnsubscribe,
	ratingLabel,
} from "./health-ratings";

describe("health ratings", () => {
	test("rateDeliverability uses inbox placement bands", () => {
		expect(rateDeliverability(99)).toBe("excellent");
		expect(rateDeliverability(96)).toBe("good");
		expect(rateDeliverability(91)).toBe("fair");
		expect(rateDeliverability(80)).toBe("poor");
	});

	test("rateBounce and rateComplaint get worse as rates rise", () => {
		expect(rateBounce(0.4)).toBe("excellent");
		expect(rateBounce(1.85)).toBe("good");
		expect(rateBounce(3)).toBe("fair");
		expect(rateBounce(6)).toBe("poor");

		expect(rateComplaint(0.01)).toBe("excellent");
		expect(rateComplaint(0.05)).toBe("good");
		expect(rateComplaint(0.09)).toBe("fair");
		expect(rateComplaint(0.2)).toBe("poor");
	});

	test("rateOpen and rateUnsubscribe score engagement", () => {
		expect(rateOpen(30)).toBe("excellent");
		expect(rateOpen(16)).toBe("good");
		expect(rateOpen(9)).toBe("fair");
		expect(rateOpen(0)).toBe("poor");

		expect(rateUnsubscribe(0.1)).toBe("excellent");
		expect(rateUnsubscribe(0.46)).toBe("good");
		expect(rateUnsubscribe(0.8)).toBe("fair");
		expect(rateUnsubscribe(1.5)).toBe("poor");
	});

	test("formatMetricPercent matches dashboard card formatting", () => {
		expect(formatMetricPercent(0)).toBe("0%");
		expect(formatMetricPercent(100)).toBe("100%");
		expect(formatMetricPercent(1.85)).toBe("1.85%");
		expect(formatMetricPercent(0.01)).toBe("0.01%");
	});

	test("ratingLabel uses No data when there is no volume", () => {
		expect(ratingLabel(null)).toBe("No data");
		expect(ratingLabel("good")).toBe("Good");
	});

	test("buildHealthCards returns three cards and no rating with zero volume", () => {
		const empty = buildHealthCards({
			sent: 0,
			delivered: 0,
			bounced: 0,
			complaint: 0,
			opened: 0,
			unsubscribed: 0,
		});
		expect(empty.map((card) => card.id)).toEqual([
			"deliverability",
			"reputation",
			"engagement",
		]);
		expect(empty.every((card) => card.rating === null)).toBe(true);
	});

	test("buildHealthCards uses the worse signal for reputation and engagement", () => {
		const cards = buildHealthCards({
			sent: 29486,
			delivered: 29486,
			bounced: 546,
			complaint: 2,
			opened: 0,
			unsubscribed: 137,
		});

		expect(cards[0]?.rating).toBe("excellent");
		// bounce 1.85% is good, complaint is excellent → good
		expect(cards[1]?.rating).toBe("good");
		// 0% opens is poor even though unsubscribe is good
		expect(cards[2]?.rating).toBe("poor");
		expect(cards[0]?.rows[0]?.count).toBe(29486);
		expect(cards[2]?.rows[0]?.percent).toBe(0);
	});
});
