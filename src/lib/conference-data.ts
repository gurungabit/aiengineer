export type SessionType = "keynote" | "session" | "sponsor" | "workshop";
export type SessionStatus = "confirmed" | "tentative";

export interface Session {
  id: string;
  title: string;
  description: string;
  day: string;
  time: string;
  room: string;
  type: SessionType;
  track: string;
  status: SessionStatus;
  speakers: string[];
  // Derived
  startTime?: number; // minutes from midnight
  endTime?: number;
  durationMinutes?: number;
  dayIndex?: number;
}

export interface Speaker {
  name: string;
  role: string;
  company: string;
  bio: string;
  linkedin: string;
  photoUrl: string | null;
  sessions: SessionForSpeaker[];
}

export interface SessionForSpeaker {
  title: string;
  description: string;
  day: string;
  time: string;
  room: string;
  type: SessionType;
  track: string;
  status: SessionStatus;
  speakers: string[];
}

export interface SessionsPayload {
  conference: string;
  dates: string;
  location: string;
  website: string;
  scheduleVersion: number;
  totalSessions: number;
  sessions: Session[];
}

export interface SpeakersPayload {
  conference: string;
  dates: string;
  location: string;
  website: string;
  scheduleVersion: number;
  totalSpeakers: number;
  speakers: Speaker[];
}

const SPEAKER_PHOTO_BASE = "https://ai.engineer";

/** Normalize a raw session payload into Session[] with derived fields. */
export function normalizeSessions(payload: SessionsPayload): Session[] {
  return payload.sessions.map((s, i) => {
    const { start, end, duration } = parseTimeRange(s.time);
    const dayIndex = dayToIndex(s.day);
    return {
      ...s,
      id: `s-${i}`,
      startTime: start,
      endTime: end,
      durationMinutes: duration,
      dayIndex,
    };
  });
}

/** Normalize speaker payload: prepend base URL to photoUrl, drop nulls. */
export function normalizeSpeakers(payload: SpeakersPayload): Speaker[] {
  return payload.speakers.map((s) => ({
    ...s,
    photoUrl: s.photoUrl ? SPEAKER_PHOTO_BASE + s.photoUrl : null,
  }));
}

export function dayToIndex(day: string): number {
  // "Day 1 — Workshop Day" → 1, "Day 2 — Session Day 1" → 2, etc.
  const m = day.match(/^Day\s+(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Parse a time range like "9:00am-11:00am" or "1:30pm-2:05pm" into minutes. */
export function parseTimeRange(
  range: string
): { start: number; end: number; duration: number } {
  const parts = range.split("-").map((p) => p.trim());
  if (parts.length !== 2) return { start: 0, end: 0, duration: 0 };
  const start = parseTime(parts[0]);
  const end = parseTime(parts[1]);
  // Handle overnight (shouldn't happen here, but be safe)
  const duration = end > start ? end - start : 0;
  return { start, end, duration };
}

function parseTime(t: string): number {
  // "9:00am" → 540, "1:30pm" → 810, "12:00pm" → 720, "12:00am" → 0
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toLowerCase();
  if (ap === "am") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return h * 60 + min;
}

/** Format minutes-from-midnight as "9:00 AM" for display. */
export function formatTime(min: number): string {
  if (!min && min !== 0) return "";
  let h = Math.floor(min / 60);
  const m = min % 60;
  const ap = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}

/** Color hint for a session type. */
export const TYPE_COLORS: Record<
  SessionType,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  keynote: {
    label: "Keynote",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  session: {
    label: "Session",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  sponsor: {
    label: "Sponsor",
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    border: "border-fuchsia-500/30",
    dot: "bg-fuchsia-500",
  },
  workshop: {
    label: "Workshop",
    bg: "bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/30",
    dot: "bg-cyan-500",
  },
};

/** Color hash for tracks — stable per track name. */
const TRACK_PALETTE = [
  "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  "bg-lime-500/10 text-lime-700 dark:text-lime-300 border-lime-500/20",
  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
  "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/20",
  "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
];

export function trackColor(track: string): string {
  if (!track) return TRACK_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < track.length; i++) {
    hash = (hash * 31 + track.charCodeAt(i)) >>> 0;
  }
  return TRACK_PALETTE[hash % TRACK_PALETTE.length];
}

export const DAY_LABELS = [
  "Day 1 — Workshop Day",
  "Day 2 — Session Day 1",
  "Day 3 — Session Day 2",
  "Day 4 — Session Day 3",
];

export const DAY_SHORT = ["Mon Jun 29", "Tue Jun 30", "Wed Jul 1", "Thu Jul 2"];
