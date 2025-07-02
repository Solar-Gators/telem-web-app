"use client";

import useTelemetryData from "@/hooks/useTelemetryData";
import Header from "@/components/layout/Header";
import TelemetryTabs from "@/components/layout/TelemetryTabs";
import SignIn from "./login";
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button";

export default function SolarCarTelemetry() {
  const { data, loading, error } = useTelemetryData();

  return <Button onClick={() => signIn("google")} />;

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
