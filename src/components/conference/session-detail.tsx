"use client";

import { Session, TYPE_COLORS, trackColor, formatTime, Speaker } from "@/lib/conference-data";
import { assetPath } from "@/lib/asset-path";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, BookmarkCheck, Clock, MapPin, Calendar, ExternalLink, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionDetailProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  speakerMap: Map<string, Speaker>;
  onSpeakerClick: (name: string) => void;
}

export function SessionDetail({
  session,
  open,
  onOpenChange,
  isSaved,
  onToggleSave,
  speakerMap,
  onSpeakerClick,
}: SessionDetailProps) {
  if (!session) return null;
  const typeInfo = TYPE_COLORS[session.type] ?? TYPE_COLORS.session;
  const startStr = session.startTime != null ? formatTime(session.startTime) : "";
  const endStr = session.endTime != null ? formatTime(session.endTime) : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="p-6 pb-3 border-b">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
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
          <SheetTitle className="text-xl font-bold leading-tight pr-6">
            {session.title}
          </SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {session.day}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span className="tabular-nums">{startStr}{endStr ? ` – ${endStr}` : ""}{session.durationMinutes ? ` · ${session.durationMinutes}m` : ""}</span>
              </span>
              {session.room && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {session.room}
                </span>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 flex flex-col gap-6">
          {/* Save button */}
          <Button
            variant={isSaved ? "default" : "outline"}
            className={cn("w-fit gap-2", isSaved && "bg-emerald-600 hover:bg-emerald-700 text-white")}
            onClick={() => onToggleSave(session.id)}
          >
            {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
            {isSaved ? "Saved to My Schedule" : "Add to My Schedule"}
          </Button>

          {/* Description */}
          {session.description ? (
            <section>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Description</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {session.description}
              </div>
            </section>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No description available — this session may still be in development.
            </p>
          )}

          {/* Speakers */}
          {session.speakers.length > 0 && (
            <section>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                Speaker{session.speakers.length > 1 ? "s" : ""} ({session.speakers.length})
              </h4>
              <div className="flex flex-col gap-2">
                {session.speakers.map((name) => {
                  const sp = speakerMap.get(name);
                  return (
                    <button
                      type="button"
                      key={name}
                      onClick={() => onSpeakerClick(name)}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                    >
                      <Avatar className="size-10 shrink-0">
                        {sp?.photoUrl ? <AvatarImage src={assetPath(sp.photoUrl)} alt={name} /> : null}
                        <AvatarFallback className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                          {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-1">
                          {name}
                          <ExternalLink className="size-3 text-muted-foreground" />
                        </div>
                        {sp && (
                          <div className="text-xs text-muted-foreground">
                            {sp.role}{sp.role && sp.company ? " · " : ""}{sp.company}
                          </div>
                        )}
                        {sp?.bio && (
                          <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
                            {sp.bio}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* If no speakers but type indicates panel etc. */}
          {session.speakers.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
              <User className="size-4" />
              Speakers to be announced
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
