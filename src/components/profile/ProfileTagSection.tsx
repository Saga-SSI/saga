"use client";

import { useState } from "react";
import { HiX } from "react-icons/hi";
import { dmSans } from "@/app/fonts";

interface ProfileTagSectionProps {
  tags: string[];
  placeholder: string;
  editable: boolean;
  onChange?: (tags: string[]) => void;
}

const MAX_TAGS = 24;
const TAG_SEPARATOR = /[\n\r,;]+/;

function splitTagInput(raw: string) {
  return raw
    .split(TAG_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasMultipleTags(raw: string) {
  return TAG_SEPARATOR.test(raw);
}

export default function ProfileTagSection({
  tags,
  placeholder,
  editable,
  onChange,
}: ProfileTagSectionProps) {
  const [input, setInput] = useState("");

  const addTags = (raw: string) => {
    const parts = splitTagInput(raw);
    if (parts.length === 0) {
      setInput("");
      return;
    }

    const nextTags = [...tags];
    for (const part of parts) {
      if (nextTags.length >= MAX_TAGS) break;
      if (!nextTags.includes(part)) {
        nextTags.push(part);
      }
    }

    onChange?.(nextTags);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange?.(tags.filter((item) => item !== tag));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text/plain");
    if (!hasMultipleTags(pasted)) return;

    e.preventDefault();
    addTags(pasted);
  };

  if (!editable && tags.length === 0) {
    return (
      <p className={`${dmSans.className} text-sm text-white/30`}>Nothing added yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`${dmSans.className} inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#141414] px-3 py-1 text-xs text-white/80`}
            >
              {tag}
              {editable && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="cursor-pointer text-white/40 transition-colors hover:text-white"
                  aria-label={`Remove ${tag}`}
                >
                  <HiX className="size-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {editable && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTags(input);
            }
          }}
          onBlur={() => {
            if (input.trim()) addTags(input);
          }}
          placeholder={placeholder}
          className={`${dmSans.className} w-full rounded-lg border border-dashed border-white/10 bg-[#141414] px-3 py-2 text-sm text-white/70 outline-none placeholder:text-white/25 focus:border-white/20`}
        />
      )}
    </div>
  );
}
