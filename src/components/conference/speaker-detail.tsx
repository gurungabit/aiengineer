"use client";

import { Speaker, TYPE_COLORS, trackColor, formatTime, Session } from "@/lib/conference-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Linkedin, ExternalLink, Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeakerDetailProps {
  speaker: Speaker | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSessionClick: (s: Session) => void;
  allSessions: Session[];
}

export function SpeakerDetail({
  speaker,
  open,
  onOpenChange,
  onSessionClick,
  allSessions,
}: SpeakerDetailProps) {
  if (!speaker) return null;
  const initials = speaker.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Find all sessions for this speaker (from the global sessions list, since
  // speaker.sessions may be incomplete / differently shaped)
  const speakerSessions = allSessions.filter((s) => s.speakers.includes(speaker.name));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 shrink-0 ring-2 ring-emerald-500/30">
              {speaker.photoUrl ? <AvatarImage src={speaker.photoUrl} alt={speaker.name} /> : null}
              <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-xl">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold leading-tight">
                {speaker.name}
              </SheetTitle>
              {(speaker.role || speaker.company) && (
                <SheetDescription asChild>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                    {speaker.role && <span className="font-medium">{speaker.role}</span>}
                    {speaker.role && speaker.company && <span>·</span>}
                    {speaker.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        {speaker.company}
                      </span>
                    )}
                  </div>
                </SheetDescription>
              )}
              {speaker.linkedin && (
                <a
                  href={speaker.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline mt-2"
                >
                  <Linkedin className="size-3.5" />
                  LinkedIn
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="p-6 flex flex-col gap-6">
          {/* Bio */}
          {speaker.bio ? (
            <section>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Bio</h4>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {speaker.bio}
              </p>
            </section>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No bio available.
            </p>
          )}

          {/* Sessions */}
          {speakerSessions.length > 0 && (
            <section>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                Sessions ({speakerSessions.length})
              </h4>
              <div className="flex flex-col gap-2">
                {speakerSessions
                  .sort((a, b) => (a.dayIndex ?? 0) - (b.dayIndex ?? 0) || (a.startTime ?? 0) - (b.startTime ?? 0))
                  .map((s) => {
                    const typeInfo = TYPE_COLORS[s.type] ?? TYPE_COLORS.session;
                    const startStr = s.startTime != null ? formatTime(s.startTime) : "";
                    const endStr = s.endTime != null ? formatTime(s.endTime) : "";
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSessionClick(s)}
                        className={cn(
                          "flex flex-col gap-1.5 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left border-l-4",
                          typeInfo.border
                        )}
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className={cn("text-xs", typeInfo.bg, typeInfo.text, typeInfo.border)}>
                            {typeInfo.label}
                          </Badge>
                          {s.track && (
                            <Badge variant="outline" className={cn("text-xs", trackColor(s.track))}>
                              {s.track}
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium text-sm leading-snug">
                          {s.title}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {s.day}
                          </span>
                          <span className="flex items-center gap-1 tabular-nums">
                            <Clock className="size-3" />
                            {startStr}{endStr ? ` – ${endStr}` : ""}
                          </span>
                          {s.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {s.room}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
