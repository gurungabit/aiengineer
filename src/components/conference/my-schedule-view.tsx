"use client";

import { useMemo, useState } from "react";
import { Session, Speaker, DAY_LABELS, TYPE_COLORS, trackColor, formatTime } from "@/lib/conference-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, CalendarX2, Clock, MapPin, Calendar, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MyScheduleViewProps {
  sessions: Session[];
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onClearAll: () => void;
  onOpenSession: (s: Session) => void;
  onBrowse: () => void;
}

export function MyScheduleView({
  sessions,
  savedIds,
  onToggleSave,
  onClearAll,
  onOpenSession,
  onBrowse,
}: MyScheduleViewProps) {
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

  const saved = useMemo(() => {
    return sessions
      .filter((s) => savedIds.has(s.id))
      .sort(
        (a, b) =>
          (a.dayIndex ?? 99) - (b.dayIndex ?? 99) ||
          (a.startTime ?? 0) - (b.startTime ?? 0)
      );
  }, [sessions, savedIds]);

  const grouped = useMemo(() => {
    const m = new Map<string, Session[]>();
    saved.forEach((s) => {
      const k = s.day || "Unscheduled";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    });
    const ordered: { key: string; items: Session[] }[] = [];
    DAY_LABELS.forEach((d) => {
      if (m.has(d)) ordered.push({ key: d, items: m.get(d)! });
    });
    return ordered;
  }, [saved]);

  // Compute total minutes saved
  const totalMinutes = saved.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center">
          <CalendarX2 className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Your schedule is empty</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Use Add to Schedule on any session to save it here. Build your own personal
            track across all four days of the World's Fair.
          </p>
        </div>
        <Button onClick={onBrowse} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Bookmark className="size-4" />
          Browse sessions
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Bookmark className="size-4 text-emerald-600" />
            <span className="font-semibold tabular-nums">{saved.length}</span>
            <span className="text-muted-foreground">session{saved.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-muted-foreground" />
            <span className="font-semibold tabular-nums">{hours}h {mins}m</span>
            <span className="text-muted-foreground">scheduled</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={onClearAll}
        >
          <Trash2 className="size-3.5" />
          Clear all
        </Button>
      </div>

      {/* Sessions grouped by day */}
      <div className="flex flex-col gap-6">
        {grouped.map((group) => {
          const isCollapsed = collapsedDays.has(group.key);

          return (
            <section key={group.key}>
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
                    <Calendar className="size-4 shrink-0 text-emerald-600" />
                    <span className="truncate">{group.key}</span>
                  </span>
                  <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
                    {group.items.length} session{group.items.length !== 1 ? "s" : ""}
                  </span>
                </button>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col gap-2">
                  {group.items.map((s) => {
                const typeInfo = TYPE_COLORS[s.type] ?? TYPE_COLORS.session;
                const startStr = s.startTime != null ? formatTime(s.startTime) : "";
                const endStr = s.endTime != null ? formatTime(s.endTime) : "";
                return (
                  <Card
                    key={s.id}
                    className={cn(
                      "flex items-start gap-3 p-3 cursor-pointer hover:shadow-sm transition-all border-l-4",
                      typeInfo.border
                    )}
                    onClick={() => onOpenSession(s)}
                  >
                    <div className="flex flex-col items-center gap-1 min-w-16 shrink-0 text-center bg-muted/50 rounded-md py-1.5 px-2">
                      <span className="text-xs font-semibold tabular-nums leading-none">{startStr}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums leading-none">{endStr}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <Badge variant="outline" className={cn("text-xs", typeInfo.bg, typeInfo.text, typeInfo.border)}>
                          {typeInfo.label}
                        </Badge>
                        {s.track && (
                          <Badge variant="outline" className={cn("text-xs", trackColor(s.track))}>
                            {s.track}
                          </Badge>
                        )}
                        {s.room && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="size-3" />
                            {s.room}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium leading-snug">{s.title}</h3>
                      {s.speakers.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {s.speakers.join(", ")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 px-2.5 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(s.id);
                      }}
                      aria-label="Remove from schedule"
                      title="Remove from schedule"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </Card>
                );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
