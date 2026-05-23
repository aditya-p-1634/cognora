/** Emotional tone markers — reflective, not productivity labels. */
export type EmotionalTone =
  | "contemplative"
  | "curious"
  | "uncertain"
  | "energized"
  | "calm";

export interface CaptureDraft {
  thought: string;
  continuationMarker: string;
  semanticTags: string[];
  emotionalTone: EmotionalTone | null;
  markUnresolved: boolean;
}

export interface CapturedThoughtMeta {
  /** Full preserved thought — source of truth for resurfacing and search. */
  thought: string;
  semanticTags: string[];
  emotionalTone: EmotionalTone | null;
  continuationMarker?: string;
  markUnresolved: boolean;
  capturedAt: string;
}

export const EMPTY_CAPTURE_DRAFT: CaptureDraft = {
  thought: "",
  continuationMarker: "",
  semanticTags: [],
  emotionalTone: null,
  markUnresolved: false,
};

export const EMOTIONAL_TONE_OPTIONS: {
  id: EmotionalTone;
  label: string;
}[] = [
  { id: "contemplative", label: "Contemplative" },
  { id: "curious", label: "Curious" },
  { id: "uncertain", label: "Uncertain" },
  { id: "energized", label: "Energized" },
  { id: "calm", label: "Calm" },
];
