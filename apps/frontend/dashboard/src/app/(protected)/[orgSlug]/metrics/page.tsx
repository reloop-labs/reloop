"use client";
import { parseAsString, useQueryState } from "nuqs";
import { DateRangeFilter } from "../emails/components/date-range-filter";
import { DomainSelector } from "../emails/components/domain-selector";

const MetricsPage = () => {
	const [selectedDomain, setSelectedDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);
	const [startDate, setStartDate] = useQueryState(
		"start_date",
		parseAsString.withDefault(""),
	);
	const [endDate, setEndDate] = useQueryState(
		"end_date",
		parseAsString.withDefault(""),
	);
	const [datePreset, setDatePreset] = useQueryState(
		"preset",
		parseAsString.withDefault(""),
	);

	const handleDateChange = (
		newStartDate: string | null,
		newEndDate: string | null,
		preset: string | null,
	) => {
		setStartDate(newStartDate || "");
		setEndDate(newEndDate || "");
		setDatePreset(preset || "");
	};

	return (
		<div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
			<div className="flex items-center justify-between pb-10">
				<div className="flex flex-col gap-1">
					<h1 className="font-medium text-2xl">Metrics</h1>
				</div>
				<div className="flex items-center gap-2">
					<DateRangeFilter
						startDate={startDate || null}
						endDate={endDate || null}
						activePreset={datePreset || null}
						onDateChange={handleDateChange}
					/>
					<DomainSelector
						value={selectedDomain}
						onChange={(val) => {
							setSelectedDomain(val);
						}}
					/>
				</div>
			</div>
			<p className="text-text-sub-600">
				Deliverability overview and more coming soon...
			</p>
		</div>
	);
};

export default MetricsPage;
