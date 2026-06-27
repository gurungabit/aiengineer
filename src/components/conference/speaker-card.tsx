"use client";

import { Speaker } from "@/lib/conference-data";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface SpeakerCardProps {
  speaker: Speaker;
  onOpen: (s: Speaker) => void;
}

export function SpeakerCard({ speaker, onOpen }: SpeakerCardProps) {
  const initials = speaker.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card
      onClick={() => onOpen(speaker)}
      className="group flex flex-col items-center text-center p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all gap-2"
    >
      <Avatar className="size-16 ring-2 ring-transparent group-hover:ring-emerald-500/40 transition-all">
        {speaker.photoUrl ? <AvatarImage src={speaker.photoUrl} alt={speaker.name} /> : null}
        <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
          {initials || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 w-full">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {speaker.name}
        </h3>
        {(speaker.role || speaker.company) && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {speaker.role}{speaker.role && speaker.company ? ", " : ""}{speaker.company}
          </p>
        )}
      </div>
      {speaker.sessions?.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3" />
          {speaker.sessions.length} session{speaker.sessions.length > 1 ? "s" : ""}
        </div>
      )}
    </Card>
  );
}
