"use client";

import useTelemetryData from "@/hooks/useTelemetryData";
import Header from "@/components/layout/Header";
import TelemetryTabs from "@/components/layout/TelemetryTabs";

export default function SolarCarTelemetry() {
  const telemetryData = useTelemetryData();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        <TelemetryTabs telemetryData={telemetryData} />
      </div>
    </div>
  );
}
