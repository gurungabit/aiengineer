"use client";

import { useMemo, useState } from "react";
import { Speaker } from "@/lib/conference-data";
import { SpeakerCard } from "./speaker-card";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SpeakersViewProps {
  speakers: Speaker[];
  onOpen: (s: Speaker) => void;
}

export function SpeakersView({ speakers, onOpen }: SpeakersViewProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return speakers;
    return speakers.filter((s) => {
      const hay = [s.name, s.role, s.company, s.bio].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [speakers, query]);

  // Sort: speakers with photos first, then alphabetically
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ap = a.photoUrl ? 0 : 1;
      const bp = b.photoUrl ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search speakers, companies, roles..."
          className="pl-9 h-10"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span>
        {" / "}
        <span className="tabular-nums">{speakers.length}</span> speakers
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No speakers match your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sorted.map((s) => (
            <SpeakerCard key={s.name} speaker={s} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
