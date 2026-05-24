"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { toast } from "sonner";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { dmSans } from "@/app/fonts";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentBio: string;
  currentUsername?: string;
  currentWebsite?: string;
  currentButtonColor?: string;
  currentAvatarUrl?: string;
  currentAvatarStorageId?: string;
  requireUsername?: boolean;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentBio,
  currentUsername,
  currentWebsite,
  currentButtonColor,
  currentAvatarUrl,
  requireUsername = false,
}: EditProfileModalProps) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [buttonColor, setButtonColor] = useState("#FF1A00");
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, isLoaded: isUserLoaded } = useUser();

  useQuery(
    api.users.getByClerkId,
    isUserLoaded && user ? { clerkId: user.id } : "skip",
  );

  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfile = useMutation(api.users.updateProfile);

  useEffect(() => {
    if (isOpen) {
      setName(currentName || "");
      setBio(currentBio || "");
      setUsername(currentUsername || user?.username || "");
      setWebsite(currentWebsite || "");
      setButtonColor(currentButtonColor || "#FF1A00");
      setCustomImage(null);
      setPreviewImageUrl(null);
    }
  }, [
    isOpen,
    currentName,
    currentBio,
    currentUsername,
    currentWebsite,
    currentButtonColor,
    user?.username,
  ]);

  useEffect(() => {
    if (customImage) {
      const url = URL.createObjectURL(customImage);
      setPreviewImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreviewImageUrl(null);
  }, [customImage]);

  const displayAvatarUrl = previewImageUrl || currentAvatarUrl || user?.imageUrl || "";

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (requireUsername) {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        toast.error("Username is required");
        return;
      }
      if (trimmedUsername.length < 3) {
        toast.error("Username must be at least 3 characters");
        return;
      }
    }

    try {
      setIsUploading(true);

      let storageId: Id<"_storage"> | undefined;

      if (customImage) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: customImage,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const result = await response.json();
        storageId = result.storageId;
      }

      await updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        username: username.trim(),
        website: website.trim() || undefined,
        buttonColor: buttonColor.trim() || undefined,
        storageId,
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (err.message === "Username already taken") {
        toast.error("Username is already taken");
      } else if (err.message?.includes("Invalid color format")) {
        toast.error("Invalid color format. Use hex format (e.g., #FF1A00)");
      } else {
        toast.error(err.message || "Failed to save profile");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setCustomImage(file);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
      onClick={requireUsername ? undefined : onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-[#1C1C1C] border border-gray-700/50 rounded-lg w-[500px] max-h-[90vh] overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div>
            <h2 className={`${dmSans.className} text-white text-lg font-semibold`}>
              {requireUsername ? "Setup your profile" : "Edit profile"}
            </h2>
            <p className={`${dmSans.className} text-gray-400 text-sm`}>
              {requireUsername
                ? "Set a username so others can find you on Saga."
                : "Update your profile information."}
            </p>
          </div>
          {!requireUsername && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-2">
            <label className={`${dmSans.className} text-white text-sm font-medium`}>
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div
                className="relative w-24 h-24 rounded-full overflow-hidden bg-[#2A2A2A] border-2 border-gray-700/50 shrink-0 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {displayAvatarUrl ? (
                  <Image
                    src={displayAvatarUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                    {(name || user?.firstName || user?.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                  <span className={`${dmSans.className} text-white text-xs`}>Change</span>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`${dmSans.className} px-4 py-2 bg-[#181818] border border-gray-700/50 hover:border-gray-600 hover:bg-[#2A2A2A] rounded-md transition-all text-white text-sm font-medium cursor-pointer`}
              >
                {customImage ? "Change Photo" : "Upload Photo"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              className={`${dmSans.className} text-white text-sm font-medium flex justify-between`}
            >
              Name
              <span className="text-gray-400 text-sm">{name.length} / 50</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              placeholder="Enter your name"
              className={`${dmSans.className} w-full px-3 py-2 bg-[#181818] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-600`}
            />
          </div>

          <div className="space-y-2">
            <label
              className={`${dmSans.className} text-white text-sm font-medium flex justify-between items-center`}
            >
              <span>
                Username<span className="text-[#FF1A00] ml-0.5">*</span>
              </span>
              <span className="text-gray-400 text-sm">{username.length} / 30</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.slice(0, 30).toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
              placeholder="Enter your username"
              className={`${dmSans.className} w-full px-3 py-2 bg-[#181818] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-600`}
            />
          </div>

          <div className="space-y-2">
            <label
              className={`${dmSans.className} text-white text-sm font-medium flex justify-between items-center`}
            >
              <span>Bio</span>
              <span className="text-gray-400 text-sm">{bio.length} / 160</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              placeholder="Tell us about yourself"
              rows={4}
              className={`${dmSans.className} w-full px-3 py-2 bg-[#181818] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 resize-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`${dmSans.className} text-white text-sm font-medium`}>
              Website
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="example.com or https://example.com"
              className={`${dmSans.className} w-full px-3 py-2 bg-[#181818] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-gray-600`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700/50">
          {!requireUsername && (
            <button
              onClick={onClose}
              className={`${dmSans.className} px-4 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer`}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={
              !name.trim() ||
              isUploading ||
              (requireUsername && (!username.trim() || username.trim().length < 3))
            }
            className={`${dmSans.className} px-4 py-2 bg-[#FF1A00] text-white rounded-md hover:bg-[#FF1A00]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
          >
            {isUploading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
