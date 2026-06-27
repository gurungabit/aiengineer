"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  normalizeSessions,
  normalizeSpeakers,
  Session,
  Speaker,
  SessionsPayload,
  SpeakersPayload,
  DAY_SHORT,
} from "@/lib/conference-data";
import { assetPath } from "@/lib/asset-path";
import {
  buildScheduleShareUrl,
  decodeScheduleIds,
  getSharedScheduleParam,
  SCHEDULE_SHARE_PARAM,
} from "@/lib/share-schedule";
import { useSavedSessions } from "@/lib/use-saved-sessions";
import { SessionsView } from "@/components/conference/sessions-view";
import { SpeakersView } from "@/components/conference/speakers-view";
import { MyScheduleView } from "@/components/conference/my-schedule-view";
import { InfoView } from "@/components/conference/info-view";
import { SessionDetail } from "@/components/conference/session-detail";
import { SpeakerDetail } from "@/components/conference/speaker-detail";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarDays, Users, Bookmark, Info, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type TabValue = "sessions" | "speakers" | "schedule" | "info";

export default function Home() {
  const [sessionsPayload, setSessionsPayload] = useState<SessionsPayload | null>(null);
  const [speakersPayload, setSpeakersPayload] = useState<SpeakersPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<TabValue>("sessions");
  const [openSession, setOpenSession] = useState<Session | null>(null);
  const [openSpeaker, setOpenSpeaker] = useState<Speaker | null>(null);
  const [sessionSheetOpen, setSessionSheetOpen] = useState(false);
  const [speakerSheetOpen, setSpeakerSheetOpen] = useState(false);
  const [sharedScheduleIds, setSharedScheduleIds] = useState<string[] | null>(null);
  const sharedScheduleHandledRef = useRef(false);

  const { saved, toggle, isSaved, hydrated, clearAll, replaceAll } = useSavedSessions();

  // Load data
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(assetPath("/data/sessions.json")).then((r) => r.json() as Promise<SessionsPayload>),
      fetch(assetPath("/data/speakers.json")).then((r) => r.json() as Promise<SpeakersPayload>),
    ])
      .then(([s, sp]) => {
        if (cancelled) return;
        setSessionsPayload(s);
        setSpeakersPayload(sp);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sessions: Session[] = useMemo(
    () => (sessionsPayload ? normalizeSessions(sessionsPayload) : []),
    [sessionsPayload]
  );
  const speakers: Speaker[] = useMemo(
    () => (speakersPayload ? normalizeSpeakers(speakersPayload) : []),
    [speakersPayload]
  );
  const speakerMap = useMemo(() => {
    const m = new Map<string, Speaker>();
    speakers.forEach((s) => m.set(s.name, s));
    return m;
  }, [speakers]);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return buildScheduleShareUrl(sharedScheduleIds ? new Set(sharedScheduleIds) : saved, sessions, window.location.href);
  }, [saved, sessions, sharedScheduleIds]);

  useEffect(() => {
    if (sharedScheduleHandledRef.current || sessions.length === 0 || typeof window === "undefined") {
      return;
    }

    sharedScheduleHandledRef.current = true;
    const encodedSchedule = getSharedScheduleParam(window.location);
    if (!encodedSchedule) return;

    const sharedIds = decodeScheduleIds(encodedSchedule, sessions);
    if (sharedIds.length === 0) return;

    const timeoutId = window.setTimeout(() => {
      setSharedScheduleIds(sharedIds);
      setTab("schedule");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [sessions]);

  // Handlers
  const handleOpenSession = (s: Session) => {
    setOpenSession(s);
    setSessionSheetOpen(true);
  };
  const handleSpeakerClick = (name: string) => {
    const sp = speakerMap.get(name);
    if (sp) {
      setOpenSpeaker(sp);
      setSpeakerSheetOpen(true);
      setSessionSheetOpen(false);
    }
  };
  const handleOpenSpeaker = (s: Speaker) => {
    setOpenSpeaker(s);
    setSpeakerSheetOpen(true);
  };
  const handleSessionClickFromSpeaker = (s: Session) => {
    setOpenSession(s);
    setSessionSheetOpen(true);
    setSpeakerSheetOpen(false);
  };
  const removeScheduleUrlParam = () => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
    url.searchParams.delete(SCHEDULE_SHARE_PARAM);
    if (hashParams.has(SCHEDULE_SHARE_PARAM)) url.hash = "";
    window.history.replaceState(null, "", url.toString());
  };
  const handleAddSharedSchedule = () => {
    if (!sharedScheduleIds) return;

    const next = new Set(saved);
    sharedScheduleIds.forEach((id) => next.add(id));
    replaceAll(next);
  };
  const handleCloseSharedSchedule = () => {
    setSharedScheduleIds(null);
    removeScheduleUrlParam();
  };
  const handleClearSchedule = () => {
    clearAll();
    setSharedScheduleIds(null);
    removeScheduleUrlParam();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading conference data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Failed to load</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const savedCount = hydrated ? saved.size : 0;
  const headerSubtitle = sessionsPayload
    ? `${sessionsPayload.dates} · ${sessionsPayload.location}`
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold leading-tight truncate">
                AI Engineer World&apos;s Fair 2026
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight truncate">
                {headerSubtitle} · {sessions.length} sessions · {speakers.length} speakers
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/30">
              Jun 28 – Jul 2
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
            <TabsList className="bg-transparent h-11 p-0 gap-1 w-full justify-start overflow-x-auto">
              <TabsTrigger
                value="sessions"
                className="gap-1.5 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
              >
                <CalendarDays className="size-4" />
                Sessions
              </TabsTrigger>
              <TabsTrigger
                value="speakers"
                className="gap-1.5 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
              >
                <Users className="size-4" />
                Speakers
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="gap-1.5 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
              >
                <Bookmark className="size-4" />
                My Schedule
                {savedCount > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center size-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold tabular-nums">
                    {savedCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="gap-1.5 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
              >
                <Info className="size-4" />
                Info
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsContent value="sessions" className="mt-0">
            <SessionsView
              sessions={sessions}
              speakerMap={speakerMap}
              onOpenSession={handleOpenSession}
              onSpeakerClick={handleSpeakerClick}
              isSaved={isSaved}
              onToggleSave={toggle}
            />
          </TabsContent>
          <TabsContent value="speakers" className="mt-0">
            <SpeakersView speakers={speakers} onOpen={handleOpenSpeaker} />
          </TabsContent>
          <TabsContent value="schedule" className="mt-0">
            <MyScheduleView
              sessions={sessions}
              savedIds={saved}
              onToggleSave={toggle}
              onClearAll={handleClearSchedule}
              onOpenSession={handleOpenSession}
              onBrowse={() => setTab("sessions")}
              shareUrl={shareUrl}
              sharedScheduleIds={sharedScheduleIds}
              onAddSharedSchedule={handleAddSharedSchedule}
              onCloseSharedSchedule={handleCloseSharedSchedule}
            />
          </TabsContent>
          <TabsContent value="info" className="mt-0">
            {sessionsPayload && speakersPayload && (
              <InfoView
                conference={sessionsPayload.conference}
                dates={sessionsPayload.dates}
                location={sessionsPayload.location}
                website={sessionsPayload.website}
                totalSessions={sessions.length}
                totalSpeakers={speakers.length}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>
            Built for browsing the{" "}
            <a
              href="https://ai.engineer/worldsfair"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              AI Engineer World&apos;s Fair 2026
            </a>
            .
          </span>
          <span className="tabular-nums">Schedule v{sessionsPayload?.scheduleVersion ?? "—"} · {DAY_SHORT.join(" / ")}</span>
        </div>
      </footer>

      {/* Detail sheets */}
      <SessionDetail
        session={openSession}
        open={sessionSheetOpen}
        onOpenChange={setSessionSheetOpen}
        isSaved={openSession ? isSaved(openSession.id) : false}
        onToggleSave={toggle}
        speakerMap={speakerMap}
        onSpeakerClick={handleSpeakerClick}
      />
      <SpeakerDetail
        speaker={openSpeaker}
        open={speakerSheetOpen}
        onOpenChange={setSpeakerSheetOpen}
        onSessionClick={handleSessionClickFromSpeaker}
        allSessions={sessions}
      />
    </div>
  );
}
