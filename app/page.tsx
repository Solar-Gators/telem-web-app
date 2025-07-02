"use client";

import useTelemetryData from "@/hooks/useTelemetryData";
import Header from "@/components/layout/Header";
import TelemetryTabs from "@/components/layout/TelemetryTabs";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function SolarCarTelemetry() {
  const { data, loading, error } = useTelemetryData();
  const { data: session } = useSession();

  if (!session)
    return (
      <div className="flex items-center justify-center h-screen">
        <Button onClick={() => signIn("google")}></Button>
      </div>
    );

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

  if (!data) {
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        <TelemetryTabs telemetryData={data} />
      </div>
    </div>
  );
}
