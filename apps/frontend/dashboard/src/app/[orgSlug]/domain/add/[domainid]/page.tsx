"use client";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";

import { Globe } from "../../globe";

const NewDomainPage = () => {
	return (
		<div className="mx-auto max-w-5xl">
			<div className="my-10 flex items-center gap-3">
				<Globe />
				<div>
					<h1 className="font-medium text-title-h4 leading-8">Add Domain</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Add a new domain and start sending emails from your domain
					</p>
				</div>
			</div>
			<div className="relative my-10 ml-8 border-stroke-soft-200 border-l py-10">
				<div className="relative flex flex-col pl-10">
					<div className="-left-3.5 absolute top-4 rounded-full bg-bg-white-0 p-2">
						<div className="h-3 w-3 rounded-full border-2 border-success-base bg-bg-white-0" />
					</div>
					<div className="rounded-2xl border border-success-light bg-success-base/5 p-4">
						<div className="flex items-center gap-2">
							<p className="font-medium text-title-h6">Domain</p>
							<Icon
								name="checkbox-circle"
								className="mt-1 h-3.5 w-3.5 text-success-base"
							/>
						</div>
						<p className="w-60 text-sm text-text-sub-600">New added domain</p>
						<p className="mt-3 w-96 rounded-lg border border-success-light px-3 py-1.5">
							dkim.example.com
						</p>
					</div>
				</div>
				<div className="relative mt-10 pl-10">
					<div className="-left-3.5 absolute top-1 rounded-full bg-bg-white-0 p-2">
						<div className=" h-3 w-3 rounded-full border-2 border-stroke-soft-200 bg-bg-white-0" />
					</div>
					<p className="font-medium text-text-sub-600 text-title-h5">
						DNS Records
					</p>
					<div className="my-4 rounded-xl border border-stroke-soft-200 bg-neutral-alpha-10">
						<div className="space-y-1 px-4 py-4">
							<div className="font-medium text-text-strong-950 leading-4">
								DKIM, SPF, and DMARC
							</div>
							<div className="text-paragraph-sm text-text-sub-600">
								Add the DNS records to your domain to start sending emails.
							</div>
						</div>
						<div className="mx-0.5 mb-0.5 rounded-lg bg-bg-white-0 p-4" />
					</div>
					<Button.Root className="mt-5" size="xsmall" variant="neutral">
						I have add the DNS records
					</Button.Root>
				</div>
			</div>
		</div>
	);
};

export default NewDomainPage;
