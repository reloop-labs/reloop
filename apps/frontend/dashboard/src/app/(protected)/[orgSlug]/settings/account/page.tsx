"use client";

import { authClient } from "@reloop/auth/client";
import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as StatusBadge from "@reloop/ui/status-badge";
const AccountPage = () => {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [imagePreview, setImagePreview] = useState(user?.image || "");
  const [imageUrl, setImageUrl] = useState(user?.image || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse first and last name from full name
  useEffect(() => {
    if (user?.name) {
      const nameParts = user.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
    }
    if (user?.image) {
      setImagePreview(user.image);
      setImageUrl(user.image);
    }
  }, [user?.name, user?.image]);

  // Combine first and last name for comparison
  const fullName = `${firstName} ${lastName}`.trim();

  // Check if there are any changes
  const hasChanges =
    fullName !== (user?.name || "") || imageUrl !== (user?.image || "");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to upload service
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data: uploadData } = await axios.post(
        "/api/upload/v1/upload",
        formData,
        { withCredentials: true },
      );

      const uploadedUrl = uploadData.url;
      setImageUrl(uploadedUrl);

      // Immediately save to database
      const { error } = await authClient.updateUser({
        image: uploadedUrl,
      });

      if (error) {
        toast.error(error.message || "Failed to save profile picture");
        return;
      }

      // Refresh session data
      await refetch();
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setIsUploading(false);
          return;
        }
        const errorMessage =
          error.response?.data?.message ||
          "Failed to upload file. Please try again.";
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to upload profile picture.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const { error } = await authClient.updateUser({
        name: fullName,
        image: imageUrl || undefined,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
        return;
      }

      // Refresh session data
      await refetch();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="w-full space-y-8 pt-5">
      <div>
        <div className="flex items-center gap-2 rounded-xl p-2 bg-bg-weak-50/60 mb-5 text-text-sub-600 text-sm">
          <Icon name="info-outline" className="w-4 h-4" />
          Changes to your profile will apply to all of your workspaces.
        </div>
        <div className="mb-4">
          <p className="font-medium text-label-md text-text-strong-950">
            Profile
          </p>
          <p className="text-paragraph-sm text-text-sub-600">
            Manage your personal details
          </p>
        </div>

        <div className="w-full space-y-3">
          {/* Profile Picture */}
          <div>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <FileUpload.Root
                className={cn(
                  "flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full",
                  imageUrl || imagePreview
                    ? "border border-stroke-sub-300 border-solid p-0"
                    : "border border-stroke-sub-300 p-1 bg-primary",
                  isUploading && "cursor-wait opacity-50",
                  !isUploading && "cursor-pointer",
                )}
                data-has-image={!!(imageUrl || imagePreview)}
                onClick={isUploading ? undefined : handleFileUploadClick}
              >
                {isUploading ? (
                  <Spinner size={20} color="var(--text-strong-950)" />
                ) : imageUrl || imagePreview ? (
                  <img
                    src={imageUrl || imagePreview}
                    alt="Profile picture preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-medium text-xl text-white">
                    {getInitials()}
                  </span>
                )}
              </FileUpload.Root>
              <div>
                <Label.Root htmlFor="profileImage">Profile Picture</Label.Root>
                <p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
                  We only support PNGs, JPEGs and GIFs under 10MB
                </p>
                <Button.Root
                  variant="neutral"
                  mode="filled"
                  size="xxsmall"
                  type="button"
                  onClick={handleFileUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner size={14} color="var(--bg-white-0)" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Icon name="camera" className="h-4 w-4" />
                      Upload image
                    </>
                  )}
                </Button.Root>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3">
            <div>
              <Label.Root htmlFor="firstName">First Name</Label.Root>
              <Input.Root className="mt-1 w-full" size="small">
                <Input.Wrapper className="w-full">
                  <Input.Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={() => setIsFirstNameFocused(true)}
                    onBlur={() => setIsFirstNameFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveChanges();
                      }
                    }}
                  />

                  {isFirstNameFocused && (
                    <div className="border border-stroke-sub-300 px-1 py-[1px] rounded-md text-[10px] bg-bg-white-0 text-text-sub-600 ring-inset ring-stroke-soft-200 flex items-center gap-1">
                      <span>⏎</span>
                      <span>Enter</span>
                    </div>
                  )}

                </Input.Wrapper>
              </Input.Root>
            </div>
            <div>
              <Label.Root htmlFor="lastName">Last Name</Label.Root>
              <Input.Root className="mt-1 w-full" size="small">
                <Input.Wrapper className="w-full">
                  <Input.Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onFocus={() => setIsLastNameFocused(true)}
                    onBlur={() => setIsLastNameFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveChanges();
                      }
                    }}
                  />
                  {isLastNameFocused && (
                    <div className="border border-stroke-sub-300 px-1 py-[1px] rounded-md text-[10px] bg-bg-white-0 text-text-sub-600 ring-inset ring-stroke-soft-200 flex items-center gap-1">
                      <span>⏎</span>
                      <span>Enter</span>
                    </div>
                  )}
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>

          <div>
            <Label.Root htmlFor="email" className="flex items-center gap-1">Email Address
              <span className="text-text-sub-600 text-xs">
                {' '}(Read only)
              </span>
            </Label.Root>
            <Input.Root className="mt-1 w-full" size="small">
              <Input.Wrapper className="w-full">
                <Input.Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
