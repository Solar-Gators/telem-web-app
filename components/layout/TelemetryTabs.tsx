"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TelemetryData } from "@/lib/types";
import LiveStatsTab from "../pages/LiveStatsTab";
import StatsGraphTab from "../pages/StatsGraphTab";
import TrackFlareTab from "../pages/TrackFlareTab";
import AdminTab from "../pages/AdminTab";

interface TelemetryTabsProps {
  telemetryData: TelemetryData<number>;
  dateData: TelemetryData<Date>;
}

export default function TelemetryTabs({
  telemetryData,
  dateData,
}: TelemetryTabsProps) {
  return (
    <Tabs defaultValue="live-stats" className="w-full" suppressHydrationWarning>
      <TabsList
        className="grid w-full grid-cols-4 mb-6"
        suppressHydrationWarning
      >
        <TabsTrigger value="live-stats">Live Stats</TabsTrigger>
        <TabsTrigger value="stats-graph">Stats Graph</TabsTrigger>
        <TabsTrigger value="track-flare">Track Flare</TabsTrigger>
        <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
      </TabsList>

      {/* Live Stats Tab */}
      <TabsContent value="live-stats">
        <LiveStatsTab telemetryData={telemetryData} dateData={dateData} />
      </TabsContent>

      {/* Stats Graph Tab */}
      <TabsContent value="stats-graph">
        <StatsGraphTab />
      </TabsContent>

      {/* Track Flare Tab */}
      <TabsContent value="track-flare">
        <TrackFlareTab telemetryData={telemetryData} dateData={dateData} />
      </TabsContent>
      {/* Admin Dashboard */}
      <TabsContent value="admin">
        <AdminTab />
      </TabsContent>
    </Tabs>
  );
}
