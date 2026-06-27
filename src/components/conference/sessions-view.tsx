"use client";

import { useMemo, useState } from "react";
import { Session, Speaker, DAY_LABELS } from "@/lib/conference-data";
import { SessionCard } from "./session-card";
import { TimelineView } from "./timeline-view";
import { FilterBar, SessionFilters, DEFAULT_FILTERS } from "./filter-bar";
import { CalendarDays, ChevronDown, LayoutGrid, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SessionsViewProps {
  sessions: Session[];
  speakerMap: Map<string, Speaker>;
  onOpenSession: (s: Session) => void;
  onSpeakerClick: (name: string) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
}

type GroupMode = "day" | "none" | "timeline";

export function SessionsView({
  sessions,
  speakerMap,
  onOpenSession,
  onSpeakerClick,
  isSaved,
  onToggleSave,
}: SessionsViewProps) {
  const [filters, setFilters] = useState<SessionFilters>(DEFAULT_FILTERS);
  const [groupMode, setGroupMode] = useState<GroupMode>("day");
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

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (filters.savedOnly && !isSaved(s.id)) return false;
      if (filters.days.length && !filters.days.includes(s.day)) return false;
      if (filters.types.length && !filters.types.includes(s.type)) return false;
      if (filters.tracks.length && !filters.tracks.includes(s.track)) return false;
      if (filters.rooms.length && !filters.rooms.includes(s.room)) return false;
      if (filters.statuses.length && !filters.statuses.includes(s.status)) return false;
      if (q) {
        const hay = [
          s.title,
          s.description,
          s.track,
          s.room,
          s.speakers.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sessions, filters, isSaved]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) =>
        (a.dayIndex ?? 99) - (b.dayIndex ?? 99) ||
        (a.startTime ?? 0) - (b.startTime ?? 0) ||
        a.title.localeCompare(b.title)
    );
  }, [filtered]);

  // Group by day if requested
  const grouped = useMemo(() => {
    if (groupMode !== "day") return [{ key: "All sessions", items: sorted }];
    const m = new Map<string, Session[]>();
    sorted.forEach((s) => {
      const k = s.day || "Unscheduled";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    });
    // Order days by DAY_LABELS
    const ordered: { key: string; items: Session[] }[] = [];
    DAY_LABELS.forEach((d) => {
      if (m.has(d)) ordered.push({ key: d, items: m.get(d)! });
    });
    // any leftover
    m.forEach((items, k) => {
      if (!DAY_LABELS.includes(k)) ordered.push({ key: k, items });
    });
    return ordered;
  }, [sorted, groupMode]);

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        sessions={sessions}
        resultCount={filtered.length}
        totalCount={sessions.length}
      />

      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-md border bg-muted/30 p-0.5 text-xs">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2.5 gap-1.5",
              groupMode === "day" && "bg-background shadow-sm font-medium"
            )}
            onClick={() => setGroupMode("day")}
          >
            <CalendarDays className="size-3.5" />
            By Day
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2.5 gap-1.5",
              groupMode === "timeline" && "bg-background shadow-sm font-medium"
            )}
            onClick={() => setGroupMode("timeline")}
          >
            <Clock className="size-3.5" />
            Timeline
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2.5 gap-1.5",
              groupMode === "none" && "bg-background shadow-sm font-medium"
            )}
            onClick={() => setGroupMode("none")}
          >
            <LayoutGrid className="size-3.5" />
            Flat List
          </Button>
        </div>
      </div>

      {grouped.length === 0 || grouped.every((g) => g.items.length === 0) ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No sessions match your filters.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            Clear filters
          </Button>
        </div>
      ) : groupMode === "timeline" ? (
        <TimelineView
          sessions={sorted}
          onOpen={onOpenSession}
          onSpeakerClick={onSpeakerClick}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((group) => {
            const isCollapsed = groupMode === "day" && collapsedDays.has(group.key);

            return (
              <section key={group.key}>
                {groupMode === "day" && (
                  <div className="sticky top-0 z-10 -mx-2 mb-3 bg-background/95 px-2 py-2 backdrop-blur-sm">
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
                )}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.items.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        onOpen={onOpenSession}
                        onSpeakerClick={onSpeakerClick}
                        isSaved={isSaved(s.id)}
                        onToggleSave={onToggleSave}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
