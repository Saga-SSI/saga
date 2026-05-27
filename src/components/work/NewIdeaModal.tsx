"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { dmSans, sortsMillGoudy } from "@/app/fonts";

interface NewIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewIdeaModal({ isOpen, onClose }: NewIdeaModalProps) {
  const createIdea = useMutation(api.workIdeas.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setTitle("");
    setDescription("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createIdea({ title, description });
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#1C1C1C] p-6 shadow-2xl">
        <h2
          className={`${sortsMillGoudy.className} text-2xl tracking-[-0.04em] text-white`}
        >
          New idea
        </h2>
        <p className={`${dmSans.className} mt-1 text-sm text-white/45`}>
          Share something worth building together.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="idea-title"
              className={`${dmSans.className} mb-1.5 block text-xs font-medium text-white/60`}
            >
              Title
            </label>
            <input
              id="idea-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="What should we build?"
              className={`${dmSans.className} w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#FF1A00]/50`}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="idea-description"
              className={`${dmSans.className} mb-1.5 block text-xs font-medium text-white/60`}
            >
              Description
            </label>
            <textarea
              id="idea-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Describe the idea, why it matters, and what success looks like."
              className={`${dmSans.className} w-full resize-none rounded-lg border border-white/10 bg-[#141414] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#FF1A00]/50`}
            />
          </div>

          {error && (
            <p className={`${dmSans.className} text-sm text-red-400`}>{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={`${dmSans.className} cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className={`${dmSans.className} cursor-pointer rounded-lg bg-[#FF1A00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#E61700] disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isSubmitting ? "Posting…" : "Post idea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
