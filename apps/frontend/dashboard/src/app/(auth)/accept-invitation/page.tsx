"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Spinner from "@reloop/ui/spinner";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type InviteStatus = "loading" | "valid" | "invalid" | "expired" | "accepted" | "error";

interface InviteDetails {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  inviterEmail?: string;
  role: string;
  email: string;
}

const AcceptInvitationContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invitationId = searchParams.get("id");

  const [status, setStatus] = useState<InviteStatus>("loading");
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Check invitation validity
  useEffect(() => {
    const checkInvitation = async () => {
      if (!invitationId) {
        setStatus("invalid");
        setError("No invitation ID provided");
        return;
      }

      try {
        // Get invitation details
        const { data, error } = await authClient.organization.getInvitation({
          query: { id: invitationId },
        });

        if (error || !data) {
          setStatus("invalid");
          setError(error?.message || "Invalid invitation");
          return;
        }

        const invitation = data;

        // Check if expired
        if (new Date(invitation.expiresAt) < new Date()) {
          setStatus("expired");
          return;
        }

        // Check if already accepted
        if (invitation.status === "accepted") {
          setStatus("accepted");
          return;
        }

        setInviteDetails({
          organizationId: invitation.organizationId,
          organizationName: invitation.organizationName,
          organizationSlug: invitation.organizationSlug,
          role: invitation.role,
          email: invitation.email,
          inviterEmail: invitation.inviterEmail,
        });
        setStatus("valid");
      } catch (err) {
        setStatus("error");
        setError("Failed to load invitation details");
      }
    };

    if (!sessionLoading) {
      checkInvitation();
    }
  }, [invitationId, sessionLoading]);

  const handleAccept = async () => {
    if (!invitationId) return;

    setAccepting(true);
    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        setError(error.message || "Failed to accept invitation");
        setAccepting(false);
        return;
      }

      // Set the newly joined organization as active
      if (inviteDetails?.organizationId) {
        await authClient.organization.setActive({
          organizationId: inviteDetails.organizationId,
        });
        await authClient.updateUser({
          activeOrganizationId: inviteDetails.organizationId,
        });
      }

      // Redirect to the organization dashboard
      router.push(`/${inviteDetails?.organizationSlug || "dashboard"}`);
    } catch (err) {
      setError("Failed to accept invitation");
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!invitationId) return;

    setDeclining(true);
    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      });

      if (error) {
        setError(error.message || "Failed to decline invitation");
        setDeclining(false);
        return;
      }

      // Redirect to home or login
      router.push("/login");
    } catch (err) {
      setError("Failed to decline invitation");
      setDeclining(false);
    }
  };

  // Loading state
  if (status === "loading" || sessionLoading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} color="var(--primary-base)" />
          <p className="text-text-sub-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Need to login first
  if (!session && status === "valid") {
    return (
      <div className="flex h-dvh flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-[440px] flex-col gap-6 p-5 md:p-8"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10 md:size-24">
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:size-16">
                <Logo className="h-10 w-10" />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <div className="title-h6 md:title-h5 text-text-strong-950">
                You're invited!
              </div>
              <div className="paragraph-sm md:paragraph-md text-text-sub-600">
                Sign in to join <span className="font-medium text-text-strong-950">{inviteDetails?.organizationName}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                <Icon name="building" className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-text-strong-950">{inviteDetails?.organizationName}</p>
                <p className="text-sm text-text-sub-600">As {inviteDetails?.role}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href={`/login?callbackUrl=${encodeURIComponent(`/accept-invitation?id=${invitationId}`)}`}>
              <Button.Root variant="primary" className="h-11 w-full">
                Sign in to accept
              </Button.Root>
            </Link>
            <Link href={`/signup?callbackUrl=${encodeURIComponent(`/accept-invitation?id=${invitationId}`)}`}>
              <Button.Root variant="neutral" mode="stroke" className="h-11 w-full">
                Create an account
              </Button.Root>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Invalid invitation
  if (status === "invalid") {
    return (
      <div className="flex h-dvh flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-[440px] flex-col items-center gap-6 p-5 md:p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-lighter">
            <Icon name="alert-circle" className="h-8 w-8 text-error-base" />
          </div>
          <div className="space-y-2">
            <h1 className="title-h5 text-text-strong-950">Invalid Invitation</h1>
            <p className="text-text-sub-600">
              {error || "This invitation link is invalid or has been revoked."}
            </p>
          </div>
          <Link href="/login">
            <Button.Root variant="neutral" mode="stroke">
              Go to Login
            </Button.Root>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Expired invitation
  if (status === "expired") {
    return (
      <div className="flex h-dvh flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-[440px] flex-col items-center gap-6 p-5 md:p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-lighter">
            <Icon name="clock" className="h-8 w-8 text-warning-base" />
          </div>
          <div className="space-y-2">
            <h1 className="title-h5 text-text-strong-950">Invitation Expired</h1>
            <p className="text-text-sub-600">
              This invitation has expired. Please ask the organization admin to send a new invitation.
            </p>
          </div>
          <Link href="/login">
            <Button.Root variant="neutral" mode="stroke">
              Go to Login
            </Button.Root>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Already accepted
  if (status === "accepted") {
    return (
      <div className="flex h-dvh flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-[440px] flex-col items-center gap-6 p-5 md:p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-lighter">
            <Icon name="check" className="h-8 w-8 text-success-base" />
          </div>
          <div className="space-y-2">
            <h1 className="title-h5 text-text-strong-950">Already Accepted</h1>
            <p className="text-text-sub-600">
              You've already accepted this invitation.
            </p>
          </div>
          <Link href="/dashboard">
            <Button.Root variant="primary">
              Go to Dashboard
            </Button.Root>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Valid invitation - show accept/decline UI
  return (
    <div className="flex h-dvh flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-[440px] flex-col gap-6 p-5 md:p-8"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10 md:size-24">
            <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset md:size-16">
              <Logo className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-1 text-center">
            <div className="title-h6 md:title-h5 text-text-strong-950">
              You're invited to join
            </div>
            <div className="title-h5 md:title-h4 text-primary-base">
              {inviteDetails?.organizationName}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
              <Icon name="building" className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-text-strong-950">{inviteDetails?.organizationName}</p>
              <p className="text-sm text-text-sub-600">/{inviteDetails?.organizationSlug}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-stroke-soft-200 pt-4">
            <div className="text-sm text-text-sub-600">Your role</div>
            <div className="rounded-full bg-primary-lighter px-3 py-1 text-sm font-medium text-primary-base">
              {inviteDetails?.role}
            </div>
          </div>

          {inviteDetails?.inviterEmail && (
            <div className="flex items-center justify-between border-t border-stroke-soft-200 pt-4">
              <div className="text-sm text-text-sub-600">Invited by</div>
              <div className="text-sm text-text-strong-950">{inviteDetails?.inviterEmail}</div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-error-lighter p-3 text-center text-sm text-error-base">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button.Root
            variant="neutral"
            mode="stroke"
            className="h-11 flex-1"
            onClick={handleDecline}
            disabled={accepting || declining}
          >
            {declining ? <Spinner size={16} color="var(--text-sub-600)" /> : "Decline"}
          </Button.Root>
          <Button.Root
            variant="primary"
            className="h-11 flex-1"
            onClick={handleAccept}
            disabled={accepting || declining}
          >
            {accepting ? <Spinner size={16} color="currentColor" /> : "Accept Invitation"}
          </Button.Root>
        </div>

        <p className="text-center text-xs text-text-sub-600">
          Logged in as <span className="font-medium">{session?.user?.email}</span>
        </p>
      </motion.div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size={32} color="var(--primary-base)" />
            <p className="text-text-sub-600">Loading invitation...</p>
          </div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
};

export default Page;
