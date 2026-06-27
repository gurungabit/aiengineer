import { Session } from "@/lib/conference-data";

export const SCHEDULE_SHARE_PARAM = "s";

export function encodeScheduleIds(savedIds: Set<string>, sessions: Session[]) {
  const sessionIndexes = new Map(sessions.map((session, index) => [session.id, index]));

  return [...savedIds]
    .map((id) => sessionIndexes.get(id))
    .filter((index): index is number => typeof index === "number")
    .sort((a, b) => a - b)
    .map((index) => index.toString(36))
    .join(".");
}

export function decodeScheduleIds(encoded: string, sessions: Session[]) {
  const ids = new Set<string>();

  encoded
    .split(".")
    .map((part) => Number.parseInt(part, 36))
    .filter((index) => Number.isInteger(index) && index >= 0 && index < sessions.length)
    .forEach((index) => {
      const session = sessions[index];
      if (session) ids.add(session.id);
    });

  return [...ids];
}

export function getSharedScheduleParam(location: Pick<Location, "search" | "hash">) {
  const fromSearch = new URLSearchParams(location.search).get(SCHEDULE_SHARE_PARAM);
  if (fromSearch) return fromSearch;

  const hash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
  return new URLSearchParams(hash).get(SCHEDULE_SHARE_PARAM);
}

export function buildScheduleShareUrl(savedIds: Set<string>, sessions: Session[], href: string) {
  const encoded = encodeScheduleIds(savedIds, sessions);
  if (!encoded) return "";

  const url = new URL(href);
  url.searchParams.set(SCHEDULE_SHARE_PARAM, encoded);
  url.hash = "";
  return url.toString();
}
