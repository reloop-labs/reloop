"use client";

import { Icon } from "@reloop/ui/icon";
import * as Select from "@reloop/ui/select";
import { useState } from "react";

interface FieldRowProps {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    hasChevron?: boolean;
    suffixDropdown?: React.ReactNode;
}

const FieldRow = ({ label, value, placeholder, onChange, hasChevron, suffixDropdown }: FieldRowProps) => {
    return (
        <div className="flex items-center py-3 border-b border-stroke-soft-100/50 px-6">
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
                {hasChevron && (
                    <Icon name="chevron-down" className="h-4 w-4 text-text-soft-400 ml-2" />
                )}
            </div>
        </div>
    );
};

const availableDomains = [
    { value: "prolab.sh", label: "@prolab.sh" },
    { value: "reloop.sh", label: "@reloop.sh" },
    { value: "example.com", label: "@example.com" },
];

export const CenterHeader = () => {
    const [sender, setSender] = useState("Test");
    const [from, setFrom] = useState("pranavkp.me");
    const [selectedDomain, setSelectedDomain] = useState("prolab.sh");
    const [reply, setReply] = useState("pranavkp.me@outlook.com");
    const [subject, setSubject] = useState("");
    const [preview, setPreview] = useState("");

    return (
        <div className="border-b border-stroke-soft-100/50 max-w-3xl mx-auto border-l border-r pb-3 rounded-b-2xl">
            <FieldRow
                label="Sender"
                value={sender}
                onChange={setSender}
                hasChevron
            />
            <FieldRow
                label="From"
                value={from}
                onChange={setFrom}
                suffixDropdown={
                    <Select.Root
                        variant="inline"
                        size="xsmall"
                        value={selectedDomain}
                        onValueChange={setSelectedDomain}
                    >
                        <Select.Trigger>
                            <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                            {availableDomains.map((domain) => (
                                <Select.Item key={domain.value} value={domain.value}>
                                    {domain.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
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
            />
            <FieldRow
                label="Preview"
                value={preview}
                placeholder="Optional preview text"
                onChange={setPreview}
            />
        </div>
    );
};
