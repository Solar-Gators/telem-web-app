"use client";

import useTelemetryData from "@/hooks/useTelemetryData";
import Header from "@/components/layout/Header";
import TelemetryTabs from "@/components/layout/TelemetryTabs";
import VerificationGuard from "@/components/auth/VerificationGuard";
import { getLatestTimestamp } from "@/lib/telemetry-utils";

function TelemetryContent() {
  const { data, dateData, loading, error } = useTelemetryData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <Header />
          <div className="text-center py-10">Loading telemetry data...</div>
        </div>
      </div>
    );
  }

  if (!data || !dateData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <Header />
          <div className="text-center py-10 text-red-500">
            Error: No telemetry data available
            {error && <p className="text-sm mt-2">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  const lastUpdated = getLatestTimestamp(dateData);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Header lastUpdated={lastUpdated} />
        <TelemetryTabs telemetryData={data} dateData={dateData} />
      </div>
    </div>
  );
}

export default function SolarCarTelemetry() {
  // todo add VerificationGuard back to enable auth
  return <TelemetryContent />;
}
