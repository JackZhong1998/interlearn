import type { CreationDraft } from "@/lib/types";

const KEY = "interlearn.creations";

export function loadCreations(): CreationDraft[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCreation(draft: CreationDraft) {
  const all = loadCreations().filter((c) => c.id !== draft.id);
  all.unshift(draft);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 40)));
}

export function newDraftId() {
  return `c_${Date.now().toString(36)}`;
}
