"use client";

import { Session, TYPE_COLORS, trackColor, formatTime } from "@/lib/conference-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  session: Session;
  onOpen: (s: Session) => void;
  onSpeakerClick: (name: string) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

export function SessionCard({
  session,
  onOpen,
  onSpeakerClick,
  isSaved,
  onToggleSave,
}: SessionCardProps) {
  const typeInfo = TYPE_COLORS[session.type] ?? TYPE_COLORS.session;
  const startStr = session.startTime != null ? formatTime(session.startTime) : session.time.split("-")[0].trim();
  const endStr = session.endTime != null ? formatTime(session.endTime) : session.time.split("-")[1]?.trim() ?? "";
  const durStr = session.durationMinutes ? `${session.durationMinutes}m` : "";

  return (
    <Card
      className={cn(
        "group relative flex flex-col gap-2 p-4 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        "border-l-4",
        typeInfo.border
      )}
      onClick={() => onOpen(session)}
    >
      {/* Type badge + save button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn("font-medium", typeInfo.bg, typeInfo.text, typeInfo.border)}>
            <span className={cn("mr-1 inline-block size-1.5 rounded-full", typeInfo.dot)} />
            {typeInfo.label}
          </Badge>
          {session.status === "tentative" && (
            <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
              tentative
            </Badge>
          )}
          {session.track && (
            <Badge variant="outline" className={cn("text-xs", trackColor(session.track))}>
              {session.track}
            </Badge>
          )}
        </div>
        <Button
          variant={isSaved ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 shrink-0 gap-1.5 px-2.5 text-xs transition-colors",
            isSaved
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-background/80 text-muted-foreground hover:text-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(session.id);
          }}
          aria-label={isSaved ? "Remove from schedule" : "Add to schedule"}
          title={isSaved ? "Saved - click to remove" : "Add to My Schedule"}
        >
          {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          {isSaved ? "Saved" : "Add to Schedule"}
        </Button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
        {session.title}
      </h3>

      {/* Description (truncated) */}
      {session.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {session.description.replace(/\n+/g, " ")}
        </p>
      )}

      {/* Meta */}
      <div className="mt-auto flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3 shrink-0" />
          <span className="tabular-nums">{startStr}{endStr ? ` – ${endStr}` : ""}{durStr ? ` · ${durStr}` : ""}</span>
        </div>
        {session.room && (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3 shrink-0" />
            <span>{session.room}</span>
          </div>
        )}
        {session.speakers.length > 0 && (
          <div className="flex items-start gap-1.5">
            <Users className="size-3 shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-x-1">
              {session.speakers.map((sp, i) => (
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
                  {i < session.speakers.length - 1 && <span className="text-muted-foreground/60">,</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
