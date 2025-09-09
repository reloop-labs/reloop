"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import * as Input from "@reloop/ui/components/input";
import * as Label from "@reloop/ui/components/label";
import { Globe } from "../globe";

const NewDomainPage = () => {
	const { push } = useUserOrganization();
	return (
		<div className="mx-auto max-w-3xl">
			<div className="my-10 flex items-center gap-3">
				<Globe className="rounded-full" iconClassName="h-8 w-8" />
				<div>
					<h1 className="font-medium text-title-h4 leading-8">Add Domain</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Add a new domain and start sending emails from your domain
					</p>
				</div>
			</div>
			<div className="relative my-10 ml-8 border-stroke-soft-200 border-l py-10">
				<div className="relative flex flex-col pl-10">
					<div className="-left-3.5 absolute top-1 rounded-full bg-bg-white-0 p-2">
						<div className=" h-3 w-3 rounded-full border-2 bg-bg-white-0" />
					</div>
					<div className="flex gap-10">
						<div>
							<p className="font-medium text-title-h5">Domain</p>
							<p className="text-paragraph-sm text-text-sub-600">
								Add a new domain send emails from your domain
							</p>
							<div className="mt-5 w-96">
								<Label.Root htmlFor="email">
									Name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root>
									<Input.Affix>https://</Input.Affix>
									<Input.Wrapper>
										<Input.Input placeholder="www.example.com" />
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="flex w-96 justify-end">
								<Button.Root
									onClick={() => {
										push("/domain/add/example.com");
									}}
									type="button"
									className="mt-5"
									variant="neutral"
								>
									Add Domain
								</Button.Root>
							</div>
						</div>
						<div className="mt-24 h-fit rounded-2xl border border-stroke-soft-200 p-4">
							<div className="flex items-center gap-2 uppercase">
								<Icon name="bulb" className="h-4 w-4" />
								<p>Recommendations</p>
							</div>
							<p className="w-60 pt-2 text-sm text-text-sub-600">
								Use separate domain for domain reputation
							</p>
							<div className="pt-3 text-sm text-text-sub-600">
								<p>Subdomain example:</p>
								<ul className="list-disc pl-5">
									<li>marketing.example.com</li>
									<li>send.example.com</li>
									<li>transection.example.com</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
				<div className="relative mt-10 pl-10">
					<div className="-left-3.5 absolute top-1 rounded-full bg-bg-white-0 p-2">
						<div className=" h-3 w-3 rounded-full border-2 border-stroke-soft-200 bg-bg-white-0" />
					</div>
					<p className="font-medium text-text-sub-600 text-title-h5">
						DNS Records
					</p>
				</div>
			</div>
		</div>
	);
};

export default NewDomainPage;
