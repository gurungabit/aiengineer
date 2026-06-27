"use client";

import { Session, SessionType, SessionStatus, DAY_LABELS } from "@/lib/conference-data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMemo, useState } from "react";

export interface SessionFilters {
  query: string;
  days: string[];
  types: SessionType[];
  tracks: string[];
  rooms: string[];
  statuses: SessionStatus[];
  savedOnly: boolean;
}

export const DEFAULT_FILTERS: SessionFilters = {
  query: "",
  days: [],
  types: [],
  tracks: [],
  rooms: [],
  statuses: [],
  savedOnly: false,
};

interface FilterBarProps {
  filters: SessionFilters;
  onChange: (f: SessionFilters) => void;
  sessions: Session[];
  resultCount: number;
  totalCount: number;
}

export function FilterBar({ filters, onChange, sessions, resultCount, totalCount }: FilterBarProps) {
  const allTracks = useMemo(() => {
    const s = new Set<string>();
    sessions.forEach((x) => x.track && s.add(x.track));
    return [...s].sort();
  }, [sessions]);
  const allRooms = useMemo(() => {
    const s = new Set<string>();
    sessions.forEach((x) => x.room && s.add(x.room));
    return [...s].sort();
  }, [sessions]);

  const activeFilterCount =
    filters.days.length +
    filters.types.length +
    filters.tracks.length +
    filters.rooms.length +
    filters.statuses.length +
    (filters.savedOnly ? 1 : 0);

  const toggleArray = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="flex flex-col gap-3">
      {/* Search row */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search sessions, speakers, descriptions..."
            className="pl-9 h-10"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, query: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filter popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 shrink-0">
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="flex flex-col max-h-[70vh] overflow-y-auto">
              <FilterSection title="Day" collapsible>
                {DAY_LABELS.map((d) => (
                  <FilterChip
                    key={d}
                    label={d.replace(" — ", " · ")}
                    active={filters.days.includes(d)}
                    onClick={() => onChange({ ...filters, days: toggleArray(filters.days, d) })}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Type">
                {(["keynote", "session", "sponsor", "workshop"] as SessionType[]).map((t) => (
                  <FilterChip
                    key={t}
                    label={t.charAt(0).toUpperCase() + t.slice(1)}
                    active={filters.types.includes(t)}
                    onClick={() => onChange({ ...filters, types: toggleArray(filters.types, t) })}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Status">
                {(["confirmed", "tentative"] as SessionStatus[]).map((s) => (
                  <FilterChip
                    key={s}
                    label={s.charAt(0).toUpperCase() + s.slice(1)}
                    active={filters.statuses.includes(s)}
                    onClick={() => onChange({ ...filters, statuses: toggleArray(filters.statuses, s) })}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Track" collapsible defaultOpen={false}>
                {allTracks.map((t) => (
                  <FilterChip
                    key={t}
                    label={t}
                    active={filters.tracks.includes(t)}
                    onClick={() => onChange({ ...filters, tracks: toggleArray(filters.tracks, t) })}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Room" collapsible defaultOpen={false}>
                {allRooms.map((r) => (
                  <FilterChip
                    key={r}
                    label={r}
                    active={filters.rooms.includes(r)}
                    onClick={() => onChange({ ...filters, rooms: toggleArray(filters.rooms, r) })}
                  />
                ))}
              </FilterSection>
            </div>
            {activeFilterCount > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onChange({ ...filters, days: [], types: [], tracks: [], rooms: [], statuses: [], savedOnly: false })}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Button
          variant={filters.savedOnly ? "default" : "outline"}
          className={cn("h-10 gap-2 shrink-0", filters.savedOnly && "bg-emerald-600 hover:bg-emerald-700 text-white")}
          onClick={() => onChange({ ...filters, savedOnly: !filters.savedOnly })}
          title="Show only saved sessions"
        >
          <Bookmark className="size-4" />
          <span className="hidden sm:inline">Saved</span>
        </Button>
      </div>

      {/* Active filter chips + result count */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{resultCount}</span>
          {" / "}
          <span className="tabular-nums">{totalCount}</span> sessions
        </span>
        {activeFilterCount > 0 && <span className="text-muted-foreground">·</span>}
        {filters.days.map((d) => (
          <ActiveChip key={"d" + d} label={d.replace(" — ", " · ")} onRemove={() => onChange({ ...filters, days: filters.days.filter((x) => x !== d) })} />
        ))}
        {filters.types.map((t) => (
          <ActiveChip key={"t" + t} label={t} onRemove={() => onChange({ ...filters, types: filters.types.filter((x) => x !== t) })} />
        ))}
        {filters.tracks.map((t) => (
          <ActiveChip key={"tr" + t} label={t} onRemove={() => onChange({ ...filters, tracks: filters.tracks.filter((x) => x !== t) })} />
        ))}
        {filters.rooms.map((r) => (
          <ActiveChip key={"r" + r} label={r} onRemove={() => onChange({ ...filters, rooms: filters.rooms.filter((x) => x !== r) })} />
        ))}
        {filters.statuses.map((s) => (
          <ActiveChip key={"s" + s} label={s} onRemove={() => onChange({ ...filters, statuses: filters.statuses.filter((x) => x !== s) })} />
        ))}
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-accent"
        onClick={() => collapsible && setOpen(!open)}
      >
        {title}
        {collapsible && <span className="text-foreground/40">{open ? "−" : "+"}</span>}
      </button>
      {open && <div className="px-3 pb-3 flex flex-wrap gap-1.5">{children}</div>}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors",
        active
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-background text-foreground border-border hover:border-emerald-500/50 hover:bg-accent"
      )}
    >
      {label}
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded-full p-0.5 hover:bg-emerald-500/20"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
