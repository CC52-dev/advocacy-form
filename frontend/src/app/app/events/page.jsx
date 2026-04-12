"use client";
import { EventsCardsView } from "./events-cards";
import { PageStatsRow } from "@/components/page-stats-row";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 h-full min-h-0 w-full">
      <div className="flex items-start justify-start flex-col h-full min-h-0 w-full">
        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-left py-2 sm:py-4 md:py-6 lg:py-8">
          Events
        </h1>

        <PageStatsRow section="events" />

        <EventsCardsView />
      </div>
    </div>
  );
}
