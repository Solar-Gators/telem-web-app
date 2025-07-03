"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TelemetryData } from "@/lib/types";
import LiveStatsTab from "../pages/LiveStatsTab";
import StatsGraphTab from "../pages/StatsGraphTab";
import TrackFlareTab from "../pages/TrackFlareTab";

interface TelemetryTabsProps {
  telemetryData: TelemetryData<number>;
}

export default function TelemetryTabs({ telemetryData }: TelemetryTabsProps) {
  return (
    <Tabs defaultValue="live-stats" className="w-full" suppressHydrationWarning>
      <TabsList
        className="grid w-full grid-cols-3 mb-6"
        suppressHydrationWarning
      >
        <TabsTrigger value="live-stats">Live Stats</TabsTrigger>
        <TabsTrigger value="stats-graph">Stats Graph</TabsTrigger>
        <TabsTrigger value="track-flare">Track Flare</TabsTrigger>
      </TabsList>

      {/* Live Stats Tab */}
      <TabsContent value="live-stats">
        <LiveStatsTab telemetryData={telemetryData} />
      </TabsContent>

      {/* Stats Graph Tab */}
      <TabsContent value="stats-graph">
        <StatsGraphTab telemetryData={telemetryData} />
      </TabsContent>

      {/* Track Flare Tab */}
      <TabsContent value="track-flare">
        <TrackFlareTab telemetryData={telemetryData} />
      </TabsContent>
    </Tabs>
  );
}
