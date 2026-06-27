"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Ticket,
  Building,
  Hotel,
  Youtube,
  Twitter,
  Linkedin,
  ExternalLink,
  Layers,
  Building2,
} from "lucide-react";

interface InfoViewProps {
  conference: string;
  dates: string;
  location: string;
  website: string;
  totalSessions: number;
  totalSpeakers: number;
}

export function InfoView({
  conference,
  dates,
  location,
  website,
  totalSessions,
  totalSpeakers,
}: InfoViewProps) {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Hero card */}
      <Card className="p-6 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-background border-emerald-500/20">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">{conference}</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 text-emerald-600" />
              <span className="font-medium">{dates}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-emerald-600" />
              <span className="font-medium">{location}</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            The largest technical AI conference in the world — 5 days, 39 tracks, 100+ expo partners, and over 6,000 AI engineers, founders, and VPs of AI. Browse {totalSessions} sessions and {totalSpeakers} speakers in this app.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button asChild size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <a href={website} target="_blank" rel="noopener noreferrer">
                Official Site
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href="https://app.ai.engineer/e/ai-engineer-worlds-fair-2026/portal" target="_blank" rel="noopener noreferrer">
                <Ticket className="size-3.5" />
                Buy Tickets
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Schedule overview */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar className="size-4" />
          Schedule Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <DayCard day="Day 0" date="Sun Jun 28" title="New Engineer Orientation" details={["5:00 PM Registration", "7:00 PM NEO"]} />
          <DayCard day="Day 1" date="Mon Jun 29" title="Workshop Day" details={["10 rooms of workshops", "Welcome Reception", "Evening side events"]} />
          <DayCard day="Day 2" date="Tue Jun 30" title="Keynotes + Breakouts" details={["90m + 60m keynotes", "10 parallel tracks", "Onsite networking"]} />
          <DayCard day="Day 3" date="Wed Jul 1" title="World Cup Day" details={["Keynotes + tracks", "World Cup VIP Suite", "Startup Night"]} />
          <DayCard day="Day 4" date="Thu Jul 2" title="Final Day" details={["Keynotes + tracks", "Last Chance Expo", "Startup Battlefield"]} />
        </div>
      </section>

      {/* Venue */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Building className="size-4" />
          Venue — Moscone West Convention Center
        </h3>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Three levels of programming at Moscone West in San Francisco, CA.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <FloorCard floor="1st Floor" items={["Registration", "Expo", "Food", "Evening Socials"]} />
            <FloorCard floor="2nd Floor" items={["Breakout Rooms", "Tracks 1-9", "Track M"]} />
            <FloorCard floor="3rd Floor" items={["Keynotes", "Main Stage", "VIP Rooms"]} />
          </div>
        </Card>
      </section>

      {/* Tickets */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Ticket className="size-4" />
          Tickets
        </h3>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Full refunds up to one month before the event. Group discounts auto-applied.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <TicketCard tier="Leadership" price="$2,399" access="Keynote + leadership + workshops + expo" />
            <TicketCard tier="Engineering + Workshops" price="$1,999" access="All engineering + workshops + expo" />
            <TicketCard tier="Engineering" price="$1,499" access="All engineering tracks + expo" />
            <TicketCard tier="Expo Explorer" price="$299" access="Expo hall access only" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">5+ tickets: 10% off</Badge>
            <Badge variant="outline">10+ tickets: 15% off</Badge>
            <Badge variant="outline">15+ tickets: 20% off</Badge>
          </div>
        </Card>
      </section>

      {/* Hotels */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Hotel className="size-4" />
          Hotels
        </h3>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Discounted room blocks close June 6, 2026. World Cup in the US means rooms sell out fast.</p>
          <div className="flex flex-col gap-2">
            <HotelRow name="San Francisco Marriott Marquis" status="Available" url="https://book.passkey.com/e/51164469" />
            <HotelRow name="Parc 55 San Francisco" status="Sold Out" />
            <HotelRow name="InterContinental San Francisco" status="Available" url="https://www.ihg.com/hotels/us/en/find-hotels/select-roomrate?fromRedirect=true&qSrt=sAV&qIta=99801505&icdv=99801505&qSlH=sfohb&qCiD=27&qCiMy=052026&qCoD=04&qCoMy=062026&qGrpCd=ae3&qAAR=6CBARC&qRtP=6CBARC&setPMCookies=true&qSHBrC=IC&qDest=888%20Howard%20Street,%20San%20Francisco,%20CA,%20US&showApp=true&adjustMonth=false&srb_u=1&qRmFltr=" />
          </div>
        </Card>
      </section>

      {/* Connect */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Layers className="size-4" />
          Connect
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="https://youtube.com/@aidotengineer" target="_blank" rel="noopener noreferrer">
              <Youtube className="size-4" /> YouTube
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="https://x.com/aiDotEngineer" target="_blank" rel="noopener noreferrer">
              <Twitter className="size-4" /> Twitter/X
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="https://www.linkedin.com/company/aidotengineer/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="size-4" /> LinkedIn
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="https://ai.engineer/newsletter" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" /> Newsletter
            </a>
          </Button>
        </div>
      </section>

      <p className="text-xs text-muted-foreground text-center pt-4">
        Data from <a href="https://ai.engineer/worldsfair/llms-full.md" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">ai.engineer/worldsfair/llms-full.md</a>. Schedule v4498 — sessions marked "tentative" are still being confirmed.
      </p>
    </div>
  );
}

function DayCard({ day, date, title, details }: { day: string; date: string; title: string; details: string[] }) {
  return (
    <Card className="p-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Badge className="bg-emerald-600 text-white">{day}</Badge>
        <span className="text-xs text-muted-foreground tabular-nums">{date}</span>
      </div>
      <h4 className="font-medium text-sm">{title}</h4>
      <ul className="text-xs text-muted-foreground flex flex-col gap-0.5">
        {details.map((d) => <li key={d}>· {d}</li>)}
      </ul>
    </Card>
  );
}

function FloorCard({ floor, items }: { floor: string; items: string[] }) {
  return (
    <div className="p-3 rounded-md border bg-muted/30">
      <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
        <Building2 className="size-3.5 text-emerald-600" />
        {floor}
      </div>
      <ul className="text-xs text-muted-foreground flex flex-col gap-0.5">
        {items.map((i) => <li key={i}>· {i}</li>)}
      </ul>
    </div>
  );
}

function TicketCard({ tier, price, access }: { tier: string; price: string; access: string }) {
  return (
    <div className="p-3 rounded-md border bg-muted/30 flex flex-col gap-1">
      <div className="text-sm font-semibold">{tier}</div>
      <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{price}</div>
      <div className="text-xs text-muted-foreground">{access}</div>
    </div>
  );
}

function HotelRow({ name, status, url }: { name: string; status: string; url?: string }) {
  const soldOut = status.toLowerCase() === "sold out";
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-md border bg-background">
      <span className="text-sm font-medium">{name}</span>
      {url && !soldOut ? (
        <Button asChild size="sm" variant="outline" className="h-7 gap-1 text-xs">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {status} <ExternalLink className="size-3" />
          </a>
        </Button>
      ) : (
        <Badge variant={soldOut ? "destructive" : "secondary"} className="text-xs">{status}</Badge>
      )}
    </div>
  );
}
