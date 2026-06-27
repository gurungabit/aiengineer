"use client";

import { useMemo, useState } from "react";
import { Session, Speaker, DAY_LABELS, TYPE_COLORS, trackColor, formatTime } from "@/lib/conference-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Clock, MapPin, Users, CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  sessions: Session[]; // already filtered + sorted
  onOpen: (s: Session) => void;
  onSpeakerClick: (name: string) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
}

/**
 * Chronological list view: every session rendered as a single row sorted by
 * (day, start time). Time sits in a sticky left gutter so users can scan down
 * to find talks happening at the same slot across days.
 */
export function TimelineView({
  sessions,
  onOpen,
  onSpeakerClick,
  isSaved,
  onToggleSave,
}: TimelineViewProps) {
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  const toggleDay = (day: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  // Group by day for section headers (sessions are already sorted chronologically
  // by SessionsView, but we re-sort here to be defensive).
  const grouped = useMemo(() => {
    const sorted = [...sessions].sort(
      (a, b) =>
        (a.dayIndex ?? 99) - (b.dayIndex ?? 99) ||
        (a.startTime ?? 0) - (b.startTime ?? 0) ||
        (a.endTime ?? 0) - (b.endTime ?? 0) ||
        a.title.localeCompare(b.title)
    );
    const m = new Map<string, Session[]>();
    sorted.forEach((s) => {
      const k = s.day || "Unscheduled";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    });
    const out: { key: string; items: Session[] }[] = [];
    DAY_LABELS.forEach((d) => {
      if (m.has(d)) out.push({ key: d, items: m.get(d)! });
    });
    m.forEach((items, k) => {
      if (!DAY_LABELS.includes(k)) out.push({ key: k, items });
    });
    return out;
  }, [sessions]);

  if (grouped.length === 0 || grouped.every((g) => g.items.length === 0)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {grouped.map((group) => {
        const isCollapsed = collapsedDays.has(group.key);

        return (
          <section key={group.key}>
            {/* Day header */}
            <div className="sticky top-0 z-10 -mx-2 mb-2 bg-background/95 px-2 py-2 backdrop-blur-sm">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-accent/60"
                onClick={() => toggleDay(group.key)}
                aria-expanded={!isCollapsed}
                aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${group.key}`}
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                  <CalendarDays className="size-4 shrink-0 text-emerald-600" />
                  <span className="truncate">{group.key}</span>
                </span>
                <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
                  {group.items.length} session{group.items.length !== 1 ? "s" : ""}
                </span>
              </button>
            </div>

            {/* Rows */}
            {!isCollapsed && (
              <div className="flex flex-col">
                {group.items.map((s, idx) => {
              const typeInfo = TYPE_COLORS[s.type] ?? TYPE_COLORS.session;
              const startStr = s.startTime != null ? formatTime(s.startTime) : s.time.split("-")[0]?.trim() ?? "";
              const endStr = s.endTime != null ? formatTime(s.endTime) : s.time.split("-")[1]?.trim() ?? "";
              const saved = isSaved(s.id);

              return (
                <div
                  key={s.id}
                  onClick={() => onOpen(s)}
                  className={cn(
                    "group relative grid grid-cols-[auto_1fr_auto] gap-3 px-2 py-2.5 cursor-pointer transition-colors",
                    "border-b border-border/60 last:border-b-0",
                    "hover:bg-accent/50",
                    idx === 0 && "border-t"
                  )}
                >
                  {/* Left: time gutter */}
                  <div className="flex flex-col items-end justify-start gap-0.5 w-20 sm:w-24 shrink-0 pt-0.5">
                    <span className="text-xs font-semibold tabular-nums leading-none">
                      {startStr}
                    </span>
                    {endStr && (
                      <span className="text-[10px] text-muted-foreground tabular-nums leading-none">
                        {endStr}
                      </span>
                    )}
                    {s.durationMinutes ? (
                      <span className="text-[10px] text-muted-foreground/70 tabular-nums leading-none mt-0.5">
                        {s.durationMinutes}m
                      </span>
                    ) : null}
                  </div>

                  {/* Center: content */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0 h-4 font-medium", typeInfo.bg, typeInfo.text, typeInfo.border)}
                      >
                        {typeInfo.label}
                      </Badge>
                      {s.track && (
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", trackColor(s.track))}>
                          {s.track}
                        </Badge>
                      )}
                      {s.status === "tentative" && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground border-dashed">
                          tentative
                        </Badge>
                      )}
                      {s.room && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="size-2.5" />
                          {s.room}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {s.title}
                    </h3>
                    {s.speakers.length > 0 && (
                      <div className="flex items-start gap-1 text-xs text-muted-foreground">
                        <Users className="size-3 shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-x-1">
                          {s.speakers.map((sp, i) => (
                            <span key={sp + i}>
                              <button
                                type="button"
                                className="cursor-pointer text-left hover:text-emerald-700 hover:underline dark:hover:text-emerald-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSpeakerClick(sp);
                                }}
                              >
                                {sp}
                              </button>
                              {i < s.speakers.length - 1 && <span className="text-muted-foreground/60">,</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: save button */}
                  <Button
                    variant={saved ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 shrink-0 self-start gap-1.5 px-2.5 text-xs transition-colors",
                      saved
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(s.id);
                    }}
                    aria-label={saved ? "Remove from schedule" : "Add to schedule"}
                    title={saved ? "Saved - click to remove" : "Add to My Schedule"}
                  >
                    {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                    {saved ? "Saved" : "Add"}
                  </Button>

                  {/* Type color stripe — left edge */}
                  <span
                    className={cn(
                      "absolute left-0 top-2 bottom-2 w-0.5 rounded-full",
                      typeInfo.dot
                    )}
                    aria-hidden
                  />
                </div>
              );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
