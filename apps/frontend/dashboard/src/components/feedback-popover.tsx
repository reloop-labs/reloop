"use client";

import { useState, useEffect } from "react";
import * as Button from "@reloop/ui/button";
import * as Popover from "@reloop/ui/popover";
import * as Textarea from "@reloop/ui/textarea";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { cn } from "@reloop/ui/cn";
import { motion, AnimatePresence } from "motion/react";

export const FeedbackPopover = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Reset state when popover closes
    useEffect(() => {
        if (!isOpen) {
            // Delay reset to allow animation to complete
            const timer = setTimeout(() => {
                setFeedback("");
                setIsSubmitting(false);
                setIsSubmitted(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Auto-close after successful submission
    useEffect(() => {
        if (isSubmitted) {
            const timer = setTimeout(() => {
                setIsOpen(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isSubmitted]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setIsSubmitting(true);

        // Simulate API call - replace with actual API integration
        await new Promise((resolve) => setTimeout(resolve, 800));

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <Button.Root
                    variant="neutral"
                    mode="ghost"
                    size="xxsmall"
                    className={cn("gap-1.5", isOpen && "bg-bg-weak-50")}
                >
                    <Icon name="comment-text" className="h-4 w-4" />
                    Feedback
                </Button.Root>
            </Popover.Trigger>
            <Popover.Content
                align="end"
                sideOffset={8}
                showArrow={false}
                className="w-80 p-4"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isSubmitted ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center justify-center py-6 gap-3"
                        >
                            <Icon name="check-circle" className="h-6 w-6 text-green-600" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-text-strong-950">
                                    Feedback submitted!
                                </p>
                                <p className="text-xs text-text-sub-600 mt-1">
                                    Thank you for helping us improve.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3"
                        >
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-text-strong-950">
                                    Share your feedback
                                </h3>
                                <p className="text-xs text-text-sub-600">
                                    Your feedback helps us improve Reloop.
                                </p>
                            </div>

                            <div className="relative">
                                <Textarea.Root
                                    simple
                                    placeholder="What's on your mind?"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="min-h-24 text-sm pr-12 pb-10"
                                    disabled={isSubmitting}
                                />
                                <Button.Root
                                    type="submit"
                                    variant="neutral"
                                    size="xxsmall"
                                    disabled={!feedback.trim() || isSubmitting}
                                    className={cn(
                                        "absolute bottom-2.5 right-2.5",
                                        isSubmitting && "cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <Spinner size={14} color="currentColor" />
                                    ) : (
                                        <>
                                            <Icon name="send-1" className="h-4 w-4" />
                                            Send
                                        </>
                                    )}
                                </Button.Root>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </Popover.Content>
        </Popover.Root>
    );
};
