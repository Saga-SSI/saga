"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { dmSans, sortsMillGoudy } from "@/app/fonts";
import EditProfileModal from "@/components/EditProfileModal";

export default function ProfilePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const currentUser = useQuery(
    api.users.getByClerkId,
    isUserLoaded && user ? { clerkId: user.id } : "skip",
  );

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfilePicture = useMutation(api.users.updateProfilePicture);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateProfilePicture({ storageId });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const displayName =
    currentUser?.name || user?.firstName || user?.username || "User";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="min-h-full bg-[#1C1C1C] p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <h1
          className={`${sortsMillGoudy.className} mb-8 text-4xl tracking-[-0.05em] text-white`}
        >
          Profile
        </h1>

        <div className="rounded-lg border border-gray-700/50 bg-[#1C1C1C] p-6 space-y-6">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden"
            />

            <div
              className="relative w-20 h-20 rounded-full overflow-hidden bg-[#2A2A2A] border-2 border-gray-700/50 shrink-0 cursor-pointer group"
              onMouseEnter={() => setIsHoveringProfile(true)}
              onMouseLeave={() => setIsHoveringProfile(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              {currentUser?.avatarUrl || user?.imageUrl ? (
                <Image
                  src={currentUser?.avatarUrl || user?.imageUrl || ""}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}

              <div
                className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                  isHoveringProfile || isUploading ? "opacity-100" : "opacity-0"
                }`}
              >
                {isUploading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <span className={`${dmSans.className} text-white text-xs`}>Edit</span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2
                className={`${sortsMillGoudy.className} text-white text-3xl tracking-[-0.05em] truncate`}
              >
                {firstName}
              </h2>
              {currentUser?.username || user?.username ? (
                <p className={`${dmSans.className} text-gray-400 text-sm mt-1`}>
                  @{currentUser?.username || user?.username}
                </p>
              ) : (
                <p className={`${dmSans.className} text-gray-500 text-sm mt-1 italic`}>
                  You haven&apos;t setup your username, click edit to get yours.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className={`${dmSans.className} text-gray-400 text-base leading-relaxed`}>
              {currentUser?.bio || "No bio yet. Click edit to add one!"}
            </p>

            {currentUser?.website && (
              <a
                href={currentUser.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-3 rounded-md transition-all text-white text-sm font-medium hover:opacity-90"
                style={{
                  backgroundColor: currentUser.buttonColor || "#FF1A00",
                }}
              >
                Visit Website
              </a>
            )}

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-3 bg-[#181818] border border-gray-700/50 hover:border-gray-600 hover:bg-[#2A2A2A] rounded-md transition-all text-white text-sm font-medium cursor-pointer"
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={currentUser?.name || user?.firstName || user?.username || ""}
        currentBio={currentUser?.bio || ""}
        currentUsername={currentUser?.username}
        currentWebsite={currentUser?.website}
        currentButtonColor={currentUser?.buttonColor}
        currentAvatarUrl={currentUser?.avatarUrl || user?.imageUrl}
        currentAvatarStorageId={currentUser?.avatarStorageId || undefined}
      />
    </div>
  );
}
