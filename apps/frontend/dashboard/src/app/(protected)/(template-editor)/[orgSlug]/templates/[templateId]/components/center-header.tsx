"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import * as Button from "@reloop/ui/button";

interface FieldRowProps {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    suffixDropdown?: React.ReactNode;
    hideBorder?: boolean;
}

const FieldRow = ({ label, value, placeholder, onChange, suffixDropdown, hideBorder }: FieldRowProps) => {
    return (
        <div className={cn("flex items-center py-3 border-b border-stroke-soft-100/50 px-6", hideBorder && "border-b-0")}>
            <label className="w-20 shrink-0 text-sm text-text-sub-600">{label}</label>
            <div className="flex-1 flex items-center">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-text-strong-950 placeholder:text-text-soft-400 outline-none"
                />
                {suffixDropdown}
            </div>
        </div>
    );
};

const availableDomains = [
    { value: "prolab.sh", label: "@prolab.sh" },
    { value: "reloop.sh", label: "@reloop.sh" },
    { value: "example.com", label: "@example.com" },
];

interface DomainDropdownProps {
    value: string;
    onChange: (value: string) => void;
}

const DomainDropdown = ({ value, onChange }: DomainDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
    const buttonRefs = useRef<HTMLButtonElement[]>([]);

    // Find the selected item's index
    const selectedIdx = availableDomains.findIndex(d => d.value === value);

    // Use hover index if hovering, otherwise use selected index
    const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;
    const currentTab = buttonRefs.current[activeIdx];
    const currentRect = currentTab?.getBoundingClientRect();

    const handleSelect = (domainValue: string) => {
        onChange(domainValue);
        setIsOpen(false);
    };

    const selectedLabel = availableDomains.find(d => d.value === value)?.label || `@${value}`;

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-0.5 text-sm transition-colors duration-200 cursor-pointer px-3 py-1 rounded-lg",
                        isOpen ? "text-text-strong-950 bg-neutral-alpha-10" : "text-text-sub-600 hover:text-text-strong-950"
                    )}
                >
                    {selectedLabel}
                    <Icon
                        name="chevron-down"
                        className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isOpen && "rotate-180"
                        )}
                    />
                </button>
            </Popover.Trigger>
            <Popover.Content align="end" sideOffset={0} className="w-40 p-1.5 rounded-xl">
                <div className="relative">
                    {availableDomains.map((domain, idx) => (
                        <button
                            key={domain.value}
                            ref={(el) => {
                                if (el) buttonRefs.current[idx] = el;
                            }}
                            type="button"
                            onPointerEnter={() => setHoverIdx(idx)}
                            onPointerLeave={() => setHoverIdx(undefined)}
                            onClick={() => handleSelect(domain.value)}
                            className={cn(
                                "flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-normal transition-colors relative z-10",
                                value === domain.value ? "text-text-strong-950" : "text-text-sub-600"
                            )}
                        >
                            <span>{domain.label}</span>
                            {value === domain.value && (
                                <Icon name="check" className="h-3 w-3 text-text-strong-950" />
                            )}
                        </button>
                    ))}
                    <AnimatedHoverBackground
                        rect={currentRect}
                        tabElement={currentTab}
                    />
                </div>
            </Popover.Content>
        </Popover.Root>
    );
};

export const CenterHeader = () => {
    const [sender, setSender] = useState("Test");
    const [from, setFrom] = useState("pranavkp.me");
    const [selectedDomain, setSelectedDomain] = useState("prolab.sh");
    const [reply, setReply] = useState("pranavkp.me@outlook.com");
    const [subject, setSubject] = useState("");
    const [showDetails, setShowDetails] = useQueryState('showDetails', parseAsBoolean)

    return (
        <div className="border border-stroke-soft-100/50 max-w-3xl mx-auto rounded-2xl mt-4 relative">
            <Button.Root onClick={() => setShowDetails(!showDetails)} mode="ghost" variant="neutral" size="xxsmall" className="absolute right-4 top-2">
                <Button.Icon as={Icon} name="chevron-down" className={cn("transition-transform duration-200 h-4 w-4 text-text-soft-400", showDetails && "rotate-180")} />
            </Button.Root>
            <FieldRow
                label="Sender"
                value={sender}
                onChange={setSender}
                hideBorder={!showDetails}
            />
            {showDetails && <>
                <FieldRow
                    label="From"
                    value={from}
                    onChange={setFrom}
                    suffixDropdown={
                        <DomainDropdown
                            value={selectedDomain}
                            onChange={setSelectedDomain}
                        />
                    }
                />
                <FieldRow
                    label="Reply"
                    value={reply}
                    onChange={setReply}
                />
                <FieldRow
                    label="Subject"
                    value={subject}
                    placeholder="Subject line"
                    onChange={setSubject}
                    hideBorder
                />
            </>}
        </div>
    );
};
