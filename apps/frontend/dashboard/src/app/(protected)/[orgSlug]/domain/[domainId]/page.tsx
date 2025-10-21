"use client";
import Spinner from "@reloop/ui/spinner";
import { useParams } from "next/navigation";
import * as React from "react";
import useSWR from "swr";
import { DNSRecordsSection } from "./components/DNSRecordsSection";
import { DomainHeader } from "./components/DomainHeader";
import { StatusBanner } from "./components/StatusBanner";

interface DNSRecord {
	recordType: string;
	name: string;
	value: string;
	ttl: number;
	priority?: number;
	description?: string;
	isVerified: boolean;
}

const DomainPage = () => {
	const { domainId } = useParams();
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());

	const {
		data: dnsRecords,
		error,
		isLoading,
	} = useSWR<DNSRecord[]>(domainId ? `/api/domain/v1/dns/${domainId}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	const copyToClipboard = async (text: string, itemId: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedItems((prev) => new Set(prev).add(itemId));
			setTimeout(() => {
				setCopiedItems((prev) => {
					const newSet = new Set(prev);
					newSet.delete(itemId);
					return newSet;
				});
			}, 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	// Separate records by type for the new UI structure
	const dkimSpfRecords =
		dnsRecords?.filter(
			(record) => record.recordType === "MX" || record.recordType === "TXT",
		) || [];

	const dmarcRecords =
		dnsRecords?.filter((record) => record.name.includes("_dmarc")) || [];

	const handleRestart = () => {
		// TODO: Implement restart functionality
		console.log("Restart domain");
	};

	const handleGoToDocs = () => {
		// TODO: Implement docs navigation
		console.log("Go to docs");
	};

	const handleRemoveDomain = () => {
		// TODO: Implement remove domain functionality
		console.log("Remove domain");
	};

	const handleHowToAddRecords = () => {
		// TODO: Implement how to add records functionality
		console.log("How to add records");
	};

	if (isLoading) {
		return (
			<div className="mx-auto mb-28 flex h-96 max-w-3xl items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-3xl">
				<DomainHeader
					domainId={domainId as string}
					status="failed"
					onRestart={handleRestart}
					onGoToDocs={handleGoToDocs}
					onRemoveDomain={handleRemoveDomain}
				/>
				<StatusBanner status="warning" />
			</div>
		);
	}

	if (!dnsRecords || dnsRecords.length === 0) {
		return (
			<div className="mx-auto max-w-3xl">
				<DomainHeader
					domainId={domainId as string}
					status="pending"
					onRestart={handleRestart}
					onGoToDocs={handleGoToDocs}
					onRemoveDomain={handleRemoveDomain}
				/>
				<StatusBanner status="warning" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl">
			<DomainHeader
				domainId={domainId as string}
				status="pending"
				onRestart={handleRestart}
				onGoToDocs={handleGoToDocs}
				onRemoveDomain={handleRemoveDomain}
			/>
			<StatusBanner status="pending" />
			<div className="my-9">
				<div className="w-full border-stroke-soft-200 border-t border-dotted" />
			</div>
			<DNSRecordsSection
				dkimSpfRecords={dkimSpfRecords}
				dmarcRecords={dmarcRecords}
				onCopyToClipboard={copyToClipboard}
				copiedItems={copiedItems}
				onHowToAddRecords={handleHowToAddRecords}
			/>
		</div>
	);
};

export default DomainPage;
